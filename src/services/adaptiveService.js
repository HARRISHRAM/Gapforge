import { mockDelay } from "./api";
import {
  nextBestAction,
  learningInsights,
  roadmapAdaptationStory,
} from "../data/adaptiveMock";

// Service layer for AI/ML Adaptive Engine: Next Best Action, Learning Insights, Knowledge Tracing, Predictions, and Roadmap Adaptation.
// Backend ready: each function will call /api/adaptive/recommendations or /api/ml/knowledge-tracing later.

export async function fetchNextBestAction() {
  return mockDelay(nextBestAction);
}

export async function fetchLearningInsights() {
  return mockDelay(learningInsights);
}

export async function fetchPredictions() {
  return mockDelay(learningInsights.predictions);
}

export async function fetchKnowledgeTracing() {
  return mockDelay(learningInsights.knowledgeTracing);
}

export async function fetchRoadmapAdaptationStory() {
  return mockDelay(roadmapAdaptationStory);
}
