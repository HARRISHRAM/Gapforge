// Canonical formulas for GapForge's adaptive loop.
// Every page (SkillGaps, Roadmap, Quiz, RealWorldTask, CareerReadiness,
// AdaptiveRoadmap, Dashboard) reads through these so a score updates
// consistently everywhere it's used.

export const clampScore = (n) => Math.max(0, Math.min(100, Math.round(n)));

export const getGap = (skill) => Math.max(0, (skill.requiredScore || 0) - clampScore(skill.currentScore || 0));

// Assessment -> initial skill score.
// score = (sum of difficulty weight of correct answers) / (sum of all weights) * 100
export function scoreAssessment(questions, answers) {
  const bySkill = {};
  questions.forEach((q) => {
    const weight = q.difficulty;
    const isCorrect = answers[q.id] === q.correct;
    if (!bySkill[q.skillId]) bySkill[q.skillId] = { earned: 0, total: 0 };
    bySkill[q.skillId].total += weight;
    if (isCorrect) bySkill[q.skillId].earned += weight;
  });
  const result = {};
  Object.entries(bySkill).forEach(([skillId, { earned, total }]) => {
    result[skillId] = total > 0 ? clampScore((earned / total) * 100) : 0;
  });
  return result;
}

// Quiz result -> updated skill score.
// A quiz can move a skill by at most `sensitivity` of the distance to the new evidence.
const QUIZ_SENSITIVITY = 0.4;
export function applyQuizResult(oldScore, correctCount, totalCount) {
  const safeOld = clampScore(oldScore || 0);
  const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : safeOld;
  const updated = safeOld + (accuracy - safeOld) * QUIZ_SENSITIVITY;
  return clampScore(updated);
}

// Real-world task evaluation -> updated skill score.
// Tasks are stronger evidence than quizzes, so they carry more weight.
const TASK_SENSITIVITY = 0.6;
export function applyTaskResult(oldScore, taskScorePercent) {
  const safeOld = clampScore(oldScore || 0);
  const updated = safeOld + (taskScorePercent - safeOld) * TASK_SENSITIVITY;
  return clampScore(updated);
}

// Roadmap priority from the size of the gap.
export function getPriority(skill) {
  if (skill.currentScore >= skill.requiredScore) return "COMPLETED";
  const gap = getGap(skill);
  if (gap >= 40) return "HIGH";
  if (gap >= 15) return "MEDIUM";
  return "LOW";
}

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2, COMPLETED: 3 };

// Builds an ordered roadmap: completed skills first (as done), then the
// single highest-priority incomplete skill marked CURRENT, then the rest
// as UPCOMING, ordered by priority.
export function buildRoadmap(skills, topics = {}) {
  const enriched = skills.map((s) => ({
    ...s,
    priority: getPriority(s),
    gap: getGap(s),
  }));

  const completed = enriched.filter((s) => s.priority === "COMPLETED");
  const incomplete = enriched
    .filter((s) => s.priority !== "COMPLETED")
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.gap - a.gap);

  return [
    ...completed.map((s) => ({ ...s, status: "COMPLETED" })),
    ...incomplete.map((s, i) => ({ ...s, status: i === 0 ? "CURRENT" : "UPCOMING" })),
  ];
}

// Career readiness: weighted average of (achieved / required), capped at 100%
// per skill so over-performing on one skill can't mask a gap elsewhere.
export function calculateReadiness(skills) {
  if (!skills.length) return 0;
  const totalWeight = skills.length;
  const sum = skills.reduce((acc, s) => {
    const cur = clampScore(s.currentScore || 0);
    const req = clampScore(s.requiredScore || 100);
    const achieved = req > 0 ? Math.min(cur, req) / req : 1;
    return acc + achieved;
  }, 0);
  return clampScore((sum / totalWeight) * 100);
}

// "What If?" simulator: recompute readiness with one skill's score swapped.
export function simulateReadiness(skills, skillId, hypotheticalScore) {
  const modified = skills.map((s) => (s.id === skillId ? { ...s, currentScore: clampScore(hypotheticalScore) } : s));
  return calculateReadiness(modified);
}

export function updateSkillScore(skills, skillId, newScore) {
  return skills.map((s) =>
    s.id === skillId
      ? { ...s, currentScore: clampScore(newScore), history: [...(s.history || []), { source: "update", score: clampScore(newScore) }] }
      : s
  );
}

export function getCareerReadinessScore(skills = [], career = null) {
  if (!career || !career.requiredSkills || !career.requiredSkills.length) {
    if (!skills.length) return 0;
    const sum = skills.reduce((acc, s) => acc + clampScore(s.currentScore || 0), 0);
    return Math.min(100, Math.round(sum / skills.length));
  }
  const skillMap = {};
  skills.forEach((s) => {
    skillMap[s.id] = s;
  });

  let totalScore = 0;
  career.requiredSkills.forEach((req) => {
    const userSkill = skillMap[req.skillId];
    const cur = userSkill ? Math.min(100, Math.max(0, userSkill.currentScore)) : 0;
    totalScore += cur;
  });

  return Math.min(100, Math.round(totalScore / career.requiredSkills.length));
}

export const ASSESSMENT_UNLOCK_THRESHOLD = 80;

/**
 * Benchmark Assessment Unlock Gate:
 * Unlocks only when career readiness is strictly above 80% (81+).
 * 80% and below — including 70% — stays locked.
 */
export function isAssessmentUnlocked(skills = [], career = null) {
  return getCareerReadinessScore(skills, career) > ASSESSMENT_UNLOCK_THRESHOLD;
}

// ─── GitHub Practical Evidence Extractor ──────────────────────────────
export function matchGitHubEvidence(skillId, projects = [], githubRepos = []) {
  const key = (skillId || "").toLowerCase().replace(/[^a-z]/g, "");
  const allProjects = [...(projects || [])];

  // Also include raw githubRepos if passed
  (githubRepos || []).forEach((r) => {
    if (!allProjects.some((p) => p.repoUrl === r.html_url || p.projectName === r.name)) {
      allProjects.push({
        projectName: r.name,
        description: r.description || "",
        technologies: r.language ? [r.language] : [],
        skills: [r.language || ""],
        stars: r.stargazers_count || r.stars || 0,
        forks: r.forks_count || r.forks || 0,
        repoUrl: r.html_url || "",
      });
    }
  });

  const matchingRepos = [];

  allProjects.forEach((p) => {
    const pSkillId = (p.skillId || "").toLowerCase().replace(/[^a-z]/g, "");
    const pSkills = (p.skills || []).map((s) => (s || "").toLowerCase().replace(/[^a-z]/g, ""));
    const pTech = (p.technologies || []).map((t) => (t || "").toLowerCase().replace(/[^a-z]/g, ""));
    const pName = (p.projectName || "").toLowerCase();
    const pDesc = (p.description || "").toLowerCase();

    const matches =
      pSkillId === key ||
      pSkills.includes(key) ||
      pTech.includes(key) ||
      (key === "javascript" && (pTech.includes("typescript") || pTech.includes("js") || pSkills.includes("typescript") || pSkills.includes("javascript"))) ||
      (key === "react" && (pDesc.includes("react") || pName.includes("react") || pTech.includes("react") || pSkills.includes("react"))) ||
      (key === "nodejs" && (pDesc.includes("node") || pName.includes("node") || pDesc.includes("backend") || pDesc.includes("api") || pTech.includes("nodejs") || pTech.includes("node"))) ||
      (key === "sql" && (pDesc.includes("sql") || pDesc.includes("database") || pName.includes("sql") || pDesc.includes("postgres") || pDesc.includes("mongo"))) ||
      (key === "python" && (pTech.includes("python") || pName.includes("python") || pSkills.includes("python"))) ||
      (key === "html" && (pTech.includes("html") || pDesc.includes("html") || pName.includes("html"))) ||
      (key === "css" && (pTech.includes("css") || pTech.includes("tailwind") || pDesc.includes("css") || pDesc.includes("tailwind"))) ||
      (key === "git" && (pName.includes("git") || pDesc.includes("git") || p.source === "github"));

    if (matches) {
      matchingRepos.push({
        name: p.projectName || p.name || "Repository",
        stars: p.stars || 0,
        forks: p.forks || 0,
        url: p.repoUrl || p.html_url || "",
        description: p.description || "",
        language: p.technologies?.[0] || p.skills?.[0] || "Code",
      });
    }
  });

  const uniqueRepos = Array.from(new Map(matchingRepos.map((r) => [r.name, r])).values());
  const totalStars = uniqueRepos.reduce((acc, r) => acc + (r.stars || 0), 0);
  const totalForks = uniqueRepos.reduce((acc, r) => acc + (r.forks || 0), 0);
  const topRepo = uniqueRepos.sort((a, b) => (b.stars || 0) - (a.stars || 0))[0] || null;

  return {
    hasEvidence: uniqueRepos.length > 0,
    repoCount: uniqueRepos.length,
    totalStars,
    totalForks,
    topRepo: topRepo ? topRepo.name : null,
    topRepoUrl: topRepo ? topRepo.url : null,
    repos: uniqueRepos,
    badgeText: uniqueRepos.length > 0
      ? `${uniqueRepos.length} Repo${uniqueRepos.length > 1 ? "s" : ""}${totalStars > 0 ? ` • ${totalStars} ⭐` : ""}`
      : null,
  };
}

// ─── Proficiency Tier Calculator ──────────────────────────────────────
export function getProficiencyTier(currentScore, targetScore = 80) {
  const score = clampScore(currentScore || 0);
  const target = clampScore(targetScore || 80);

  if (score >= target) {
    return {
      tier: "MASTERED",
      label: "Mastered",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      pillColor: "emerald",
      icon: "✓",
      summary: "Target met! Code and knowledge verified.",
    };
  }
  if (score >= 65) {
    return {
      tier: "PROFICIENT",
      label: "Proficient",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      pillColor: "sky",
      icon: "⚡",
      summary: "Solid working knowledge. Focus on advanced patterns and practical edge cases.",
    };
  }
  if (score >= 40) {
    return {
      tier: "DEVELOPING",
      label: "Developing",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      pillColor: "amber",
      icon: "▲",
      summary: "Foundations in place. Needs guided practice quizzes and tasks.",
    };
  }
  return {
    tier: "CRITICAL_GAP",
    label: "Critical Gap",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    pillColor: "rose",
    icon: "!",
    summary: "Large gap remaining. Primary focus to unlock career progression.",
  };
}

// ─── Adaptive Roadmap Engine ──────────────────────────────────────────
export function buildAdaptiveRoadmap(options = {}) {
  const {
    skills = [],
    career = null,
    projects = [],
    externalCourses = [],
    decayFeedback = {},
    topicsCompleted = [],
  } = options;

  const skillMap = {};
  skills.forEach((s) => {
    skillMap[s.id] = s;
  });

  const sourceSkills = (career?.requiredSkills || []).length > 0
    ? career.requiredSkills.map((rs) => {
        const userSkill = skillMap[rs.skillId] || {};
        return {
          id: rs.skillId,
          name: rs.name,
          category: rs.category,
          requiredScore: rs.requiredScore || 75,
          currentScore: clampScore(userSkill.currentScore || 0),
          history: userSkill.history || [],
        };
      })
    : skills.map((s) => ({
        ...s,
        currentScore: clampScore(s.currentScore || 0),
        requiredScore: clampScore(s.requiredScore || 75),
      }));

  const enriched = sourceSkills.map((s) => {
    const current = s.currentScore;
    const target = s.requiredScore;
    const gap = Math.max(0, target - current);
    const tier = getProficiencyTier(current, target);
    const ghEvidence = matchGitHubEvidence(s.id, projects);
    const extCourse = (externalCourses || []).find(
      (c) => (c.skillId || "").toLowerCase() === s.id.toLowerCase()
    );
    const isDecayed = decayFeedback[s.id] === "lacking" || decayFeedback[s.id] === "rusty";
    const isCompleted = (topicsCompleted || []).includes(s.id) || current >= target;

    let priority = "LOW";
    if (current >= target) {
      priority = "COMPLETED";
    } else if (gap >= 35 || isDecayed) {
      priority = "HIGH";
    } else if (gap >= 15) {
      priority = "MEDIUM";
    }

    let reason = "";
    if (ghEvidence.hasEvidence && current >= target) {
      reason = `Mastered! Your practical code in ${ghEvidence.repoCount} GitHub repo${ghEvidence.repoCount > 1 ? "s" : ""} (${ghEvidence.topRepo}) and quiz evidence prove strong real-world proficiency.`;
    } else if (ghEvidence.hasEvidence) {
      reason = `Practical familiarity found in GitHub repo (${ghEvidence.topRepo}). Closing the remaining ${gap}% gap with a hands-on task will bring this to full mastery.`;
    } else if (extCourse) {
      reason = `Credited via verified certificate from ${extCourse.platform} ("${extCourse.courseTitle}").`;
    } else if (isDecayed) {
      reason = `Knowledge decay detected: this skill was previously sharp but has flagged as ${decayFeedback[s.id]}. A 2-minute diagnostic quiz will restore your calibration.`;
    } else if (gap >= 35) {
      reason = `Critical bottleneck: this ${gap}% gap in ${s.name} is your largest leverage point to accelerate career readiness.`;
    } else {
      reason = `${s.name} is a key requirement for ${career?.name || "your target career"}. Practice exercises recommended.`;
    }

    let nextStepType = "learn";
    let nextStepLabel = "Start Learning";
    let nextStepUrl = `/learning?skill=${s.id}`;

    if (isDecayed) {
      nextStepType = "refresh";
      nextStepLabel = "Quick Refresh";
      nextStepUrl = `/knowledge-refresh?skill=${s.id}`;
    } else if (ghEvidence.hasEvidence && current < target) {
      nextStepType = "task";
      nextStepLabel = "Verify with Practical Task";
      nextStepUrl = `/real-world-task?skill=${s.id}`;
    } else if (current >= 50) {
      nextStepType = "quiz";
      nextStepLabel = "Take Diagnostic Quiz";
      nextStepUrl = `/quiz?skill=${s.id}`;
    }

    return {
      ...s,
      gap,
      priority,
      tier,
      ghEvidence,
      extCourse,
      isDecayed,
      isCompleted,
      reason,
      nextStepType,
      nextStepLabel,
      nextStepUrl,
    };
  });

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, COMPLETED: 3 };
  const sorted = [...enriched].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.gap - a.gap;
  });

  return sorted.map((s, idx) => ({
    ...s,
    status: s.priority === "COMPLETED" ? "COMPLETED" : idx === 0 ? "CURRENT" : "UPCOMING",
  }));
}

// ─── Dynamic Next Best Action ─────────────────────────────────────────
export function computeNextBestAction({
  skills = [],
  career = null,
  projects = [],
  decayFeedback = {},
}) {
  const roadmap = buildAdaptiveRoadmap({ skills, career, projects, decayFeedback });
  const targetCareerName = career?.name || "Full-Stack Developer";

  // Check if anything is severely decaying first
  const decayingItem = roadmap.find((item) => item.isDecayed);
  if (decayingItem) {
    return {
      id: `action_decay_${decayingItem.id}`,
      title: `Refresh decaying knowledge in ${decayingItem.name}`,
      action: `Take the 2-minute diagnostic refresh quiz for ${decayingItem.name}.`,
      skill: decayingItem.name,
      skillId: decayingItem.id,
      topic: "Knowledge Retention",
      priority: "High",
      estimatedTime: "3 mins",
      reason: `Knowledge decay was detected in ${decayingItem.name}. Refreshing now prevents forgetting foundational concepts.`,
      expectedBenefit: `Restores decay penalty and recalibrates ${decayingItem.name} to Sharp.`,
      actionUrl: `/knowledge-refresh?skill=${decayingItem.id}`,
      ctaText: "Start Quick Refresh →",
      badge: "Decay Prevention",
    };
  }

  // Find the top incomplete skill
  const currentItem = roadmap.find((item) => item.status === "CURRENT") || roadmap[0];

  if (!currentItem || currentItem.status === "COMPLETED") {
    return {
      id: "action_all_completed",
      title: "All Core Skills Mastered!",
      action: "Attempt the Final Benchmark Career Assessment to certify your skills.",
      skill: targetCareerName,
      skillId: career?.id || "fullstack",
      topic: "Benchmark Assessment",
      priority: "High",
      estimatedTime: "25 mins",
      reason: "You have reached or exceeded the required score across all career skills.",
      expectedBenefit: "Official proctored certification and benchmark validation.",
      actionUrl: "/assessment",
      ctaText: "Take Career Assessment →",
      badge: "Assessment Ready",
    };
  }

  if (currentItem.ghEvidence?.hasEvidence) {
    return {
      id: `action_task_${currentItem.id}`,
      title: `Validate ${currentItem.name} Practical Task`,
      action: `Complete the ${currentItem.name} practical code task to match your GitHub experience.`,
      skill: currentItem.name,
      skillId: currentItem.id,
      topic: "Practical Application",
      priority: "High",
      estimatedTime: "15 mins",
      reason: `We detected code in your GitHub repository (${currentItem.ghEvidence.topRepo}). A quick practical task will instantly verify this mastery for ${targetCareerName}.`,
      expectedBenefit: `+${Math.min(25, currentItem.gap)}% boost to close your remaining gap in ${currentItem.name}.`,
      actionUrl: `/real-world-task?skill=${currentItem.id}`,
      ctaText: "Start Practical Task →",
      badge: "GitHub Accelerated",
    };
  }

  return {
    id: `action_learn_${currentItem.id}`,
    title: `Close largest gap: ${currentItem.name}`,
    action: `Practice ${currentItem.name} exercises and quiz to raise mastery from ${currentItem.currentScore}% to ${currentItem.requiredScore}%.`,
    skill: currentItem.name,
    skillId: currentItem.id,
    topic: "Core Concepts",
    priority: "High",
    estimatedTime: "15 mins",
    reason: currentItem.reason,
    expectedBenefit: `Closes your ${currentItem.gap}% gap in ${currentItem.name} to advance towards ${targetCareerName} readiness.`,
    actionUrl: `/quiz?skill=${currentItem.id}`,
    ctaText: "Take Diagnostic Quiz →",
    badge: "Largest Gap",
  };
}
