// Mock data for AI/ML Adaptive engine: Next Best Action, Learning Insights, Predictions, and Roadmap Change explanations.
// Cleanly mirrors future responses from AI/ML recommendation and inference services.

export const nextBestAction = {
  id: "action_next_1",
  title: "Complete the React State Management Practical Task",
  action: "Complete the React State Management practical task.",
  skill: "React",
  skillId: "react",
  topic: "State Management",
  priority: "High",
  estimatedTime: "25 mins",
  reason: "Your recent assessment and practical task indicate that state management is currently one of your largest gaps.",
  expectedBenefit: "+14% estimated boost in React mastery and +4% boost to overall Career Readiness.",
  actionUrl: "/real-world-task?skill=react",
  ctaText: "Start Practical Task →",
};

export const learningInsights = {
  strongestImprovement: {
    skill: "JavaScript",
    delta: "+18%",
    timeframe: "Last 30 days",
    details: "Boosted by high scores on Promises Quiz and Async Practical Task.",
  },
  weakestArea: {
    skill: "React",
    topic: "State Management",
    score: 35,
    details: "Identified through diagnostic code review PR analysis and baseline assessment.",
  },
  learningTrend: {
    status: "Improving",
    trajectory: "Positive",
    velocity: "+4.2% per week",
    description: "Consistent practical submissions are accelerating your skill calibration.",
  },
  predictions: [
    {
      id: "pred_1",
      type: "positive",
      message: "You are improving steadily in JavaScript (+18% gain).",
      indicator: "On track for advanced mastery",
    },
    {
      id: "pred_2",
      type: "attention",
      message: "You may need additional practice in React State Management.",
      indicator: "Current bottleneck for full-stack tasks",
    },
    {
      id: "pred_3",
      type: "projection",
      message: "At your current pace, you will reach 80% Full-Stack readiness in approximately 3 weeks.",
      indicator: "Projected completion date: late April",
    },
  ],
  knowledgeTracing: [
    { skill: "JavaScript", mastery: 72, stability: "High (0.88)", decayRisk: "Low" },
    { skill: "React", mastery: 62, stability: "Medium (0.84)", decayRisk: "Moderate" },
    { skill: "Node.js", mastery: 30, stability: "Low (0.65)", decayRisk: "High" },
    { skill: "SQL", mastery: 70, stability: "High (0.82)", decayRisk: "Low" },
    { skill: "Git", mastery: 80, stability: "High (0.90)", decayRisk: "Minimal" },
  ],
};

export const roadmapAdaptationStory = {
  hasAdapted: true,
  lastUpdated: "Just now (after React practical submission)",
  headline: "Your roadmap changed based on your latest performance.",
  whatChanged: [
    { icon: "✓", text: "React skill improved from 40% to 68%", type: "improved" },
    { icon: "✓", text: "React State Management task completed and verified", type: "completed" },
    { icon: "↑", text: "Node.js is now your highest priority gap", type: "reordered" },
    { icon: "↓", text: "React moved from HIGH priority to COMPLETED phase", type: "promoted" },
  ],
  whyExplanation: {
    title: "Why did my roadmap change?",
    summary:
      "Your React score increased from 40% to 68%. You demonstrated React skills in a practical task. Because React is no longer your biggest gap, Node.js has become your next priority.",
    breakdown: [
      {
        factor: "Evidence Acquired",
        detail: "Scored 78% on 'Build a React form with validation' practical task.",
      },
      {
        factor: "Gap Re-evaluation",
        detail: "React gap dropped below the 20% threshold, resolving the previous critical bottleneck.",
      },
      {
        factor: "Priority Shift",
        detail: "Node.js (Backend) with a 45% gap now presents the highest leverage opportunity to maximize career readiness.",
      },
    ],
  },
};

export const careerReadinessBreakdown = {
  careerTitle: "Full-Stack Developer",
  overallReadiness: 68,
  targetScore: 85,
  dimensions: [
    { name: "Programming", score: 72, benchmark: 80, weight: "20%" },
    { name: "Frontend", score: 64, benchmark: 80, weight: "25%" },
    { name: "Backend", score: 45, benchmark: 75, weight: "25%" },
    { name: "Database", score: 70, benchmark: 70, weight: "15%" },
    { name: "Projects", score: 55, benchmark: 75, weight: "10%" },
    { name: "Problem Solving", score: 68, benchmark: 75, weight: "5%" },
  ],
  biggestFactors: [
    {
      rank: 1,
      factor: "Backend skills (Node.js & Express)",
      impact: "High",
      gap: 45,
      recommendation: "Build a REST API to increase readiness by +8%",
    },
    {
      rank: 2,
      factor: "React state management",
      impact: "Medium",
      gap: 38,
      recommendation: "Master Context API & Redux Toolkit for +5%",
    },
    {
      rank: 3,
      factor: "Real-world fullstack projects",
      impact: "High",
      gap: 30,
      recommendation: "Deploy a live fullstack app with database integration for +6%",
    },
  ],
};

// Knowledge Decay Predictions — pre-computed decay risk indicators for each skill.
// Used alongside the live knowledgeDecay.js engine for enriched AI-style recommendations.
export const knowledgeDecayPredictions = [
  {
    skillId: "javascript",
    skillName: "JavaScript",
    stability: 0.88,
    decayRisk: "Low",
    halfLifeDays: 180,
    projectedScoreIn30Days: 68,
    projectedScoreIn90Days: 58,
    projectedScoreIn180Days: 45,
    recommendation: "Strong foundation — periodic quick quizzes will maintain retention.",
  },
  {
    skillId: "react",
    skillName: "React",
    stability: 0.84,
    decayRisk: "Moderate",
    halfLifeDays: 120,
    projectedScoreIn30Days: 58,
    projectedScoreIn90Days: 42,
    projectedScoreIn180Days: 28,
    recommendation: "Active practice needed — build a small side project every month.",
  },
  {
    skillId: "nodejs",
    skillName: "Node.js",
    stability: 0.65,
    decayRisk: "High",
    halfLifeDays: 60,
    projectedScoreIn30Days: 22,
    projectedScoreIn90Days: 10,
    projectedScoreIn180Days: 4,
    recommendation: "High decay risk — schedule weekly backend exercises to retain knowledge.",
  },
  {
    skillId: "sql",
    skillName: "SQL",
    stability: 0.82,
    decayRisk: "Low",
    halfLifeDays: 180,
    projectedScoreIn30Days: 66,
    projectedScoreIn90Days: 56,
    projectedScoreIn180Days: 43,
    recommendation: "Solid retention — monthly SQL challenges will keep skills sharp.",
  },
  {
    skillId: "git",
    skillName: "Git",
    stability: 0.90,
    decayRisk: "Minimal",
    halfLifeDays: 365,
    projectedScoreIn30Days: 79,
    projectedScoreIn90Days: 76,
    projectedScoreIn180Days: 72,
    recommendation: "Deeply encoded through daily use — minimal decay expected.",
  },
];
