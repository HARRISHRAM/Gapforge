import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import RoadmapCard from "../components/RoadmapCard";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import CareerRoadmapExplorer from "../components/CareerRoadmapExplorer";
import AddOutsideCourseModal from "../components/AddOutsideCourseModal";
import { generateRoadmap } from "../services/roadmapService";
import { getCareerById } from "../data/careers";
import { getCareerReadinessScore, ASSESSMENT_UNLOCK_THRESHOLD } from "../utils/skillCalculations";
import { loadUserDecayFeedback } from "../utils/knowledgeDecay";
import { useApp } from "../App";

export default function Roadmap() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCareerId = searchParams.get("career") || state.selectedCareer || "fullstack";
  const viewMode = searchParams.get("view") === "adaptive" && state.skills?.length ? "adaptive" : "phased";

  const [adaptiveRoadmap, setAdaptiveRoadmap] = useState(null);
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);

  // Outside course credit state
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditSkillId, setCreditSkillId] = useState("");
  const [creditToast, setCreditToast] = useState("");

  const handleCareerChange = (careerId) => {
    setSearchParams({ career: careerId, view: viewMode });
  };

  const handleViewModeChange = (mode) => {
    setSearchParams({ career: activeCareerId, view: mode });
  };

  const handleSetTargetCareer = (careerId) => {
    update({ selectedCareer: careerId });
  };

  const handleStartAssessment = (careerId) => {
    const targetCareer = getCareerById(careerId);
    const readiness = getCareerReadinessScore(state.skills || [], targetCareer);
    if (readiness <= ASSESSMENT_UNLOCK_THRESHOLD) {
      navigate("/assessment");
      return;
    }
    update({ selectedCareer: careerId });
    navigate("/assessment");
  };

  const handleOpenCreditModal = (skillId = "") => {
    setCreditSkillId(skillId);
    setIsCreditModalOpen(true);
  };

  const handleCreditCourse = ({ skillId, skillName, courseTitle, platform, score, certificateFile, verified }) => {
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
      const newScore = Math.min(100, Math.max(current.currentScore, score));
      updatedSkills[existingSkillIndex] = {
        ...current,
        currentScore: newScore,
        history: [
          ...(current.history || []),
          { source: "external_course", score: newScore, note: courseTitle, platform, date: new Date().toISOString() },
        ],
      };
    } else {
      const careerDef = getCareerById(activeCareerId) || getCareerById("fullstack");
      updatedSkills = (careerDef?.requiredSkills || []).map((rs) => ({
        id: rs.skillId,
        name: rs.name,
        category: rs.category,
        requiredScore: rs.requiredScore,
        currentScore: rs.skillId === skillId ? Math.min(100, Math.max(0, score)) : 35,
        history: [{ source: rs.skillId === skillId ? "external_course" : "baseline", score: rs.skillId === skillId ? Math.min(100, Math.max(0, score)) : 35 }],
      }));
    }

    update({
      externalCourses: updatedCourses,
      skills: updatedSkills,
      selectedCareer: state.selectedCareer || activeCareerId,
    });

    setCreditToast(`✓ Credited verified certificate for "${title}"! Your ${skillName} score is now ${awardScore}%.`);
    setTimeout(() => setCreditToast(""), 6000);
  };

  const handleRemoveExternalCourse = (courseId) => {
    const updated = (state.externalCourses || []).filter((c) => c.id !== courseId);
    update({ externalCourses: updated });
  };

  // Build adaptive roadmap if user has skills
  const hasUserSkills = state.skills && state.skills.length > 0;
  const isCurrentTarget = state.selectedCareer === activeCareerId;
  const currentCareer = useMemo(() => getCareerById(activeCareerId), [activeCareerId]);
  const decayFeedback = useMemo(() => loadUserDecayFeedback(), [state.skills]);

  useEffect(() => {
    if (!hasUserSkills) return;
    setLoadingAdaptive(true);
    generateRoadmap({
      skills: state.skills || [],
      career: currentCareer,
      projects: state.projects || [],
      externalCourses: state.externalCourses || [],
      decayFeedback,
      topicsCompleted: state.topicsCompleted || [],
    }).then((data) => {
      setAdaptiveRoadmap(data);
      setLoadingAdaptive(false);
    });
  }, [state.skills, state.projects, state.externalCourses, state.topicsCompleted, currentCareer, decayFeedback, hasUserSkills]);

  // Available skills for modal
  const availableSkillsForModal = useMemo(() => {
    if (state.skills?.length) {
      return state.skills;
    }
    return currentCareer?.requiredSkills || [];
  }, [state.skills, currentCareer]);

  return (
    <Layout>
      {/* Feedback Toast when an outside course is credited */}
      {creditToast && (
        <div className="fixed top-5 right-5 z-50 bg-teal-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-teal-600 flex items-center gap-3 animate-slideDown">
          <span>{creditToast}</span>
          <button onClick={() => setCreditToast("")} className="text-teal-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Header section with title and view mode toggle */}
      <BackButton to="/dashboard" label="Dashboard" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              Career Roadmaps
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Beginner &amp; Intermediate Friendly
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Step-by-step learning journeys for each target career. Follow structured phases or credit what you've already learned outside.
          </p>
        </div>

        {/* View switcher & outside course action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCreditModal()}
            className="text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>🎓</span>
            <span>Credit Outside Course</span>
          </button>

          {hasUserSkills && isCurrentTarget && (
            <div className="flex items-center bg-paper p-1 rounded-xl border border-line shrink-0">
              <button
                onClick={() => handleViewModeChange("phased")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-ring ${
                  viewMode === "phased"
                    ? "bg-white text-ink-950 shadow-sm border border-line/60"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                Phased Roadmap
              </button>
              <button
                onClick={() => handleViewModeChange("adaptive")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all focus-ring ${
                  viewMode === "adaptive"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-ink-600 hover:text-teal-700"
                }`}
              >
                Adaptive Queue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "adaptive" && hasUserSkills && isCurrentTarget ? (
        <div>
          {/* Adaptive Priority Queue View */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Adaptive Progression</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-200 text-teal-900">
                  {currentCareer?.name}
                </span>
              </div>
              <p className="text-sm text-teal-900 mt-1">
                Your skills are ordered to close your largest gaps first. Practical GitHub repositories and outside certificates actively accelerate your milestones!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewModeChange("phased")}
              >
                View Phased Journey
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate("/adaptive-roadmap")}
              >
                Adaptive Analysis →
              </Button>
            </div>
          </div>

          {loadingAdaptive ? (
            <Loading message="Recalculating adaptive sequence..." />
          ) : adaptiveRoadmap ? (
            <div className="max-w-2xl">
              {adaptiveRoadmap.map((item, i) => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  isLast={i === adaptiveRoadmap.length - 1}
                  onLearn={(it) => navigate(`/learning?skill=${it.id}`)}
                  onQuiz={(it) => navigate(`/quiz?skill=${it.id}`)}
                  onTask={(it) => navigate(`/real-world-task?skill=${it.id}`)}
                  onRefresh={(it) => navigate(`/knowledge-refresh?skill=${it.id}`)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        /* Visual Phased Roadmap Component for All Target Careers */
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
          hasCompletedCourse={
            Boolean(
              (state.courses && state.courses.some((c) => c.progress === 100 || c.status === "Completed" || c.certificate)) ||
              (state.externalCourses && state.externalCourses.length > 0) ||
              (state.topicsCompleted && state.topicsCompleted.length >= 1)
            )
          }
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

      {/* Outside Course Crediting Modal */}
      <AddOutsideCourseModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        availableSkills={availableSkillsForModal}
        preselectedSkillId={creditSkillId}
        existingCourses={state.externalCourses || []}
        onSubmit={handleCreditCourse}
      />
    </Layout>
  );
}
