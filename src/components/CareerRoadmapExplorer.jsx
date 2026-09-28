import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCareerRoadmap, getAllCareerRoadmaps } from "../data/careerRoadmaps";
import { careers } from "../data/careers";
import { isAssessmentUnlocked, matchGitHubEvidence, getProficiencyTier } from "../utils/skillCalculations";
import ProgressBar from "./ProgressBar";

const categoryColors = {
  frontend: "bg-teal-50 text-teal-800 border-teal-200",
  backend: "bg-cyan-50 text-cyan-800 border-cyan-200",
  language: "bg-amber-50 text-amber-800 border-amber-200",
  data: "bg-indigo-50 text-indigo-800 border-indigo-200",
  tools: "bg-stone-100 text-stone-800 border-stone-200",
};

const levelBadgeStyles = {
  "Level 1 • Beginner": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Level 2 • Intermediate": "bg-sky-50 text-sky-800 border-sky-200",
  "Level 3 • Intermediate": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Level 4 • Project Ready": "bg-amber-50 text-amber-900 border-amber-200",
};

export default function CareerRoadmapExplorer({
  activeCareerId,
  onCareerChange,
  userSelectedCareer,
  userSkills = [],
  projects = [],
  externalCourses = [],
  githubConnected = false,
  githubUsername = "",
  decayFeedback = {},
  isAdaptive = false,
  _hasCompletedCourse = false,
  onSetTargetCareer,
  onStartAssessment,
  onOpenCreditModal,
  onRemoveExternalCourse,
  onLearn,
  onQuiz,
  onTask,
  onRefresh,
}) {
  const navigate = useNavigate();
  const allRoadmaps = useMemo(() => getAllCareerRoadmaps(), []);
  const roadmap = getCareerRoadmap(activeCareerId);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState("all");
  const [expandedProjects, setExpandedProjects] = useState({ 1: true, 2: true, 3: true, 4: true });

  const isUserTarget = userSelectedCareer === roadmap.careerId;

  // Map user skills by id for fast lookup
  const userSkillMap = useMemo(() => {
    const map = {};
    if (userSkills && Array.isArray(userSkills)) {
      userSkills.forEach((s) => {
        map[s.id] = s;
      });
    }
    return map;
  }, [userSkills]);

  // Calculate career mastery stats if user is on this career
  const careerStats = useMemo(() => {
    if (!isUserTarget || !userSkills.length) return null;
    const careerDef = careers.find((c) => c.id === roadmap.careerId);
    if (!careerDef) return null;

    let totalScore = 0;
    let completedSkills = 0;
    const requiredSkills = careerDef.requiredSkills || [];

    requiredSkills.forEach((req) => {
      const userSkill = userSkillMap[req.skillId];
      const cur = userSkill ? Math.min(100, Math.max(0, userSkill.currentScore)) : 0;
      totalScore += cur;
      if (cur >= req.requiredScore) completedSkills += 1;
    });

    const avgScore = requiredSkills.length ? Math.min(100, Math.round(totalScore / requiredSkills.length)) : 0;

    return {
      avgScore,
      completedSkills,
      totalSkills: requiredSkills.length,
      readinessPercent: avgScore,
    };
  }, [isUserTarget, userSkills, roadmap.careerId, userSkillMap]);

  // Filter external courses credited for this career's skills
  const careerSkillIds = useMemo(() => {
    const careerDef = careers.find((c) => c.id === roadmap.careerId);
    return new Set(careerDef?.requiredSkills?.map((s) => s.skillId) || []);
  }, [roadmap.careerId]);

  const relevantExternalCourses = useMemo(() => {
    return externalCourses.filter((c) => careerSkillIds.has(c.skillId));
  }, [externalCourses, careerSkillIds]);

  // Synced GitHub projects
  const gitHubSyncedProjects = useMemo(() => {
    return (projects || []).filter((p) => p.source === "github" || p.verified);
  }, [projects]);

  // Phase Analysis: completion and active focus phase
  const phaseAnalysis = useMemo(() => {
    const map = {};
    roadmap.phases.forEach((phase) => {
      let masteredCount = 0;
      let totalGap = 0;
      phase.skills.forEach((s) => {
        const curScore = Math.min(100, Math.max(0, userSkillMap[s.skillId]?.currentScore ?? 0));
        if (curScore >= s.targetScore) masteredCount += 1;
        totalGap += Math.max(0, s.targetScore - curScore);
      });
      const isMastered = masteredCount === phase.skills.length && phase.skills.length > 0;
      const progressPercent = phase.skills.length > 0 ? Math.round((masteredCount / phase.skills.length) * 100) : 0;
      map[phase.phaseNumber] = {
        masteredCount,
        totalCount: phase.skills.length,
        isMastered,
        progressPercent,
        totalGap,
      };
    });
    return map;
  }, [roadmap.phases, userSkillMap]);

  const activeFocusPhaseNumber = useMemo(() => {
    const unmastered = roadmap.phases.find((p) => !phaseAnalysis[p.phaseNumber]?.isMastered);
    return unmastered ? unmastered.phaseNumber : 1;
  }, [roadmap.phases, phaseAnalysis]);

  const toggleProject = (phaseNum) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  const filteredPhases = roadmap.phases.filter((p) => {
    if (selectedPhaseFilter === "all") return true;
    return p.phaseNumber === Number(selectedPhaseFilter);
  });

  return (
    <div className="w-full">
      {/* 1. Career Switcher Tabs */}
      <div className="flex flex-wrap gap-2.5 p-1.5 bg-paper rounded-2xl border border-line mb-8 shadow-sm">
        {allRoadmaps.map((r) => {
          const isSelected = r.careerId === activeCareerId;
          const isTarget = userSelectedCareer === r.careerId;

          return (
            <button
              key={r.careerId}
              onClick={() => {
                onCareerChange(r.careerId);
                setSelectedPhaseFilter("all");
              }}
              className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 focus-ring ${
                isSelected
                  ? "bg-white text-ink-950 shadow-md border border-line/80 font-semibold"
                  : "text-ink-600 hover:text-ink-900 hover:bg-white/50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {r.careerId === "fullstack" ? "💻" : r.careerId === "aiml" ? "🧠" : "📊"}
                </span>
                <div>
                  <div className="font-display text-sm font-bold leading-tight">{r.title}</div>
                  <div className="text-xs text-ink-500 font-normal mt-0.5">{r.duration} • 4 Simple Phases</div>
                </div>
              </div>
              {isTarget && (
                <span className="ml-2 px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-500 text-white shadow-sm shrink-0">
                  Target
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Target Career Hero Banner (Beginner & Intermediate Friendly) */}
      <div className={`relative overflow-hidden rounded-2xl border ${roadmap.borderAccent} ${roadmap.bannerBg} p-6 sm:p-8 mb-8 shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${roadmap.pillBadge}`}>
                {roadmap.badge}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                🌱 {roadmap.difficulty}
              </span>
              {isUserTarget && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white flex items-center gap-1">
                  <span>✓</span> Your Active Target Career
                </span>
              )}
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-ink-950 tracking-tight">
              {roadmap.title}
            </h2>
            <p className="text-sm sm:text-base text-ink-700 font-medium mt-1">
              {roadmap.subtitle}
            </p>
            <p className="text-sm text-ink-600 mt-2 leading-relaxed">
              {roadmap.overview}
            </p>

            {/* Quick Metrics Bar (Clean, Beginner Friendly) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-line/60">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-ink-400 block">Est. Timeline</span>
                <span className="font-display font-extrabold text-sm sm:text-base text-ink-900">{roadmap.duration}</span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-ink-400 block">Weekly Pacing</span>
                <span className="font-display font-extrabold text-sm sm:text-base text-ink-900">{roadmap.weeklyEffort}</span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-ink-400 block">Prerequisites</span>
                <span className="font-display font-bold text-xs sm:text-sm text-ink-800">Starts from zero</span>
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-ink-400 block">Target Score</span>
                <span className="font-display font-extrabold text-sm sm:text-base text-ink-900">{roadmap.targetReadiness} Mastery</span>
              </div>
            </div>
          </div>

          {/* Action / Enrollment Box */}
          <div className="bg-white/90 backdrop-blur-sm border border-line rounded-xl p-5 lg:min-w-[260px] shadow-sm flex flex-col justify-between">
            {isUserTarget ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-700 uppercase tracking-wide">Your Progress</span>
                  <span className="text-sm font-extrabold text-teal-600">
                    {careerStats ? `${careerStats.completedSkills}/${careerStats.totalSkills} Skills` : "Active"}
                  </span>
                </div>
                {careerStats && (
                  <div className="mb-4">
                    <ProgressBar value={careerStats.avgScore} />
                    <span className="text-[11px] text-ink-500 mt-1 block">
                      {careerStats.avgScore}% career readiness achieved
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onOpenCreditModal()}
                    className="w-full py-2 px-3 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200 flex items-center justify-center gap-1.5"
                  >
                    <span>🎓</span>
                    <span>Credit Outside Course</span>
                  </button>
                  {(() => {
                    const careerDef = careers.find((c) => c.id === roadmap.careerId);
                    const isUnlocked = isAssessmentUnlocked(userSkills, careerDef);
                    const currentReadiness = careerStats ? careerStats.avgScore : 0;
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            onStartAssessment(roadmap.careerId);
                          }
                        }}
                        disabled={!isUnlocked}
                        className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                          isUnlocked
                            ? "text-ink-700 bg-paper hover:bg-line/40 border-line cursor-pointer"
                            : "text-amber-900 bg-amber-50 border-amber-300 cursor-not-allowed opacity-90"
                        }`}
                      >
                        {isUnlocked
                          ? "Take Career Assessment →"
                          : `🔒 Reach above 80% to unlock (${currentReadiness}%)`}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-1">Explore Mode</div>
                <div className="text-sm font-extrabold text-ink-900 mb-2">Want to learn this path?</div>
                <p className="text-xs text-ink-600 mb-4 leading-normal">
                  Set {roadmap.title} as your goal to calibrate lessons, practice quizzes, and real-world projects.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onSetTargetCareer(roadmap.careerId)}
                    className="w-full py-2.5 px-4 text-xs font-display font-bold text-white bg-ink-900 hover:bg-ink-950 rounded-lg shadow-sm transition-all focus-ring"
                  >
                    Set as Target Career
                  </button>
                  <button
                    onClick={() => onOpenCreditModal()}
                    className="w-full py-2 px-3 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200 flex items-center justify-center gap-1"
                  >
                    <span>🎓</span>
                    <span>Already learned a skill?</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Outside Courses Credited (If any exist) */}
      {relevantExternalCourses.length > 0 && (
        <div className="bg-white border border-teal-200 rounded-2xl p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <h3 className="font-display font-bold text-sm text-ink-950">
                Your Credited Outside Courses ({relevantExternalCourses.length})
              </h3>
            </div>
            <button
              onClick={() => onOpenCreditModal()}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              + Add Another Course
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relevantExternalCourses.map((c) => (
              <div
                key={c.id}
                className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white">
                      {c.platform}
                    </span>
                    <span className="text-xs font-bold text-ink-900 truncate max-w-[150px]">
                      {c.skillName}
                    </span>
                  </div>
                  <div className="text-xs text-ink-800 font-medium line-clamp-1">{c.courseTitle}</div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-1">
                    Score credited: {c.scoreAwarded}% • {c.date}
                  </div>
                </div>
                {onRemoveExternalCourse && (
                  <button
                    onClick={() => onRemoveExternalCourse(c.id)}
                    title="Remove this course"
                    className="text-ink-400 hover:text-red-600 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GitHub Repositories Calibration Banner */}
      {(githubConnected || gitHubSyncedProjects.length > 0) ? (
        <div className="bg-gradient-to-r from-teal-900 to-ink-950 text-white rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                🐙
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-base text-white">
                    GitHub Repositories Live Calibrated
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-400 text-teal-950">
                    {gitHubSyncedProjects.length} Repos Synced
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                  Your practical code from GitHub (@{githubUsername || "student"}) has been evaluated. Skills with verified projects (like{" "}
                  {Array.from(new Set(gitHubSyncedProjects.flatMap((p) => p.skills || []))).slice(0, 3).join(", ") || "development"}
                  ) have received proficiency boosts and are fast-tracked across roadmap milestones.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/learning-history?tab=github")}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-ink-950 transition-colors shrink-0 shadow-xs"
            >
              View Synced Repos →
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-paper border border-line rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐙</span>
            <div>
              <span className="font-bold text-ink-900 block">Have existing repositories on GitHub?</span>
              <span className="text-ink-600">Connect your GitHub profile to auto-credit skills from your real code and adapt your roadmap.</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/learning-history?tab=github")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-ink-900 text-white hover:bg-ink-950 transition-colors shrink-0"
          >
            Connect GitHub Profile →
          </button>
        </div>
      )}

      {/* 4. Phase Filter & Quick Tip for Beginners */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-extrabold text-xl text-ink-950">Step-by-Step Learning Phases</h3>
            {isAdaptive && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ⚡ Adaptive Priority Order Active
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {isAdaptive
              ? "Skills in each phase are dynamically ordered by your knowledge level, gaps, and GitHub experience."
              : "Start with Phase 1 fundamentals and build up confidence project by project."}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => onOpenCreditModal()}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors shrink-0"
          >
            🎓 + Credit Outside Course
          </button>
          <div className="h-4 w-px bg-line/80 mx-1 shrink-0" />
          <button
            onClick={() => setSelectedPhaseFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-ring ${
              selectedPhaseFilter === "all"
                ? "bg-ink-900 text-white shadow-sm"
                : "bg-white text-ink-600 border border-line hover:border-ink-400"
            }`}
          >
            All Phases (4)
          </button>
          {roadmap.phases.map((p) => {
            const pInfo = phaseAnalysis[p.phaseNumber];
            return (
              <button
                key={p.phaseNumber}
                onClick={() => setSelectedPhaseFilter(String(p.phaseNumber))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap focus-ring flex items-center gap-1.5 ${
                  selectedPhaseFilter === String(p.phaseNumber)
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-ink-600 border border-line hover:border-teal-300"
                }`}
              >
                <span>Phase {p.phaseNumber}</span>
                {pInfo?.isMastered && (
                  <span className="text-[10px] text-emerald-400">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Phase Timeline Cards */}
      <div className="relative space-y-6">
        {filteredPhases.map((phase) => {
          const isProjectOpen = !!expandedProjects[phase.phaseNumber];
          const pInfo = phaseAnalysis[phase.phaseNumber] || { masteredCount: 0, totalCount: phase.skills.length, isMastered: false, progressPercent: 0 };
          const isCurrentFocus = phase.phaseNumber === activeFocusPhaseNumber && !pInfo.isMastered;

          // Adaptively sort skills in this phase: incomplete high gaps first, decayed prioritized, mastered last
          const displayedSkills = isAdaptive
            ? [...phase.skills].sort((a, b) => {
                const curA = Math.min(100, Math.max(0, userSkillMap[a.skillId]?.currentScore ?? 0));
                const curB = Math.min(100, Math.max(0, userSkillMap[b.skillId]?.currentScore ?? 0));
                const masteredA = curA >= a.targetScore;
                const masteredB = curB >= b.targetScore;
                if (masteredA !== masteredB) return masteredA ? 1 : -1;

                const decayedA = decayFeedback[a.skillId] === "lacking" || decayFeedback[a.skillId] === "rusty";
                const decayedB = decayFeedback[b.skillId] === "lacking" || decayFeedback[b.skillId] === "rusty";
                if (decayedA !== decayedB) return decayedA ? -1 : 1;

                const gapA = Math.max(0, a.targetScore - curA);
                const gapB = Math.max(0, b.targetScore - curB);
                return gapB - gapA;
              })
            : phase.skills;

          return (
            <div
              key={phase.phaseNumber}
              className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-sm transition-all hover:shadow-md relative overflow-hidden ${
                isCurrentFocus
                  ? "border-amber-300 ring-2 ring-amber-400/20"
                  : pInfo.isMastered
                  ? "border-emerald-300/80"
                  : "border-line"
              }`}
            >
              {/* Top accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                  pInfo.isMastered
                    ? "from-emerald-500 to-teal-500"
                    : phase.phaseNumber === 1
                    ? "from-teal-400 to-emerald-500"
                    : phase.phaseNumber === 2
                    ? "from-emerald-500 to-cyan-500"
                    : phase.phaseNumber === 3
                    ? "from-cyan-500 to-indigo-500"
                    : "from-amber-400 to-orange-500"
                }`}
              />

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4 pt-1">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm ${
                      pInfo.isMastered
                        ? "bg-emerald-600 text-white"
                        : isCurrentFocus
                        ? "bg-amber-500 text-ink-950 font-black"
                        : "bg-ink-950 text-white"
                    }`}
                  >
                    {pInfo.isMastered ? "✓" : phase.phaseNumber}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-display font-extrabold text-lg sm:text-xl text-ink-950">
                        {phase.phaseTitle}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelBadgeStyles[phase.level] || "bg-stone-50 text-stone-700"}`}>
                        {phase.level}
                      </span>
                      {pInfo.isMastered ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <span>✓</span> Phase Mastered
                        </span>
                      ) : isCurrentFocus ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                          <span>⚡</span> Active Focus Phase
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-ink-500 font-semibold flex items-center gap-1.5">
                      <span>⏱️ {phase.duration}</span>
                      <span>•</span>
                      <span>{phase.skills.length} Skills Taught</span>
                      <span>•</span>
                      <span className={pInfo.isMastered ? "text-emerald-700 font-bold" : "text-ink-600"}>
                        {pInfo.masteredCount} of {pInfo.totalCount} Mastered ({pInfo.progressPercent}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-ink-700 leading-relaxed mb-6">
                {phase.summary}
              </p>

              {/* Skills in this Phase */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-2">
                  <span>Skills You'll Learn in Phase {phase.phaseNumber}</span>
                  {isAdaptive && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Adaptive Gap Sequencing
                    </span>
                  )}
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedSkills.map((skill) => {
                    const userSkill = userSkillMap[skill.skillId];
                    const hasUserScore = isUserTarget && userSkill !== undefined;
                    const curScore = hasUserScore ? Math.min(100, Math.max(0, Math.round(userSkill.currentScore))) : null;
                    const meetsTarget = curScore !== null && curScore >= skill.targetScore;
                    const ghEvidence = matchGitHubEvidence(skill.skillId, projects);
                    const tier = curScore !== null ? getProficiencyTier(curScore, skill.targetScore) : null;
                    const isDecayed = decayFeedback[skill.skillId] === "lacking" || decayFeedback[skill.skillId] === "rusty";
                    const extCert = relevantExternalCourses.find((c) => (c.skillId || "").toLowerCase() === skill.skillId.toLowerCase());

                    return (
                      <div
                        key={skill.skillId}
                        className={`bg-paper/70 border rounded-xl p-3.5 flex flex-col justify-between transition-colors ${
                          meetsTarget
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isDecayed
                            ? "border-amber-300 bg-amber-50/30"
                            : "border-line/80 hover:border-teal-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <span className="font-display font-bold text-sm text-ink-900">
                              {skill.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {tier && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${tier.badgeColor}`}>
                                  {tier.icon} {tier.label}
                                </span>
                              )}
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${categoryColors[skill.category] || "bg-gray-100"}`}>
                                {skill.category}
                              </span>
                            </div>
                          </div>

                          {/* GitHub Evidence Tag */}
                          {ghEvidence.hasEvidence && (
                            <div className="mb-2">
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full"
                                title={`Verified in ${ghEvidence.topRepo}`}
                              >
                                <span>🐙</span>
                                <span>{ghEvidence.badgeText} ({ghEvidence.topRepo})</span>
                              </span>
                            </div>
                          )}

                          {/* Decay Alert Tag */}
                          {isDecayed && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                <span>⏳</span>
                                <span>Knowledge Fading (Decayed)</span>
                              </span>
                            </div>
                          )}

                          {/* Outside Credited Course Tag */}
                          {extCert && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                <span>🎓</span>
                                <span>{extCert.platform} Certified</span>
                              </span>
                            </div>
                          )}

                          {/* Plain English explanation or GitHub note */}
                          {ghEvidence.hasEvidence ? (
                            <p className="text-[11px] text-teal-900 bg-teal-50/60 border border-teal-100 p-2 rounded-lg mb-2.5 leading-snug">
                              🐙 <strong>GitHub Proven:</strong> Code detected in <em>{ghEvidence.topRepo}</em>. Basic prerequisites bypassed.
                            </p>
                          ) : skill.simpleExplanation ? (
                            <p className="text-[11px] text-ink-600 mb-2.5 line-clamp-2">
                              💡 {skill.simpleExplanation}
                            </p>
                          ) : null}

                          <div className="flex items-baseline justify-between text-xs mb-1.5">
                            <span className="text-ink-500">Target Score</span>
                            <span className="font-semibold text-ink-800">{skill.targetScore}%</span>
                          </div>

                          {hasUserScore ? (
                            <div className="mb-2">
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-ink-600 font-medium">Your Score</span>
                                <span className={`font-bold ${meetsTarget ? "text-teal-600" : isDecayed ? "text-amber-700" : "text-amber-600"}`}>
                                  {curScore}% {meetsTarget ? "✓ Mastered" : `(${Math.max(0, skill.targetScore - curScore)}% gap)`}
                                </span>
                              </div>
                              <ProgressBar
                                value={curScore}
                                max={skill.targetScore}
                                color={meetsTarget ? "teal" : isDecayed ? "amber" : "amber"}
                              />
                            </div>
                          ) : (
                            <div className="mb-2">
                              <div className="h-1.5 w-full bg-line/60 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500/40 rounded-full" style={{ width: `${skill.targetScore}%` }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quick Action Links */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-line/60">
                          {isDecayed && onRefresh && (
                            <button
                              onClick={() => onRefresh(skill.skillId)}
                              className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-colors"
                            >
                              Refresh ⏳
                            </button>
                          )}
                          {onLearn && (
                            <button
                              onClick={() => onLearn(skill.skillId)}
                              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline"
                            >
                              Learn →
                            </button>
                          )}
                          {onQuiz && (
                            <button
                              onClick={() => onQuiz(skill.skillId)}
                              className="text-[11px] font-bold text-ink-700 hover:text-teal-700 bg-white hover:bg-teal-50 px-2 py-0.5 rounded border border-line transition-colors"
                            >
                              Quiz ⚡
                            </button>
                          )}
                          {onTask && (
                            <button
                              onClick={() => onTask(skill.skillId)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                                ghEvidence.hasEvidence
                                  ? "bg-teal-50 text-teal-800 border border-teal-200 font-bold"
                                  : "text-ink-600 hover:text-ink-900"
                              }`}
                            >
                              Task 🛠️
                            </button>
                          )}
                          {onOpenCreditModal && (
                            <button
                              onClick={() => onOpenCreditModal(skill.skillId)}
                              className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 ml-auto"
                              title="Already took an outside course on this skill?"
                            >
                              + Outside
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Topics List with direct Quiz trigger */}
              <div className="mb-6 bg-paper/40 rounded-xl p-4 border border-line/60">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    What You'll Learn Step-by-Step
                  </h4>
                  <span className="text-[11px] text-teal-700 font-semibold hidden sm:inline">
                    Click any topic to launch its 10-question quiz + coding challenge
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {phase.keyTopics.map((topic, i) => {
                    const primarySkillId = phase.skills[0]?.skillId || "javascript";
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-line/80 hover:border-teal-400 hover:shadow-2xs transition-all group"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-teal-600 font-bold shrink-0 mt-0.5">✓</span>
                          <span className="font-semibold text-ink-900 group-hover:text-teal-900 line-clamp-1">
                            {topic}
                          </span>
                        </div>
                        {onQuiz && (
                          <button
                            onClick={() => onQuiz(primarySkillId, topic)}
                            className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 border border-teal-200 rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                            title={`Take 10-question quiz on ${topic}`}
                          >
                            <span>⚡</span>
                            <span>Quiz</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Project Card */}
              {phase.milestoneProject && (
                <div className="border border-line rounded-xl bg-gradient-to-br from-paper via-white to-amber-50/20 p-4 sm:p-5">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => toggleProject(phase.phaseNumber)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {phase.phaseNumber === 4 ? "🏆" : "🛠️"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-extrabold text-sm sm:text-base text-ink-950">
                            {phase.milestoneProject.title}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {phase.milestoneProject.type}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">
                          Phase {phase.phaseNumber} Hands-on Milestone Project
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-ink-400 font-bold ml-2">
                      {isProjectOpen ? "Hide Details ▲" : "Show Details ▼"}
                    </span>
                  </div>

                  {isProjectOpen && (
                    <div className="mt-4 pt-4 border-t border-line/70">
                      <p className="text-xs sm:text-sm text-ink-700 leading-relaxed mb-3">
                        {phase.milestoneProject.description}
                      </p>
                      <div>
                        <span className="text-[11px] uppercase font-bold text-ink-500 tracking-wider block mb-1.5">
                          What You Will Build & Deliver:
                        </span>
                        <div className="grid sm:grid-cols-3 gap-2">
                          {phase.milestoneProject.deliverables.map((del, dIdx) => (
                            <div
                              key={dIdx}
                              className="text-xs text-ink-800 bg-white border border-line rounded-lg p-2.5 flex items-start gap-2 shadow-xs"
                            >
                              <span className="text-teal-600 font-bold">•</span>
                              <span>{del}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
