import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { SyncGitHubModal } from "../components/LearningHistoryModals";
import { fetchStudentGitHubData } from "../services/githubService";
import { getCareerById } from "../data/careers";
import { isAssessmentUnlocked, getCareerReadinessScore, ASSESSMENT_UNLOCK_THRESHOLD } from "../utils/skillCalculations";
import { useApp } from "../App";

const fields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "college", label: "College", type: "text", required: true },
  { name: "degree", label: "Degree", type: "text", required: true },
  {
    name: "educationLevel",
    label: "Education level",
    type: "select",
    options: ["High school", "Undergraduate", "Postgraduate"],
    required: true,
  },
  {
    name: "githubUrl",
    label: "GitHub Profile / Repo URL",
    type: "github",
    placeholder: "https://github.com/your-username or repo link",
    required: false,
  },
  {
    name: "currentSkills",
    label: "Current skills",
    type: "text",
    placeholder: "e.g. HTML, CSS, basic JavaScript",
    required: false,
  },
  {
    name: "experienceLevel",
    label: "Experience level",
    type: "select",
    options: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  {
    name: "learningGoal",
    label: "Learning goal",
    type: "text",
    placeholder: "What do you want to become?",
    required: true,
  },
];

export default function Profile() {
  const { state, update, logout, syncGitHubRepos } = useApp();
  const navigate = useNavigate();

  // Initialize form from current state (always up-to-date)
  const [form, setForm] = useState(
    state.profile || {
      name: state.user?.name || "",
      college: "",
      degree: "",
      educationLevel: "",
      githubUrl: "",
      currentSkills: "",
      experienceLevel: "",
      learningGoal: "",
    }
  );
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [syncingUrl, setSyncingUrl] = useState(false);
  const [syncUrlToast, setSyncUrlToast] = useState("");

  // Keep form in sync if state.profile changes externally
  useEffect(() => {
    if (state.profile) {
      setForm((prev) => ({ ...prev, ...state.profile }));
    }
  }, [state.profile]);

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    // Instant update to global state so overview panel refreshes live
    update({ profile: { ...(state.profile || {}), [name]: value } });
    setSaved(false);
  };

  const handleSyncFromProfileUrl = async () => {
    const raw = form.githubUrl?.trim();
    if (!raw) {
      setSyncUrlToast("Please enter your GitHub profile or repository URL first.");
      setTimeout(() => setSyncUrlToast(""), 4000);
      return;
    }
    setSyncingUrl(true);
    setSyncUrlToast("");

    try {
      const data = await fetchStudentGitHubData(raw);
      if (data && data.repos && data.repos.length > 0) {
        syncGitHubRepos(data.username, data.repos);
        setSyncUrlToast(`✓ Synced ${data.repos.length} repositories from @${data.username}!`);
        setTimeout(() => setSyncUrlToast(""), 5000);
      } else {
        setSyncUrlToast("No repositories found for this GitHub link.");
        setTimeout(() => setSyncUrlToast(""), 4000);
      }
    } catch (e) {
      setSyncUrlToast(e.message || "Failed to sync GitHub profile.");
      setTimeout(() => setSyncUrlToast(""), 4000);
    } finally {
      setSyncingUrl(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    fields.forEach((f) => {
      if (f.required && !form[f.name]?.trim()) newErrors[f.name] = "This field is required.";
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    update({ profile: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Live values from state (updated instantly)
  const projects =
    state.projects?.length > 0
      ? state.projects
      : (state.githubRepos || []).map((r, i) => ({
          id: `gh_${i}`,
          projectName: r.name,
          description: r.description || "GitHub repository",
          technologies: r.language ? [r.language] : ["JavaScript"],
          skills: [r.language || "JavaScript"],
          repoUrl: r.html_url || `https://github.com/${state.githubUsername || "developer"}/${r.name}`,
          source: "github",
          verified: true,
        }));
  const skills = state.skills || [];
  const topicsCompleted = state.topicsCompleted || [];
  const quizResults = state.quizResults || [];
  const taskResults = state.taskResults || [];

  const career = getCareerById(state.selectedCareer) || getCareerById("fullstack");
  const readinessScore = getCareerReadinessScore(skills, career);
  const assessmentUnlocked = isAssessmentUnlocked(skills, career);

  // Average skill score (capped at 100%)
  const avgSkillScore =
    skills.length > 0
      ? Math.min(100, Math.round(skills.reduce((sum, s) => sum + Math.min(100, Math.max(0, s.currentScore || 0)), 0) / skills.length))
      : 0;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink-900">Student Profile &amp; Privacy</h1>
          <p className="text-ink-600 mt-1">Manage your educational background and transparent learning profile.</p>
        </div>

        {state.user ? (
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 self-start sm:self-auto">
            Log out →
          </Button>
        ) : (
          <Button variant="accent" size="sm" onClick={() => navigate("/login")} className="self-start sm:self-auto">
            Log in
          </Button>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="max-w-2xl mb-6 p-4 rounded-xl border border-teal-200 bg-teal-50/80 shadow-2xs">
        <div className="flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">Privacy-Friendly Learning Profile</h3>
            <p className="text-xs sm:text-sm text-teal-900 mt-1 font-medium">
              "Your information is used to personalize your learning experience."
            </p>
            <p className="text-[11px] text-teal-800/80 mt-1">
              We collect and index only verified learning signals (GitHub repositories, skills, and assessment progress). No external email scanning or invasive tracking is performed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
        {/* Left: Editable Student Profile Form */}
        <div>
          <Card>
            <h2 className="font-display font-bold text-base text-ink-950 mb-4">Personal Information</h2>

            {saved && (
              <div className="mb-4 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800 flex items-center gap-2">
                ✓ Profile saved successfully!
              </div>
            )}

            {syncUrlToast && (
              <div className="mb-4 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between">
                <span>{syncUrlToast}</span>
                <button
                  type="button"
                  onClick={() => setSyncUrlToast("")}
                  className="text-emerald-700 hover:text-emerald-950 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1">
                    {f.label}
                    {f.required && <span className="text-amber-500"> *</span>}
                  </label>

                  {f.type === "select" ? (
                    <select
                      value={form[f.name] || ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      className="w-full border border-line rounded-lg px-3.5 py-2 text-sm focus-ring bg-white"
                    >
                      <option value="">Select...</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.type === "github" ? (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-ink-400 font-mono text-xs">🔗</span>
                          <input
                            type="text"
                            placeholder={f.placeholder}
                            value={form[f.name] || ""}
                            onChange={(e) => handleChange(f.name, e.target.value)}
                            className="w-full border border-line rounded-lg pl-8 pr-3 py-2 text-sm focus-ring bg-white font-mono"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSyncFromProfileUrl}
                          disabled={syncingUrl || !form[f.name]?.trim()}
                          className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 border-slate-900 shrink-0 text-xs"
                        >
                          <span>🐙</span>
                          <span>{syncingUrl ? "Syncing..." : "Sync URL"}</span>
                        </Button>
                      </div>
                      <p className="text-[11px] text-ink-500">
                        Paste your GitHub profile link (e.g. <code>https://github.com/username</code>) or repo link and click <strong>Sync URL</strong>.
                      </p>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.name] || ""}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      className="w-full border border-line rounded-lg px-3.5 py-2 text-sm focus-ring bg-white"
                    />
                  )}

                  {errors[f.name] && (
                    <p className="text-xs text-rose-600 mt-1">{errors[f.name]}</p>
                  )}
                </div>
              ))}

              {/* Live preview under form */}
              {form.name && (
                <div className="mt-1 p-3 bg-paper/60 rounded-xl border border-line text-xs text-ink-600">
                  <span className="font-bold text-ink-900">{form.name}</span>
                  {form.college && <span> · {form.college}</span>}
                  {form.degree && <span> · {form.degree}</span>}
                  {form.educationLevel && <span> · {form.educationLevel}</span>}
                  {state.githubConnected && (
                    <span className="text-teal-700 font-mono"> · @{state.githubUsername}</span>
                  )}
                </div>
              )}

              <Button type="submit" variant="accent" className="mt-2 self-start font-bold">
                Save Profile &amp; Continue
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Learning Profile Overview — updates instantly */}
        <div className="space-y-6">
          {/* Transparent Collection Summary Card */}
          <Card className="p-5">
            <h3 className="font-display font-bold text-ink-950 text-base mb-1">
              Your Learning Profile Overview
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              What the adaptive engine currently knows about your learning progress:
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Personal Info Rows */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <span className="font-semibold text-ink-800">Student Name:</span>
                <span className="font-bold text-teal-800">
                  {state.profile?.name || state.user?.name || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">College / Institution:</span>
                <span className="font-bold text-ink-900">{state.profile?.college || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Degree:</span>
                <span className="font-bold text-ink-900">{state.profile?.degree || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Education Level:</span>
                <span className="font-bold text-ink-900">{state.profile?.educationLevel || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">GitHub Profile:</span>
                <span className="font-bold text-teal-800 font-mono">
                  {state.githubConnected ? `@${state.githubUsername}` : (form.githubUrl ? "Linked in Form" : "Not connected")}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Experience Level:</span>
                <span className="font-bold text-ink-900">{state.profile?.experienceLevel || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Target Career Goal:</span>
                <span className="font-bold text-teal-800">{state.selectedCareer || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Learning Goal:</span>
                <span className="font-bold text-ink-900 max-w-[55%] text-right truncate">
                  {state.profile?.learningGoal || "—"}
                </span>
              </div>

              <div className="h-px bg-line my-1" />

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Calibrated Skills Tracked:</span>
                <span className="font-bold text-ink-900">
                  {skills.length} skills {skills.length > 0 && <span className="text-teal-700">· avg {avgSkillScore}%</span>}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Topics Completed:</span>
                <span className="font-bold text-ink-900">{topicsCompleted.length} topics</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">GitHub Projects:</span>
                <span className="font-bold text-ink-900">
                  {projects.length} projects
                  {state.githubConnected && (
                    <span className="ml-1 text-teal-700 font-mono">(@{state.githubUsername})</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-line">
                <span className="font-semibold text-ink-800">Quiz &amp; Task History:</span>
                <span className="font-bold text-ink-900">
                  {quizResults.length + taskResults.length} attempts recorded
                </span>
              </div>

              {/* Assessment unlock status */}
              <div
                className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  assessmentUnlocked
                    ? "bg-teal-50 border-teal-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <span className="font-semibold text-ink-800">Assessment Status:</span>
                <span className={`font-bold ${assessmentUnlocked ? "text-teal-700" : "text-amber-700"}`}>
                  {assessmentUnlocked ? "🔓 Unlocked" : `🔒 Locked (need above ${ASSESSMENT_UNLOCK_THRESHOLD}% · now ${readinessScore}%)`}
                </span>
              </div>
            </div>
          </Card>

          {/* Student Learning History Section — ONLY GitHub */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-ink-950 text-base">Student Learning History</h3>
                <p className="text-xs text-ink-500">Verified coding repositories from your GitHub profile</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGitHubModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 border-slate-900 text-xs"
              >
                <span>🐙</span>
                <span>{state.githubConnected ? "Sync More Repos" : "Sync GitHub"}</span>
              </Button>
            </div>

            {state.githubConnected && (
              <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Connected: <strong className="font-mono">@{state.githubUsername}</strong></span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-200 px-2 py-0.5 rounded-full">
                  {projects.length} Repos Synced
                </span>
              </div>
            )}

            <div className="space-y-2.5">
              {projects.length > 0 ? (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-paper/60 border border-line flex items-start justify-between text-xs hover:border-teal-300 transition-colors"
                  >
                    <div className="min-w-0 mr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-ink-950 font-mono truncate">{p.projectName}</span>
                        {p.skills?.[0] && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                            {p.skills[0]}
                          </span>
                        )}
                      </div>
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-teal-700 hover:underline block truncate max-w-xs font-mono"
                        >
                          {p.repoUrl.replace("https://github.com/", "")}
                        </a>
                      )}
                    </div>
                    <span className="font-semibold text-teal-700 text-[10px] bg-teal-50 border border-teal-200 px-2 py-1 rounded-md shrink-0">
                      GitHub Verified
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-xl border border-dashed border-teal-200 bg-teal-50/40 text-center space-y-2">
                  <span className="text-3xl block">🐙</span>
                  <p className="text-xs font-bold text-ink-900">
                    No GitHub repositories synced yet
                  </p>
                  <p className="text-[11px] text-ink-600 max-w-sm mx-auto">
                    Paste your GitHub URL in the form on the left or click below to sync your profile.
                  </p>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setIsGitHubModalOpen(true)}
                    className="mt-2 text-xs"
                  >
                    Connect &amp; Sync GitHub Profile →
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* GitHub Sync Modal Only */}
      <SyncGitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSync={syncGitHubRepos}
      />
    </Layout>
  );
}
