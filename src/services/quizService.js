import { getQuizForSkill } from "../data/quizQuestions";
import { applyQuizResult } from "../utils/skillCalculations";
import { mockDelay } from "./api";

// Generates a dynamic 10 MCQ + 1 Coding question quiz with hidden no-repeat filter
export async function generateQuiz(skillId, attemptedQuestionIds = []) {
  const quiz = getQuizForSkill(skillId, attemptedQuestionIds);
  return mockDelay(quiz);
}

// Submits the quiz, updates skill score, and calculates confidence based on accuracy percentage
export async function submitQuiz(skillId, oldScore, correctCount, totalCount) {
  const newScore = applyQuizResult(oldScore || 0, correctCount, totalCount);
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  
  // Confidence derived strictly from marks/accuracy percentage
  const confidenceLevel = accuracy >= 75 ? "High" : accuracy >= 50 ? "Medium" : "Low";

  return mockDelay({
    skillId,
    oldScore: oldScore || 0,
    newScore,
    correctCount,
    totalCount,
    accuracy,
    confidence: accuracy,
    confidenceLabel: `${confidenceLevel} (${accuracy}%)`,
  });
}
