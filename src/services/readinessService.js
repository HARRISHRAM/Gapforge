import { calculateReadiness, simulateReadiness } from "../utils/skillCalculations";
import { careerReadinessBreakdown } from "../data/adaptiveMock";
import { mockDelay } from "./api";

// Mirrors POST /api/readiness
export async function computeReadiness(skills) {
  return mockDelay(calculateReadiness(skills));
}

export function computeWhatIf(skills, skillId, hypotheticalScore) {
  return simulateReadiness(skills, skillId, hypotheticalScore);
}

export async function fetchCareerReadinessBreakdown(careerId = "fullstack") {
  return mockDelay(careerReadinessBreakdown);
}

export async function fetchBiggestFactors(careerId = "fullstack") {
  return mockDelay(careerReadinessBreakdown.biggestFactors);
}
