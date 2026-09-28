// ─── Knowledge Decay Engine ────────────────────────────────────────
// Implements an Ebbinghaus forgetting curve model to estimate knowledge
// retention over time for each skill. Decay is exponential:
//   retainedScore = lastKnownScore × e^(-t / halfLife)
//
// Where:
//   t        = days since last practice/activity for that skill
//   halfLife = how many days until the score halves (varies by mastery level)
//
// Higher-mastery skills decay slower (deeper encoding = longer halfLife).

import { clampScore } from "./skillCalculations";

// ─── Constants ─────────────────────────────────────────────────────

// Half-life tiers (in days): how quickly knowledge decays based on mastery
const HALF_LIFE_TIERS = {
  mastered: 365,    // 80+ score: deeply encoded, decays very slowly
  strong: 180,      // 60-79: solid but fades over 6 months
  moderate: 90,     // 40-59: moderate retention ~3 months
  weak: 45,         // 20-39: shallow knowledge, decays fast
  minimal: 21,      // 0-19: barely learned, decays in ~3 weeks
};

// Decay severity classifications
export const DECAY_LEVEL = {
  SHARP: "still_sharp",       // <10% decay
  SLIGHTLY_RUSTY: "slightly_rusty",  // 10-25% decay
  RUSTY: "rusty",             // 25-50% decay
  NEEDS_REVIEW: "needs_review", // >50% decay
};

// User Self-Assessment levels for what skills they feel they lack after time away
export const USER_ASSESSMENT = {
  LACKING: "lacking",   // User says: I forgot this / I lack this skill
  RUSTY: "rusty",       // User says: I'm a bit rusty / need a quick recap
  SHARP: "sharp",       // User says: I still remember / still sharp
};

const STORAGE_KEY = "gapforge_user_knowledge_decay_feedback";

/**
 * Load user-reported skill feedback from localStorage.
 */
export function loadUserDecayFeedback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save user-reported skill feedback to localStorage.
 */
export function saveUserDecayFeedback(feedback) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback));
  } catch {}
}

/**
 * Clear user-reported skill feedback.
 */
export function clearUserDecayFeedback() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// How many days of inactivity before we show the welcome-back nudge
export const INACTIVITY_THRESHOLD_DAYS = 30;

// ─── Core Functions ────────────────────────────────────────────────

/**
 * Get the forgetting half-life for a skill based on its last known score.
 */
function getHalfLife(lastKnownScore) {
  const score = clampScore(lastKnownScore || 0);
  if (score >= 80) return HALF_LIFE_TIERS.mastered;
  if (score >= 60) return HALF_LIFE_TIERS.strong;
  if (score >= 40) return HALF_LIFE_TIERS.moderate;
  if (score >= 20) return HALF_LIFE_TIERS.weak;
  return HALF_LIFE_TIERS.minimal;
}

/**
 * Compute the retained score after `daysSinceLastPractice` days.
 * Uses exponential decay: S(t) = S0 × e^(-λt)
 * where λ = ln(2) / halfLife
 */
export function computeDecayedScore(lastKnownScore, daysSinceLastPractice) {
  const score = clampScore(lastKnownScore || 0);
  if (daysSinceLastPractice <= 0 || score === 0) return score;

  const halfLife = getHalfLife(score);
  const lambda = Math.LN2 / halfLife;
  const retained = score * Math.exp(-lambda * daysSinceLastPractice);
  return clampScore(Math.round(retained));
}

/**
 * Compute the decay percentage for a skill.
 * Returns value between 0-100 representing how much has been forgotten.
 */
export function computeDecayPercent(lastKnownScore, daysSinceLastPractice) {
  const original = clampScore(lastKnownScore || 0);
  if (original === 0) return 0;
  const retained = computeDecayedScore(original, daysSinceLastPractice);
  return Math.round(((original - retained) / original) * 100);
}

/**
 * Classify the decay severity for a skill.
 */
export function getDecayLevel(decayPercent) {
  if (decayPercent < 10) return DECAY_LEVEL.SHARP;
  if (decayPercent < 25) return DECAY_LEVEL.SLIGHTLY_RUSTY;
  if (decayPercent < 50) return DECAY_LEVEL.RUSTY;
  return DECAY_LEVEL.NEEDS_REVIEW;
}

/**
 * Human-readable label for decay level.
 */
export function getDecayLabel(decayLevel) {
  switch (decayLevel) {
    case DECAY_LEVEL.SHARP: return "Still Sharp";
    case DECAY_LEVEL.SLIGHTLY_RUSTY: return "Slightly Rusty";
    case DECAY_LEVEL.RUSTY: return "Rusty";
    case DECAY_LEVEL.NEEDS_REVIEW: return "Needs Full Review";
    default: return "Unknown";
  }
}

/**
 * Emoji for decay level.
 */
export function getDecayEmoji(decayLevel) {
  switch (decayLevel) {
    case DECAY_LEVEL.SHARP: return "✅";
    case DECAY_LEVEL.SLIGHTLY_RUSTY: return "🟡";
    case DECAY_LEVEL.RUSTY: return "🟠";
    case DECAY_LEVEL.NEEDS_REVIEW: return "🔴";
    default: return "❓";
  }
}

/**
 * Color class for decay level (Tailwind).
 */
export function getDecayColor(decayLevel) {
  switch (decayLevel) {
    case DECAY_LEVEL.SHARP: return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", accent: "text-emerald-600" };
    case DECAY_LEVEL.SLIGHTLY_RUSTY: return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", accent: "text-yellow-600" };
    case DECAY_LEVEL.RUSTY: return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", accent: "text-orange-600" };
    case DECAY_LEVEL.NEEDS_REVIEW: return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", accent: "text-red-600" };
    default: return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", accent: "text-gray-600" };
  }
}

// ─── Aggregate Analysis Functions ──────────────────────────────────

/**
 * Determine the last activity date for a skill from the user's activity timeline.
 * Returns a Date object or null if no activity found.
 */
export function getLastActivityDate(skillId, activityTimeline = []) {
  const activities = activityTimeline
    .filter((act) => {
      const actSkillId = (act.skillId || act.skill || "").toLowerCase();
      return actSkillId === skillId.toLowerCase();
    })
    .map((act) => {
      if (act.fullDate) return new Date(act.fullDate);
      // Try parsing "Month Day" format like "September 20"
      if (act.date) {
        const parsed = new Date(`${act.date}, 2025`);
        if (!isNaN(parsed)) return parsed;
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b - a); // Most recent first

  return activities.length > 0 ? activities[0] : null;
}

/**
 * Compute days since last activity for a skill.
 */
export function getDaysSinceLastActivity(skillId, activityTimeline = [], now = new Date()) {
  const lastDate = getLastActivityDate(skillId, activityTimeline);
  if (!lastDate) return Infinity; // Never practiced
  const diffMs = now - lastDate;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Analyze all skills and compute decay profiles for each.
 * Supports explicit user feedback/calibration to override or validate time-based decay.
 * Returns an array of decay analysis objects sorted by decay severity.
 */
export function analyzeKnowledgeDecay(skills = [], activityTimeline = [], userFeedback = {}, now = new Date()) {
  let feedback = userFeedback;
  let currentDate = now;
  if (userFeedback instanceof Date) {
    currentDate = userFeedback;
    feedback = {};
  }
  if (!feedback || Object.keys(feedback).length === 0) {
    feedback = loadUserDecayFeedback();
  }

  return skills
    .map((skill) => {
      const daysSince = getDaysSinceLastActivity(skill.id, activityTimeline, currentDate);
      const lastKnown = clampScore(skill.currentScore || 0);
      const userStatus = feedback?.[skill.id] || null;

      let retainedScore;
      let decayPercent;
      let decayLevel;
      let decayLabel;
      let needsRefresh;

      if (userStatus === USER_ASSESSMENT.LACKING) {
        // User explicitly stated they lack or forgot this skill
        retainedScore = Math.max(15, Math.round(lastKnown * 0.3));
        decayPercent = Math.max(65, Math.round(((lastKnown - retainedScore) / (lastKnown || 1)) * 100));
        decayLevel = DECAY_LEVEL.NEEDS_REVIEW;
        decayLabel = "Lacking (Reported)";
        needsRefresh = true;
      } else if (userStatus === USER_ASSESSMENT.RUSTY) {
        // User reported they are a bit rusty
        retainedScore = Math.round(lastKnown * 0.6);
        decayPercent = Math.round(((lastKnown - retainedScore) / (lastKnown || 1)) * 100);
        decayLevel = DECAY_LEVEL.RUSTY;
        decayLabel = "Rusty (Reported)";
        needsRefresh = true;
      } else if (userStatus === USER_ASSESSMENT.SHARP) {
        // User confirmed they still remember this skill
        retainedScore = lastKnown;
        decayPercent = 0;
        decayLevel = DECAY_LEVEL.SHARP;
        decayLabel = "Sharp (Confirmed)";
        needsRefresh = false;
      } else {
        // Baseline estimation based on Ebbinghaus forgetting curve
        retainedScore = daysSince === Infinity
          ? Math.round(lastKnown * 0.3)
          : computeDecayedScore(lastKnown, daysSince);
        decayPercent = lastKnown > 0
          ? Math.round(((lastKnown - retainedScore) / lastKnown) * 100)
          : 0;
        decayLevel = getDecayLevel(decayPercent);
        decayLabel = getDecayLabel(decayLevel);
        needsRefresh = decayPercent >= 25;
      }

      return {
        skillId: skill.id,
        skillName: skill.name,
        lastKnownScore: lastKnown,
        retainedScore,
        decayPercent,
        decayLevel,
        decayLabel,
        decayColor: getDecayColor(decayLevel),
        daysSinceLastActivity: daysSince === Infinity ? null : daysSince,
        lastActivityDate: getLastActivityDate(skill.id, activityTimeline),
        needsRefresh,
        requiredScore: skill.requiredScore || 75,
        userFeedback: userStatus,
      };
    })
    .sort((a, b) => {
      // Prioritize skills user marked as lacking first
      if (a.userFeedback === USER_ASSESSMENT.LACKING && b.userFeedback !== USER_ASSESSMENT.LACKING) return -1;
      if (b.userFeedback === USER_ASSESSMENT.LACKING && a.userFeedback !== USER_ASSESSMENT.LACKING) return 1;
      return b.decayPercent - a.decayPercent;
    });
}

/**
 * Generate projected decay curve data points for a skill (for timeline chart).
 * Projects from the last known data point into the future.
 */
export function generateDecayCurve(lastKnownScore, startMonth = "May", numMonths = 4) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const startIdx = months.indexOf(startMonth);
  if (startIdx === -1) return [];

  const points = [];
  for (let i = 0; i < numMonths; i++) {
    const monthIdx = (startIdx + i) % 12;
    const daysElapsed = i * 30;
    points.push({
      month: months[monthIdx],
      projectedScore: computeDecayedScore(lastKnownScore, daysElapsed),
      isProjection: true,
    });
  }
  return points;
}

/**
 * Compute the overall inactivity gap (days since ANY activity).
 */
export function getOverallInactivityDays(activityTimeline = [], now = new Date()) {
  if (!activityTimeline.length) return Infinity;

  const dates = activityTimeline
    .map((act) => {
      if (act.fullDate) return new Date(act.fullDate);
      if (act.date) {
        const parsed = new Date(`${act.date}, 2025`);
        if (!isNaN(parsed)) return parsed;
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b - a);

  if (!dates.length) return Infinity;
  return Math.max(0, Math.floor((now - dates[0]) / (1000 * 60 * 60 * 24)));
}

/**
 * Determine if a "Welcome Back" nudge should be shown.
 */
export function shouldShowWelcomeBack(activityTimeline = [], now = new Date()) {
  const days = getOverallInactivityDays(activityTimeline, now);
  return days >= INACTIVITY_THRESHOLD_DAYS;
}

/**
 * Format days into a human-readable string.
 */
export function formatInactivityDuration(days) {
  if (days === null || days === Infinity) return "a long time";
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 60) return "about a month";
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years} year${years > 1 ? "s" : ""} and ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
}

/**
 * Build a condensed "Refresh Roadmap" containing only decayed skills.
 * Groups by severity and orders by user priority.
 */
export function buildRefreshRoadmap(decayAnalysis = []) {
  const needsRefresh = decayAnalysis.filter((d) => d.needsRefresh);
  const isUserCalibrated = decayAnalysis.some((d) => d.userFeedback);

  const critical = needsRefresh.filter((d) => d.decayLevel === DECAY_LEVEL.NEEDS_REVIEW);
  const rusty = needsRefresh.filter((d) => d.decayLevel === DECAY_LEVEL.RUSTY);
  const slight = needsRefresh.filter((d) => d.decayLevel === DECAY_LEVEL.SLIGHTLY_RUSTY);

  return {
    totalSkillsToRefresh: needsRefresh.length,
    isUserCalibrated,
    phases: [
      ...(critical.length > 0
        ? [{
            phase: "High Priority Brush-up",
            priority: "HIGH",
            badge: "Critical Focus",
            description: isUserCalibrated
              ? "Skills you reported lacking or with significant decay — start here"
              : "These skills have decayed and need a full refresher",
            skills: critical,
            estimatedTime: `${critical.length * 35} min`,
          }]
        : []),
      ...(rusty.length > 0
        ? [{
            phase: "Targeted Refresher",
            priority: "MEDIUM",
            badge: "Moderate",
            description: isUserCalibrated
              ? "Skills you reported as rusty — a quick recap will restore confidence"
              : "These skills are rusty — a focused review will bring them back",
            skills: rusty,
            estimatedTime: `${rusty.length * 20} min`,
          }]
        : []),
      ...(slight.length > 0
        ? [{
            phase: "Quick Warmup",
            priority: "LOW",
            badge: "Quick Check",
            description: "Minor brush-up to confirm your fundamentals",
            skills: slight,
            estimatedTime: `${slight.length * 10} min`,
          }]
        : []),
    ],
  };
}
