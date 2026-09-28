import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import BackButton from "../components/BackButton";
import CareerRoadmapExplorer from "../components/CareerRoadmapExplorer";
import AddOutsideCourseModal from "../components/AddOutsideCourseModal";
import RoadmapCard from "../components/RoadmapCard";
import Button from "../components/Button";
import { getCareerById } from "../data/careers";
import { buildAdaptiveRoadmap } from "../utils/skillCalculations";
import { loadUserDecayFeedback } from "../utils/knowledgeDecay";
import { useApp } from "../App";

export default function AdaptiveRoadmap() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCareerId = searchParams.get("career") || state.selectedCareer || "fullstack";
  const [viewTab, setViewTab] = useState("phased"); // "phased" | "queue" | "story"
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditSkillId, setCreditSkillId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const currentCareer = useMemo(() => getCareerById(activeCareerId), [activeCareerId]);
  const decayFeedback = useMemo(() => loadUserDecayFeedback(), [state.skills]);

  // Live calculated adaptive queue
  const adaptiveQueue = useMemo(() => {
    return buildAdaptiveRoadmap({
      skills: state.skills || [],
      career: currentCareer,
      projects: state.projects || [],
      externalCourses: state.externalCourses || [],
      decayFeedback,
      topicsCompleted: state.topicsCompleted || [],
    });
  }, [state.skills, currentCareer, state.projects, state.externalCourses, decayFeedback, state.topicsCompleted]);

  // Synced GitHub projects
  const gitHubProjects = useMemo(() => {
    return (state.projects || []).filter((p) => p.source === "github" || p.verified);
  }, [state.projects]);

  const handleCareerChange = (careerId) => {
    setSearchParams({ career: careerId });
  };

  const handleSetTargetCareer = (careerId) => {
    update({ selectedCareer: careerId });
  };

  const handleStartAssessment = (careerId) => {
    update({ selectedCareer: careerId });
    navigate("/assessment");
  };

  const handleOpenCreditModal = (skillId = "") => {
    setCreditSkillId(skillId);
    setCreditModalOpen(true);
  };

  const handleCreditCourse = ({ skillId, skillName, courseTitle, platform, score, certificateFile, _verified }) => {
    const title = courseTitle || `${skillName} Verified Certificate (${platform})`;
    const awardScore = Number(score) || 95;
    const newCourse = {
      id: `ext_${Date.now()}`,
      skillId,
      skillName,
      courseTitle: title,
      platform,
      scoreAwarded: awardScore,
      certificateFile: certificateFile || "Verified_Certificate.pdf",
      verified: true,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    const existingCourses = state.externalCourses || [];
    const updatedCourses = [newCourse, ...existingCourses];

    let updatedSkills = state.skills ? [...state.skills] : [];
    const existingSkillIndex = updatedSkills.findIndex((s) => s.id === skillId);
    if (existingSkillIndex >= 0) {
      const current = updatedSkills[existingSkillIndex];
      const newScore = Math.min(100, Math.max(current.currentScore, awardScore));
      updatedSkills[existingSkillIndex] = {
        ...current,
        currentScore: newScore,
        history: [
          ...(current.history || []),
          { source: "external_course", score: newScore, note: courseTitle, platform, date: new Date().toISOString() },
        ],
      };
    } else {
      updatedSkills.push({
        id: skillId,
        name: skillName,
        category: "specialized",
        currentScore: Math.min(100, Math.max(0, awardScore)),
        requiredScore: 75,
        history: [{ source: "external_course", score: Math.min(100, Math.max(0, awardScore)), note: courseTitle, platform, date: new Date().toISOString() }],
      });
    }

    update({
      externalCourses: updatedCourses,
      skills: updatedSkills,
    });

    setToastMessage(`✓ Credited verified certificate for "${title}"!`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleRemoveExternalCourse = (courseId) => {
    const updated = (state.externalCourses || []).filter((c) => c.id !== courseId);
    update({ externalCourses: updated });
  };

  const hasCompletedCourse = Boolean(
    (state.courses && state.courses.some((c) => c.progress === 100 || c.status === "Completed" || c.certificate)) ||
    (state.externalCourses && state.externalCourses.length > 0) ||
    (state.topicsCompleted && state.topicsCompleted.length >= 1)
  );

  return (
    <Layout>
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-teal-600 flex items-center gap-3 animate-slideDown">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-teal-300 hover:text-white">✕</button>
        </div>
      )}

      <BackButton to="/roadmap" label="Roadmaps" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              Adaptive Career Roadmap
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
              ⚡ Real-Time Calibration
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Dynamic learning path that adapts to your quiz performance, real-world tasks, GitHub repositories, and knowledge decay.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenCreditModal()}
            className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>🎓</span>
            <span>Credit Outside Course</span>
          </button>
          <button
            onClick={() => navigate("/roadmap")}
            className="text-xs font-semibold text-ink-700 bg-paper hover:bg-white border border-line px-3 py-2 rounded-xl transition-all"
          >
            Standard Roadmap
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center bg-paper p-1 rounded-2xl border border-line mb-6 max-w-md">
        <button
          onClick={() => setViewTab("phased")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewTab === "phased"
              ? "bg-white text-ink-950 shadow-sm border border-line/70"
              : "text-ink-600 hover:text-ink-900"
          }`}
        >
          Adaptive Phased Journey
        </button>
        <button
          onClick={() => setViewTab("queue")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewTab === "queue"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-ink-600 hover:text-teal-700"
          }`}
        >
          Priority Queue ({adaptiveQueue.filter((q) => q.status !== "COMPLETED").length} Gaps)
        </button>
        <button
          onClick={() => setViewTab("story")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            viewTab === "story"
              ? "bg-amber-500 text-ink-950 font-black shadow-sm"
              : "text-ink-600 hover:text-amber-800"
          }`}
        >
          Why It Adapted 💡
        </button>
      </div>

      {/* View 1: Phased Journey */}
      {viewTab === "phased" && (
        <CareerRoadmapExplorer
          activeCareerId={activeCareerId}
          onCareerChange={handleCareerChange}
          userSelectedCareer={state.selectedCareer}
          userSkills={state.skills || []}
          projects={state.projects || []}
          externalCourses={state.externalCourses || []}
          githubConnected={state.githubConnected}
          githubUsername={state.githubUsername}
          decayFeedback={decayFeedback}
          isAdaptive={true}
          hasCompletedCourse={hasCompletedCourse}
          onSetTargetCareer={handleSetTargetCareer}
          onStartAssessment={handleStartAssessment}
          onOpenCreditModal={handleOpenCreditModal}
          onRemoveExternalCourse={handleRemoveExternalCourse}
          onLearn={(skillId) => navigate(`/learning?skill=${skillId}`)}
          onQuiz={(skillId, topic) =>
            navigate(`/quiz?skill=${skillId}${topic ? `&topic=${encodeURIComponent(topic)}` : ""}`)
          }
          onTask={(skillId) => navigate(`/real-world-task?skill=${skillId}`)}
          onRefresh={(skillId) => navigate(`/knowledge-refresh?skill=${skillId}`)}
        />
      )}

      {/* View 2: Sequential Adaptive Priority Queue */}
      {viewTab === "queue" && (
        <div className="space-y-6">
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Dynamic Priority Queue</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-200 text-teal-900">
                  {currentCareer?.name}
                </span>
              </div>
              <p className="text-xs text-teal-900 mt-1 max-w-xl leading-relaxed">
                Ranked strictly by gap size, prerequisite urgency, and practical GitHub code proof. Incomplete critical bottlenecks appear first to maximize your learning velocity.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-teal-800 block">
                {adaptiveQueue.filter((q) => q.status === "COMPLETED").length} of {adaptiveQueue.length} Skills Mastered
              </span>
            </div>
          </div>

          <div className="max-w-2xl">
            {adaptiveQueue.map((item, idx) => (
              <RoadmapCard
                key={item.id}
                item={item}
                isLast={idx === adaptiveQueue.length - 1}
                onLearn={(it) => navigate(`/learning?skill=${it.id}`)}
                onQuiz={(it) => navigate(`/quiz?skill=${it.id}`)}
                onTask={(it) => navigate(`/real-world-task?skill=${it.id}`)}
                onRefresh={(it) => navigate(`/knowledge-refresh?skill=${it.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* View 3: Live Adaptation Story */}
      {viewTab === "story" && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span>
              <h2 className="font-display font-extrabold text-xl text-ink-950">
                How Your Roadmap Real-Time Adapts
              </h2>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed mb-6">
              Every action you perform directly recalculates your skill scores, priority order, and recommended next steps. Here is how your active profile influenced this roadmap:
            </p>

            {/* Evidence Inputs Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-paper/80 border border-line">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>🐙</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-ink-700">
                    GitHub Code Evidence
                  </span>
                </div>
                {gitHubProjects.length > 0 ? (
                  <p className="text-xs text-ink-700 leading-relaxed">
                    <strong>{gitHubProjects.length} repositories synced</strong> from @{state.githubUsername || "student"}. Your practical code provided automatic proficiency boosts to{" "}
                    <span className="font-bold text-teal-700">
                      {Array.from(new Set(gitHubProjects.flatMap((p) => p.skills || []))).join(", ") || "development"}
                    </span>
                    , bypassing introductory beginner tutorials.
                  </p>
                ) : (
                  <p className="text-xs text-ink-500">
                    No GitHub profile synced yet. Connect your GitHub profile in Learning History to auto-credit existing code.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-paper/80 border border-line">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>⚡</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-ink-700">
                    Quiz &amp; Task Submissions
                  </span>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {(state.quizResults || []).length} quizzes and {(state.taskResults || []).length} practical tasks recorded.
                  Latest quiz: {state.quizResults?.[state.quizResults.length - 1]?.skillName || "None"} (
                  {state.quizResults?.[state.quizResults.length - 1]?.accuracy || 0}%).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper/80 border border-line">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>🎓</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-ink-700">
                    Outside Certificates
                  </span>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {(state.externalCourses || []).length > 0
                    ? `${(state.externalCourses || []).length} accredited course certificates credited, locking those skills at verified mastery.`
                    : "No outside courses credited yet. Click 'Credit Outside Course' to credit Coursera, Udemy, or edX certificates."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-paper/80 border border-line">
                <div className="flex items-center gap-2 mb-1.5">
                  <span>⏳</span>
                  <span className="font-bold text-xs uppercase tracking-wider text-ink-700">
                    Knowledge Retention
                  </span>
                </div>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {Object.values(decayFeedback).filter((v) => v === "lacking" || v === "rusty").length > 0
                    ? "Knowledge decay detected on inactive skills. These have been elevated in your queue for a quick 2-minute refresh."
                    : "All current skills are calibrated Sharp. Regular practice maintains retention."}
                </p>
              </div>
            </div>

            {/* Live Recommendation Breakdown */}
            <h3 className="font-display font-bold text-base text-ink-950 mb-3">
              Current Highest-Leverage Next Actions
            </h3>
            <div className="space-y-3">
              {adaptiveQueue.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-line flex items-center justify-between gap-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ink-950">{item.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${item.tier.badgeColor}`}>
                          {item.tier.label}
                        </span>
                        {item.ghEvidence?.hasEvidence && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            🐙 GitHub
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-600 mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => navigate(item.nextStepUrl)}
                    className="shrink-0 text-xs"
                  >
                    {item.nextStepLabel} →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outside Course Crediting Modal */}
      <AddOutsideCourseModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        availableSkills={state.skills?.length ? state.skills : currentCareer?.requiredSkills || []}
        preselectedSkillId={creditSkillId}
        existingCourses={state.externalCourses || []}
        onSubmit={handleCreditCourse}
      />
    </Layout>
  );
}
