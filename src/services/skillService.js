import { mockDelay } from "./api";
import { topicSkillProfiles, overallSkillTimeline } from "../data/topicSkills";

// Service layer for Skill Profile, Topic-level Skill Tracking, Multi-Evidence Calculation, and Knowledge Progress Timeline.
// Backend ready: each function will call /api/skills/:skillId or /api/ml/skill-estimation later.

export async function fetchSkillProfile(skillId) {
  const profile = topicSkillProfiles[skillId] || topicSkillProfiles.javascript;
  return mockDelay(profile);
}

export async function fetchAllSkillProfiles() {
  return mockDelay(Object.values(topicSkillProfiles));
}

export async function fetchTopicBreakdown(skillId) {
  const profile = topicSkillProfiles[skillId] || topicSkillProfiles.javascript;
  return mockDelay(profile.topics || []);
}

export async function fetchSkillProgressTimeline(skillId) {
  if (skillId && topicSkillProfiles[skillId]?.timeline) {
    return mockDelay(topicSkillProfiles[skillId].timeline);
  }
  return mockDelay(overallSkillTimeline);
}

export async function fetchMultiEvidenceScores(skillId) {
  const profile = topicSkillProfiles[skillId] || topicSkillProfiles.javascript;
  return mockDelay({
    skill: profile.skillName,
    overallScore: profile.currentScore,
    confidence: profile.confidence,
    evidence: profile.evidence,
    evidenceChecks: profile.evidenceChecks,
  });
}

// Future AI/ML Skill Estimation Endpoint Interface
export async function estimateSkillLevel(skillId, inputSignals = {}) {
  const base = topicSkillProfiles[skillId] || topicSkillProfiles.javascript;
  return mockDelay({
    skill: base.skillName,
    score: base.currentScore,
    confidence: base.confidenceValue,
    confidenceLabel: base.confidence,
    evidence: ["assessment", "quiz", "project", "practical_task"],
    weakTopics: base.weakTopics || [],
    strongTopics: base.strongTopics || [],
    estimatedAt: new Date().toISOString(),
  });
}
