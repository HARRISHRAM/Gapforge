import { buildAdaptiveRoadmap, buildRoadmap } from "../utils/skillCalculations";
import { mockDelay } from "./api";

// Mirrors POST /api/roadmap/generate and GET /api/roadmap/:userId
export async function generateRoadmap(skillsOrOptions) {
  if (Array.isArray(skillsOrOptions)) {
    return mockDelay(buildAdaptiveRoadmap({ skills: skillsOrOptions }));
  }
  return mockDelay(buildAdaptiveRoadmap(skillsOrOptions || {}));
}

// Mirrors POST /api/roadmap/adapt — re-runs adaptive logic on updated state.
export async function adaptRoadmap(skillsOrOptions) {
  if (Array.isArray(skillsOrOptions)) {
    return mockDelay(buildAdaptiveRoadmap({ skills: skillsOrOptions }));
  }
  return mockDelay(buildAdaptiveRoadmap(skillsOrOptions || {}));
}

