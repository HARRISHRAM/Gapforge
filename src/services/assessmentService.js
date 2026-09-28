import { assessmentQuestions, questionBank } from "../data/assessmentQuestions";
import { scoreAssessment, ASSESSMENT_UNLOCK_THRESHOLD } from "../utils/skillCalculations";
import { apiGet, apiPost, mockDelay } from "./api";

const ATTEMPTS_STORAGE_KEY = "skillpath_question_attempts";

export function getLocalAttemptHistory() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordLocalAttempt(questionId, isCorrect, skillId, difficulty, userAnswer = null, timeSpentSeconds = null) {
  try {
    const history = getLocalAttemptHistory();
    const entry = {
      questionId,
      isCorrect,
      skillId,
      difficulty,
      userAnswer,
      timeSpentSeconds,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...history.filter((h) => h.questionId !== questionId)];
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(updated));

    // Async sync to SQLite database
    apiPost("/assessment/attempt", {
      questionId,
      skillId,
      difficulty,
      userAnswer,
      isCorrect,
      timeSpentSeconds,
    }).catch(() => {});

    return updated;
  } catch {
    return [];
  }
}

export function clearLocalAttemptHistory() {
  try {
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
  } catch {}
}

// Fisher-Yates shuffle — same algorithm used by the quiz engine
function shuffleQuestions(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fetch questions supporting no-repeat filtering, question sets, and randomized order.
// Unattempted questions are shuffled and placed first; attempted questions fill the remainder.
export async function fetchAssessment(careerId, options = {}) {
  const { excludeAttempted = false, questionSetId = "all" } = options;
  const pool = assessmentQuestions[careerId] || questionBank;

  const history = getLocalAttemptHistory();
  const attemptedIds = new Set(history.map((h) => h.questionId));

  // Split into unattempted vs attempted, shuffle each independently
  const unattempted = shuffleQuestions(pool.filter((q) => !attemptedIds.has(q.id)));
  const attempted   = shuffleQuestions(pool.filter((q) =>  attemptedIds.has(q.id)));

  // Compose: unattempted first, then attempted (no-repeat filter logic)
  let questions;
  if (excludeAttempted && unattempted.length >= 4) {
    questions = unattempted;
  } else {
    // Merge: fresh questions lead, seen questions follow
    questions = [...unattempted, ...attempted];
  }

  // Question set segregation demo
  if (questionSetId === "set_alpha") {
    questions = questions.filter((_, idx) => idx % 2 === 0);
  } else if (questionSetId === "set_beta") {
    questions = questions.filter((_, idx) => idx % 2 === 1);
  }

  return mockDelay(questions);
}

// Adaptive Testing: Evaluates the last answer and chooses the next question's difficulty and topic
export async function getAdaptiveNextQuestion(currentQuestion, isCorrect, attemptedIds = []) {
  const currentDiff = currentQuestion?.difficulty || "medium";
  const skillId = currentQuestion?.skillId;

  let targetDifficulty = "medium";
  if (isCorrect) {
    targetDifficulty = currentDiff === "easy" ? "medium" : "hard";
  } else {
    targetDifficulty = currentDiff === "hard" ? "medium" : "easy";
  }

  // Find candidate questions matching the target difficulty
  let candidates = questionBank.filter(
    (q) =>
      q.id !== currentQuestion?.id &&
      !attemptedIds.includes(q.id) &&
      (skillId ? q.skillId === skillId || q.difficulty === targetDifficulty : true)
  );

  if (candidates.length === 0) {
    candidates = questionBank.filter((q) => q.id !== currentQuestion?.id && !attemptedIds.includes(q.id));
  }

  const selected = candidates[0] || questionBank[0];

  return mockDelay({
    nextQuestion: selected,
    previousDifficulty: currentDiff,
    newDifficulty: targetDifficulty,
    adaptationReason: isCorrect
      ? `Promoted to ${targetDifficulty.toUpperCase()} after correct answer.`
      : `Stepped down to ${targetDifficulty.toUpperCase()} to calibrate prerequisite foundations.`,
  });
}

// Submit answers, calculate scores, and persist to SQLite
export async function submitAssessment(careerId, answers, metrics = {}) {
  const questions = assessmentQuestions[careerId] || questionBank;
  const scores = scoreAssessment(questions, answers);

  let correctCount = 0;
  let totalCount = 0;

  // Record attempts for answered questions
  questions.forEach((q) => {
    if (answers[q.id] !== undefined) {
      totalCount++;
      const isCorrect = answers[q.id] === q.correct;
      if (isCorrect) correctCount++;
      recordLocalAttempt(q.id, isCorrect, q.skillId, q.difficulty, answers[q.id]);
    }
  });

  // Calculate overall percentage score
  const overallScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Persist session to SQLite
  try {
    await apiPost("/assessment/session", {
      careerId,
      score: overallScore,
      totalQuestions: totalCount,
      correctCount,
      attentionScore: metrics.attentionScore ?? 100,
      keystrokeConfidence: metrics.keystrokeConfidence ?? 100,
      nlpScore: metrics.nlpScore ?? null,
      bktMastery: metrics.bktMastery ?? null,
      originalityScore: metrics.originalityScore ?? 100,
      tabSwitches: metrics.tabSwitches ?? 0,
      passed: overallScore > ASSESSMENT_UNLOCK_THRESHOLD ? 1 : 0,
    });

    const metricBundle = {
      attentionScore: metrics.attentionScore ?? 100,
      keystrokeConfidence: metrics.keystrokeConfidence ?? 100,
      originalityScore: metrics.originalityScore ?? 100,
      bktMastery: metrics.bktMastery ?? null,
      tabSwitches: metrics.tabSwitches ?? 0,
      fullscreenExits: metrics.fullscreenExits ?? 0,
      pasteCount: metrics.pasteCount ?? 0,
      extraPersonFlags: metrics.extraPersonFlags ?? 0,
    };
    const metricTypes = [
      ["gaze_attention", { attentionScore: metricBundle.attentionScore, extraPersonFlags: metricBundle.extraPersonFlags }],
      ["keystroke_dynamics", { keystrokeConfidence: metricBundle.keystrokeConfidence }],
      ["code_originality", { originalityScore: metricBundle.originalityScore, pasteCount: metricBundle.pasteCount }],
      ["bkt_state", { bktMastery: metricBundle.bktMastery, score: overallScore }],
    ];
    await Promise.all(
      metricTypes.map(([metricType, data]) =>
        apiPost("/ai-metrics", { metricType, data }).catch(() => null)
      )
    );
  } catch (e) {
    console.warn("Could not persist assessment session to SQLite:", e);
  }

  return mockDelay(scores);
}
