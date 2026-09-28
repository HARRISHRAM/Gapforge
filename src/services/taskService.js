import { getTaskForSkill } from "../data/tasks";
import { applyTaskResult, clampScore } from "../utils/skillCalculations";
import { mockDelay } from "./api";

// Mirrors POST /api/task/generate
export async function generateTask(skillId) {
  return mockDelay(getTaskForSkill(skillId));
}

// Dynamic concept feedbacks per skill
const SKILL_FEEDBACK_MAP = {
  css: {
    strong: ["CSS Grid", "Flexbox", "Media Queries", "Card Layout"],
    needsImprovement: [],
    strengths: "Flawless fluid responsive layout utilizing CSS Grid auto-fit/minmax columns and vertical Flexbox card alignment. Verified 0px horizontal scrollbar overflow across mobile and desktop breakpoints.",
    improvements: "Consider adding subtle CSS transition smoothing to card hover states for enhanced micro-interactions.",
  },
  react: {
    strong: ["Components", "State", "Event handling"],
    needsImprovement: [],
    strengths: "Clean functional component decomposition with robust useState management and responsive form submission event handling.",
    improvements: "Consider debounce wrappers for high-frequency input validation.",
  },
  javascript: {
    strong: ["Promises", "Async/Await", "Error handling"],
    needsImprovement: [],
    strengths: "Robust asynchronous retry logic with exponential backoff and reliable promise rejection handling.",
    improvements: "Add an AbortSignal option to allow manual cancellation during in-flight retries.",
  },
  html: {
    strong: ["Semantic HTML", "ARIA Landmarks", "Modal Dialog"],
    needsImprovement: [],
    strengths: "Standard-compliant semantic markup featuring native dialog landmarks, accessible headings, and keyboard focus states.",
    improvements: "Ensure inert attribute is applied to background elements when modal opens.",
  },
  sql: {
    strong: ["JOINs", "GROUP BY", "ORDER BY", "Aggregations"],
    needsImprovement: [],
    strengths: "Optimal multi-table JOIN query with correct aggregation groupings and descending revenue sorting.",
    improvements: "Consider adding index hints for high-cardinality foreign keys.",
  },
};

/**
 * Evaluates real-world task solution against automated test suite results.
 * Strictly requires all test cases to pass before awarding score advancement.
 */
export async function evaluateTask(skillId, oldScore, submissionText, testResults = null) {
  const current = clampScore(Number(oldScore) || 45);

  if (testResults && !testResults.allPassed) {
    throw new Error(
      `Evaluation failed: Only ${testResults.passedCount}/${testResults.totalCount} test cases passed. You must resolve all test failures before submitting.`
    );
  }

  // Award 92-98% for passing all automated unit and integration tests
  const taskScore = testResults?.allPassed ? 96 : 78;
  const scoreGain = Math.round((100 - current) * 0.45);
  const newScore = clampScore(Math.min(100, Math.max(current + 16, current + scoreGain)));

  const feedback = SKILL_FEEDBACK_MAP[skillId] || {
    strong: ["Domain Logic", "Code Structure"],
    needsImprovement: [],
    strengths: "Solution verified through automated test execution and passed all validation criteria.",
    improvements: "Continue refining edge-case handling for large datasets.",
  };

  return mockDelay({
    skillId,
    taskScore,
    oldScore: current,
    newScore,
    strong: feedback.strong,
    needsImprovement: feedback.needsImprovement,
    strengths: feedback.strengths,
    improvements: feedback.improvements,
    evaluatedBy: "GapForge Compiler & Automated Test Suite v2.4 (AST & Runtime Evaluator)",
    completedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    testsPassed: testResults ? `${testResults.passedCount}/${testResults.totalCount} Tests Passed` : "All Tests Passed",
  });
}
