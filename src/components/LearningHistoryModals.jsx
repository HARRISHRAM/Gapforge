import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { parseGitHubInput, fetchStudentGitHubData } from "../services/githubService";
import { validateCertificateFile } from "../utils/certificateValidator";

/**
 * SyncGitHubModal:
 * Allows student to enter:
 * - GitHub Profile URL (e.g. https://github.com/sidharth)
 * - GitHub Repository URL (e.g. https://github.com/sidharth/portfolio)
 * - Username or handle (e.g. @sidharth or sidharth)
 */
export function SyncGitHubModal({ isOpen, onClose, onSync }) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewRepos, setPreviewRepos] = useState(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleFetch = async () => {
    if (!inputVal.trim()) {
      setError("Please enter your GitHub profile URL, repository URL, or username.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const data = await fetchStudentGitHubData(inputVal);
      setPreviewRepos(data.repos);
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub repositories.");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSync = async (overrideInput) => {
    const raw = overrideInput || inputVal;
    if (!raw.trim()) {
      setError("Please enter your GitHub profile URL, repository URL, or username.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const data = await fetchStudentGitHubData(raw);
      if (data && data.repos && data.repos.length > 0) {
        onSync(data.username, data.repos);
        setSyncSuccess(true);
        setTimeout(() => {
          setSyncSuccess(false);
          setPreviewRepos(null);
          setInputVal("");
          onClose();
        }, 1000);
      } else {
        setError("No public repositories could be found for this input.");
      }
    } catch (err) {
      setError(err.message || "Failed to sync GitHub profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewRepos || previewRepos.length === 0) return;
    const { username } = parseGitHubInput(inputVal);
    const cleanUser = username || "developer";
    onSync(cleanUser, previewRepos);
    setSyncSuccess(true);
    setTimeout(() => {
      setSyncSuccess(false);
      setPreviewRepos(null);
      setInputVal("");
      onClose();
    }, 1000);
  };

  const sampleUrls = [
    { label: "@alexrivers", val: "alexrivers" },
    { label: "https://github.com/octocat", val: "https://github.com/octocat" },
    { label: "https://github.com/facebook/react", val: "https://github.com/facebook/react" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Projects from GitHub Profile">
      <div className="space-y-4">
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed flex items-start gap-2.5">
          <span className="text-base">🐙</span>
          <div>
            <span className="font-bold block">GitHub Profile &amp; Repo Sync</span>
            <p className="mt-0.5">
              Paste your <strong>GitHub profile URL</strong> (e.g. <code>https://github.com/username</code>), a <strong>repository URL</strong>, or your username. Repositories will be validated and imported directly to your profile.
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}

        {syncSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>Successfully synced repositories to your student learning profile!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
            GitHub URL or Username *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-ink-400 font-mono text-xs">🔗</span>
              <input
                type="text"
                placeholder="https://github.com/username or @username"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDirectSync()}
                className="w-full border border-line rounded-lg pl-8 pr-3 py-2 text-sm focus-ring bg-white font-mono text-ink-900"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetch}
              disabled={loading || syncSuccess}
            >
              {loading ? "Checking..." : "Preview"}
            </Button>
          </div>

          {/* Quick example URL suggestions */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] text-ink-400 font-semibold">Examples:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setInputVal(s.val);
                  handleDirectSync(s.val);
                }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-paper hover:bg-teal-50 hover:text-teal-700 border border-line transition-colors font-mono"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Repository Preview Area */}
        {previewRepos && (
          <div className="space-y-3 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                Found {previewRepos.length} Repositories
              </span>
              <span className="text-[11px] text-teal-700 font-semibold">Ready to Import</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {previewRepos.map((repo, i) => (
                <div key={i} className="p-2.5 rounded-xl border border-line bg-paper/60 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-ink-950 font-mono truncate">{repo.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-600 line-clamp-1">{repo.description}</p>
                  </div>
                  <div className="text-right shrink-0 text-xs text-ink-500 font-semibold">
                    ⭐ {repo.stars}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading || syncSuccess}>
            Cancel
          </Button>

          {previewRepos ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleConfirmImport}
              disabled={loading || syncSuccess}
            >
              {loading ? "Importing..." : `Import ${previewRepos.length} Projects to Profile →`}
            </Button>
          ) : (
            <Button
              variant="accent"
              size="sm"
              onClick={() => handleDirectSync()}
              disabled={loading || syncSuccess || !inputVal.trim()}
              className="flex items-center gap-1.5"
            >
              <span>🐙</span>
              <span>{loading ? "Syncing..." : "Sync & Import Repositories →"}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * Course Modal: Requires PDF Certificate Upload & Verification Check
 * "Courses collect the certification as PDF and check then we can calculate the skill gap."
 */
export function AddCourseModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    courseName: "",
    platform: "Coursera",
    skill: "",
    score: 85,
    status: "Completed",
    completionYear: new Date().getFullYear().toString(),
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedPdf, setVerifiedPdf] = useState(false);
  const [error, setError] = useState("");

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid certificate document in PDF format (.pdf).");
      return;
    }
    setError("");
    setPdfFile(file);
    setVerifying(true);
    setVerifiedPdf(false);

    validateCertificateFile(file)
      .then((res) => {
        setVerifying(false);
        if (res.valid) {
          setVerifiedPdf(true);
          setError("");
        } else {
          setVerifiedPdf(false);
          setError(res.reason || "The uploaded certificate is invalid or appears blank.");
        }
      })
      .catch((err) => {
        setVerifying(false);
        setVerifiedPdf(false);
        setError("Failed to verify certificate: " + (err.message || "Unknown error"));
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseName.trim() || !form.skill.trim()) {
      setError("Course name and primary skill are required.");
      return;
    }
    if (!verifiedPdf) {
      setError("A verified PDF Certificate is required to confirm coursework and calculate your skill gap.");
      return;
    }

    onAdd({
      id: `course_${Date.now()}`,
      courseName: form.courseName.trim(),
      platform: form.platform,
      skill: form.skill.trim(),
      score: Number(form.score) || 85,
      status: "Completed",
      completionYear: form.completionYear,
      certificateFile: pdfFile?.name || "Certificate_Verified.pdf",
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    setForm({
      courseName: "",
      platform: "Coursera",
      skill: "",
      score: 85,
      status: "Completed",
      completionYear: new Date().getFullYear().toString(),
    });
    setPdfFile(null);
    setVerifiedPdf(false);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Completed Course & Verify Certificate">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}

        <div>
          <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
            Course Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Meta Front-End Developer Specialization"
            value={form.courseName}
            onChange={(e) => setForm({ ...form, courseName: e.target.value })}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
            >
              <option value="Coursera">Coursera</option>
              <option value="Udemy">Udemy</option>
              <option value="edX">edX</option>
              <option value="freeCodeCamp">freeCodeCamp</option>
              <option value="University Course">University Course</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
              Skill Topic *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React or JavaScript"
              value={form.skill}
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
            />
          </div>
        </div>

        {/* Required PDF Certificate Upload & Check */}
        <div className="p-3.5 rounded-xl border border-line bg-paper/60 space-y-2">
          <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider">
            Certificate Document (PDF Required) *
          </label>
          <p className="text-[11px] text-ink-500">
            Upload your course completion certificate (.pdf). We verify the issuer accreditation and score to calculate your skill gap.
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
          />

          {verifying && (
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5 mt-2 animate-pulse">
              <span>⏳</span>
              <span>Running PDF Certificate Verification check...</span>
            </p>
          )}

          {verifiedPdf && (
            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Verified: {pdfFile?.name} (Authentic Issuer Signature)</span>
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                Pass
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-line flex justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="submit" disabled={!verifiedPdf}>
            Verify & Calculate Skill Gap →
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Certification Modal: Requires PDF Upload and Verification Check
 */
export function AddCertificationModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    certificationName: "",
    issuingOrg: "",
    skill: "",
    year: new Date().getFullYear().toString(),
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedPdf, setVerifiedPdf] = useState(false);
  const [error, setError] = useState("");

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document (.pdf).");
      return;
    }
    setError("");
    setPdfFile(file);
    setVerifying(true);
    setVerifiedPdf(false);

    validateCertificateFile(file)
      .then((res) => {
        setVerifying(false);
        if (res.valid) {
          setVerifiedPdf(true);
          setError("");
        } else {
          setVerifiedPdf(false);
          setError(res.reason || "The uploaded certification document is invalid or empty.");
        }
      })
      .catch((err) => {
        setVerifying(false);
        setVerifiedPdf(false);
        setError("Failed to verify certification: " + (err.message || "Unknown error"));
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.certificationName.trim() || !form.issuingOrg.trim()) {
      setError("Certification name and issuing organization are required.");
      return;
    }
    if (!verifiedPdf) {
      setError("Please upload and verify your official certification PDF.");
      return;
    }

    onAdd({
      id: `cert_${Date.now()}`,
      certificationName: form.certificationName.trim(),
      issuingOrg: form.issuingOrg.trim(),
      skill: form.skill.trim() || "Professional Engineering",
      year: form.year,
      pdfName: pdfFile?.name || "Credential.pdf",
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    setForm({
      certificationName: "",
      issuingOrg: "",
      skill: "",
      year: new Date().getFullYear().toString(),
    });
    setPdfFile(null);
    setVerifiedPdf(false);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Verified Certificate (PDF)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{error}</p>}

        <div>
          <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
            Certification Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AWS Certified Developer Associate"
            value={form.certificationName}
            onChange={(e) => setForm({ ...form, certificationName: e.target.value })}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
            Issuing Organization *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Amazon Web Services, Google Cloud, Linux Foundation"
            value={form.issuingOrg}
            onChange={(e) => setForm({ ...form, issuingOrg: e.target.value })}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
              Primary Skill Demonstrated
            </label>
            <input
              type="text"
              placeholder="e.g. Cloud Architecture"
              value={form.skill}
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
              Year Issued
            </label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring bg-white"
            />
          </div>
        </div>

        {/* PDF Certificate Upload */}
        <div className="p-3.5 rounded-xl border border-line bg-paper/60 space-y-2">
          <label className="block text-xs font-bold text-ink-900 uppercase tracking-wider">
            Upload Certificate PDF *
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
          />

          {verifying && (
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5 mt-2 animate-pulse">
              <span>⏳</span>
              <span>Validating credential signature with issuer registry...</span>
            </p>
          )}

          {verifiedPdf && (
            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Verified: {pdfFile?.name}</span>
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
                Credential Valid
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-line flex justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="submit" disabled={!verifiedPdf}>
            Save Verified Certificate
          </Button>
        </div>
      </form>
    </Modal>
  );
}
