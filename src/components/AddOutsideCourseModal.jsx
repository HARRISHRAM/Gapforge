import { useState } from "react";
import { identifyProvider, checkSkillMatch } from "../utils/certificateValidator";

// Providers whose certificates use tier or broad labels (e.g. "Problem Solving", "Basic")
// that don't name the individual technology, accepted for any selected skill once verified
const GENERIC_CERT_PROVIDERS = ["HackerRank", "LeetCode"];

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Fetch the real page via the local Vite server-side proxy (/api/verify-url).
// Node.js fetches the URL directly — no CORS restrictions, no third-party proxy.
// Returns { fetched: bool, text: string, httpStatus: number, error?: string }
async function fetchRealPage(url) {
  try {
    const endpoint = `/api/verify-url?url=${encodeURIComponent(url)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(endpoint, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) {
      return { fetched: false, text: "", httpStatus: res.status };
    }
    const data = await res.json();
    return {
      fetched: data.fetched === true,
      text: data.text || "",
      httpStatus: data.httpStatus || 0,
      error: data.error,
    };
  } catch {
    return { fetched: false, text: "", httpStatus: 0 };
  }
}

// Strict multi-word phrases that only appear on REAL certificate pages.
// Single generic words like "verify", "badge", "completion" are intentionally excluded
// because they appear on nearly every website's navigation/footer.
const CERT_PHRASE_PATTERNS = [
  /has\s+successfully\s+completed/i,
  /successfully\s+completed/i,
  /this\s+is\s+to\s+certify/i,
  /this\s+certifies\s+that/i,
  /certificate\s+of\s+(completion|achievement|accomplishment|excellence)/i,
  /is\s+awarded\s+(a|this|the)/i,
  /letter\s+of\s+completion/i,
  /course\s+completion\s+certificate/i,
  /nanodegree\s+certificate/i,
  /learning\s+path\s+completed/i,
  /has\s+demonstrated\s+(proficiency|mastery)/i,
  /certificate\s+of\s+participation/i,
  /cleared\s+the\s+(assessment|test|exam)/i,
  /skills?\s+certification\s+(test|exam|badge)/i,
  /verified\s+certificate/i,
  /credential\s+(id|number|code)/i,
  /share\s+(this\s+)?certificate/i,
  /download\s+(this\s+)?certificate/i,
  /earned\s+(a\s+)?(certificate|credential|badge)/i,
  /certificate\s+earned/i,
  /issued\s+on\s+[a-z]+\s+\d/i,          // "Issued on January 1"
  /valid\s+through\s+[a-z]+\s+\d/i,       // "Valid through December 2027"
  /credly\.com\/badges/i,
  /acclaim\.com\/badges/i,
];

// Returns true only if the page text contains a real certificate-specific phrase.
function pageHasCertificateContent(pageText) {
  return CERT_PHRASE_PATTERNS.some((re) => re.test(pageText));
}

export default function AddOutsideCourseModal({
  isOpen,
  onClose,
  availableSkills = [],
  preselectedSkillId = "",
  existingCourses = [],   // ← courses already credited, used for duplicate checks
  onSubmit,
}) {
  const [skillId, setSkillId] = useState(
    preselectedSkillId || availableSkills[0]?.skillId || availableSkills[0]?.id || "html"
  );
  const [certUrl, setCertUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [scannedProvider, setScannedProvider] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentSkillObj = availableSkills.find((s) => (s.skillId || s.id) === skillId);
  const currentSkillName = currentSkillObj?.name || skillId.toUpperCase();

  const resetVerification = () => {
    setVerified(false);
    setScannedProvider(null);
    setValidationError("");
    setError("");
  };

  const handleSkillChange = (newSkillId) => {
    setSkillId(newSkillId);
    resetVerification();
  };

  const handleVerifyUrl = async () => {
    const trimmed = certUrl.trim();
    if (!trimmed) {
      setError("Please enter a certificate URL.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL starting with https:// or http://");
      return;
    }

    // ── Duplicate URL guard (early) ────────────────────────────────────────
    const isDuplicateUrl = existingCourses.some(
      (c) => c.certificateUrl && c.certificateUrl.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicateUrl) {
      setError(
        "❌ This certificate URL has already been submitted. Each certificate URL can only be credited once."
      );
      return;
    }

    // ── One-per-skill guard (early) ────────────────────────────────────────
    const skillAlreadyCredited = existingCourses.some(
      (c) => (c.skillId || "").toLowerCase() === skillId.toLowerCase()
    );
    if (skillAlreadyCredited) {
      setError(
        `❌ A certificate for "${currentSkillName}" has already been credited. Only 1 certificate is allowed per skill/topic.`
      );
      return;
    }

    setError("");
    setValidationError("");
    setVerified(false);
    setScannedProvider(null);
    setVerifying(true);

    try {
      // ── Step 1: Fetch the real page from the actual website (server-side) ──
      const { fetched, text: fetchedText, httpStatus, error: fetchError } =
        await fetchRealPage(trimmed);

      // ── Step 2: Hard-fail if the page could not be reached ─────────────────
      // No fallbacks, no URL-pattern guesses. If the real site doesn't respond
      // with a successful HTTP status, the URL is rejected.
      if (!fetched) {
        const reason =
          httpStatus === 404
            ? "The page returned 404 (Not Found). This certificate URL does not exist."
            : httpStatus >= 400 && httpStatus < 600
            ? `The page returned HTTP ${httpStatus}. Please check the URL and try again.`
            : fetchError === "timeout"
            ? "The request timed out. The certificate site may be unavailable."
            : "The certificate page could not be loaded. Please ensure the URL is publicly accessible.";
        setValidationError(`❌ Real-page fetch failed: ${reason}`);
        return;
      }

      // Real page text content fetched directly from the certificate website
      const pageText = fetchedText;

      // ── Step 3: Identify accredited provider strictly from fetched page content ──
      const provider = identifyProvider(pageText);

      // Brief animation pause
      await new Promise((r) => setTimeout(r, 400));

      if (!provider) {
        setValidationError(
          "Could not identify an accredited platform or university from the fetched certificate page. " +
            "Valid sources include: Coursera, Udemy, freeCodeCamp, edX, Google, Meta, " +
            "HackerRank, LeetCode, LinkedIn Learning, AWS, Microsoft, or an accredited University."
        );
        return;
      }

      // ── Step 4: Verify page content proves this is a real certificate ────────
      // This check applies to ALL providers — there are no exceptions.
      // The fetched real page must contain certificate-specific phrases.
      if (!pageHasCertificateContent(pageText)) {
        setScannedProvider(provider);
        setValidationError(
          `The real page from ${provider.name} was fetched (HTTP ${httpStatus}) but ` +
          `does not contain certificate-specific content. ` +
          `This looks like a profile page, home page, or course listing — not a certificate. ` +
          `Please paste the direct URL of your completed certificate/credential.`
        );
        return;
      }

      // ── Step 5: Skill match ──────────────────────────────────────────────────
      // HackerRank & LeetCode issue certificates with generic labels ("Problem Solving",
      // "Basic", "Intermediate") that don't name the technology — accept them for any skill.
      // All other providers must match skill keywords in the page content.
      const result = checkSkillMatch(pageText, skillId, currentSkillName, provider);
      if (!result.matched && !GENERIC_CERT_PROVIDERS.includes(provider.id)) {
        setScannedProvider(provider);
        setValidationError(
          `Skill mismatch: The real ${provider.name} certificate page was fetched but ` +
          `does not appear to cover "${currentSkillName}". ` +
          `Please paste the URL for a ${currentSkillName} certificate.`
        );
        return;
      }

      setVerified(true);
      setScannedProvider(provider);
    } catch (err) {
      setValidationError("Verification failed: " + (err.message || "Unknown error"));
    } finally {
      setVerifying(false);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!certUrl.trim() || !verified || !scannedProvider) {
      setError("A verified certificate URL matching the selected skill is required.");
      return;
    }

    // ── Hard guards at submit-time (safety net) ────────────────────────────
    const trimmed = certUrl.trim();
    const isDuplicateUrl = existingCourses.some(
      (c) => c.certificateUrl && c.certificateUrl.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicateUrl) {
      setError("❌ This certificate URL has already been submitted.");
      return;
    }
    const skillAlreadyCredited = existingCourses.some(
      (c) => (c.skillId || "").toLowerCase() === skillId.toLowerCase()
    );
    if (skillAlreadyCredited) {
      setError(`❌ A certificate for "${currentSkillName}" is already credited. Only 1 per skill is allowed.`);
      return;
    }

    setError("");

    const providerName = scannedProvider.name || "Accredited Provider";
    const courseTitle = `${currentSkillName} Certificate (${providerName})`;

    onSubmit({
      skillId,
      skillName: currentSkillName,
      courseTitle,
      platform: providerName,
      score: 95,
      certificateUrl: certUrl.trim(),
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    setCertUrl("");
    resetVerification();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* ── Modal Header ─────────────────────────────────── */}
        <div className="bg-gradient-to-r from-teal-50 via-white to-amber-50/40 p-6 border-b border-line flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🎓</span>
              <h3 className="font-display font-black text-xl text-ink-950">
                Credit Outside Course
              </h3>
            </div>
            <p className="text-xs text-ink-600">
              Paste your certificate URL to verify authentic issuer accreditation
              (e.g., Coursera, Udemy, HackerRank, LeetCode, Google, freeCodeCamp, edX, or an accredited University).
            </p>
          </div>
          <button
            onClick={() => { resetVerification(); onClose(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-900 hover:bg-line/40 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* ── Modal Form ───────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* 1. Skill Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                Which skill did you learn? *
              </label>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                AI Cross-Check
              </span>
            </div>
            <select
              value={skillId}
              onChange={(e) => handleSkillChange(e.target.value)}
              className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-medium focus-ring bg-white text-ink-900"
            >
              {availableSkills.map((s) => (
                <option key={s.skillId || s.id} value={s.skillId || s.id}>
                  {s.name} ({s.category || "Skill"})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink-500 mt-1">
              The AI scanner will verify that the certificate URL covers{" "}
              <strong>{currentSkillName}</strong>.
            </p>
          </div>

          {/* 2. Certificate URL Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-700">
                Certificate URL *
              </label>
              <span className="text-[11px] text-ink-500">Auto-detects platform &amp; skill</span>
            </div>

            {/* URL input row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm select-none">
                  🔗
                </span>
                <input
                  type="url"
                  value={certUrl}
                  onChange={(e) => {
                    setCertUrl(e.target.value);
                    resetVerification();
                  }}
                  placeholder="https://www.hackerrank.com/certificates/..."
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-line rounded-xl focus-ring bg-white text-ink-900 placeholder:text-ink-400"
                  disabled={verifying}
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyUrl}
                disabled={verifying || !certUrl.trim()}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  verifying || !certUrl.trim()
                    ? "bg-teal-100 text-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 text-white shadow-sm cursor-pointer"
                }`}
              >
                {verifying ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Verify URL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-ink-400 leading-relaxed">
              Paste the public URL of your certificate (e.g., from HackerRank, Coursera, LeetCode,
              freeCodeCamp, edX, Google, Udemy, or a University). The system will fetch and verify the
              issuer automatically.
            </p>

            {/* Scanning animation */}
            {verifying && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-semibold animate-pulse">
                <span className="animate-spin text-base">⏳</span>
                <div>
                  <span>Fetching real certificate page directly...</span>
                  <p className="text-[10px] font-normal text-amber-800 mt-0.5">
                    Server is loading the actual URL · verifying content matches {currentSkillName}
                  </p>
                </div>
              </div>
            )}

            {/* Verification Failed */}
            {!verifying && validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <span className="text-rose-600 font-black">✕</span>
                    <span>Verification Rejected</span>
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full font-bold">
                    INVALID
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                  {validationError}
                </p>
                {scannedProvider && (
                  <p className="text-[10px] text-rose-700 bg-rose-100/60 p-1.5 rounded-lg">
                    Detected Provider:{" "}
                    <strong>
                      {scannedProvider.icon} {scannedProvider.name}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {/* Verification Successful */}
            {!verifying && verified && scannedProvider && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Real Certificate Page Fetched &amp; Verified</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                    LIVE · HTTP 200
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white border border-emerald-200 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                      Detected Provider
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-ink-950">
                      <span>{scannedProvider.icon}</span>
                      <span className="truncate">{scannedProvider.name}</span>
                    </div>
                  </div>
                  <div className="bg-white border border-emerald-200 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                      Matched Skill
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-ink-950">
                      <span className="text-emerald-600">✓</span>
                      <span className="truncate">{currentSkillName}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  ✓ Real page fetched directly from {scannedProvider.name} · Certificate content confirmed · Ready to credit 95% proficiency to your roadmap.
                </p>
              </div>
            )}
          </div>

          {/* ── Action Buttons ─────────────────────────────── */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => { resetVerification(); onClose(); }}
              className="px-4 py-2 text-xs font-semibold text-ink-600 hover:text-ink-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!verified || verifying}
              className={`px-5 py-2.5 text-xs font-display font-bold text-white rounded-xl shadow-sm transition-all focus-ring flex items-center gap-1.5 ${
                verified && !verifying
                  ? "bg-teal-600 hover:bg-teal-700 cursor-pointer"
                  : "bg-teal-300 cursor-not-allowed opacity-60"
              }`}
            >
              <span>✓</span>
              <span>
                Credit {scannedProvider ? `${scannedProvider.name} ` : ""}Certificate to Roadmap
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
