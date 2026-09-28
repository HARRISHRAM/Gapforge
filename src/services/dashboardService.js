import { buildRoadmap, getGap, getCareerReadinessScore } from "../utils/skillCalculations";
import { getCareerById } from "../data/careers";
import { mockDelay } from "./api";

// Assembles dashboard summary from state, cleanly supporting brand new zero-data accounts
export async function buildDashboardSummary(state) {
  const career = getCareerById(state.selectedCareer || "fullstack");
  const hasUserSkills = Boolean(state.skills && state.skills.length > 0);

  // If new user with no skills yet, show baseline required skills with 0 scores
  const skills = hasUserSkills
    ? state.skills
    : (career?.requiredSkills || []).map((rs) => ({
        id: rs.skillId,
        name: rs.name,
        category: rs.category,
        currentScore: 0,
        requiredScore: rs.requiredScore,
        history: [],
      }));

  const roadmap = buildRoadmap(skills);
  
  // Calculate overall mastery percentage (starts strictly at 0% for new accounts, capped at 100%)
  let overallMastery = 0;
  if (hasUserSkills) {
    overallMastery = getCareerReadinessScore(state.skills, career);
  }

  const topGaps = [...skills]
    .filter((s) => getGap(s) > 0)
    .sort((a, b) => getGap(b) - getGap(a))
    .slice(0, 3);

  const current = roadmap.find((r) => r.status === "CURRENT") || roadmap[0];

  return mockDelay({
    overallMastery,
    topGaps,
    currentTopic: current || null,
    roadmapProgress: {
      completed: state.topicsCompleted?.length || (hasUserSkills ? roadmap.filter((r) => r.status === "COMPLETED").length : 0),
      total: 4, // 4 Phases
    },
  });
}
