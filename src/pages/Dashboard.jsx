import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Layout from "../components/Layout";
import Card from "../components/Card";
import ScoreCard from "../components/ScoreCard";
import ProgressBar from "../components/ProgressBar";
import Button from "../components/Button";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import NextBestActionCard from "../components/NextBestActionCard";
import { buildDashboardSummary } from "../services/dashboardService";
import { nextBestAction, learningInsights } from "../data/adaptiveMock";
import { overallSkillTimeline } from "../data/topicSkills";
import { getCareerById } from "../data/careers";
import WelcomeBackNudge from "../components/WelcomeBackNudge";
import { analyzeKnowledgeDecay, loadUserDecayFeedback } from "../utils/knowledgeDecay";
import { computeNextBestAction } from "../utils/skillCalculations";
import { useApp } from "../App";

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const career = getCareerById(state.selectedCareer) || getCareerById("fullstack");

  // Dynamic next best action computed live from skills, GitHub repos, career gaps & decay
  const dynamicNextAction = useMemo(() => {
    return computeNextBestAction({
      skills: state.skills || [],
      career,
      projects: state.projects || [],
      decayFeedback: loadUserDecayFeedback(),
    });
  }, [state.skills, career, state.projects]);

  // Compute decay-adjusted readiness
  const decayAnalysis = useMemo(
    () => analyzeKnowledgeDecay(state.skills || [], state.activityTimeline || []),
    [state.skills, state.activityTimeline]
  );
  const decayedSkillsCount = decayAnalysis.filter((d) => d.needsRefresh).length;
  const decayAdjustedMastery = useMemo(() => {
    if (!decayAnalysis.length) return null;
    const avg = decayAnalysis.reduce((sum, d) => sum + d.retainedScore, 0) / decayAnalysis.length;
    return Math.round(avg);
  }, [decayAnalysis]);

  useEffect(() => {
    buildDashboardSummary(state).then(setSummary);
  }, [state]);

  if (!state.profile && !state.user) {
    return (
      <Layout>
        <EmptyState
          title="Welcome to GapForge"
          message="Create your profile to start your personalized learning journey."
          action={<Button variant="accent" onClick={() => navigate("/profile")}>Create profile</Button>}
        />
      </Layout>
    );
  }

  if (!summary) return <Layout><Loading message="Analyzing your progress..." /></Layout>;

  const latestQuiz = state.quizResults?.[state.quizResults.length - 1];
  const latestTask = state.taskResults?.[state.taskResults.length - 1];
  const recentActivities = (state.activityTimeline || []).slice(0, 4);

  return (
    <Layout>
      {/* Welcome & Target Career Banner (Section 26) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
            Welcome, {state.profile?.name || state.user?.name || "Student"}
          </h1>
          <p className="text-ink-600 mt-1 text-sm">
            Target Career: <strong className="text-ink-900 font-semibold">{career?.name || "Full-Stack Developer"}</strong>
            <button
              onClick={() => navigate(`/adaptive-roadmap`)}
              className="ml-3 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full"
            >
              Adaptive Roadmap →
            </button>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/skill-profile")}>
            Visual Skill Profile 🧬
          </Button>
        </div>
      </div>

      {/* Welcome-Back Smart Nudge — appears when returning after long inactivity */}
      <WelcomeBackNudge
        skills={state.skills || []}
        activityTimeline={state.activityTimeline || []}
        userName={state.profile?.name || state.user?.name || "Student"}
      />

      {/* Prominent "Next Best Action" (Section 13 & 26) */}
      <div className="mb-8">
        <NextBestActionCard actionData={dynamicNextAction || nextBestAction} />
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ScoreCard label="Overall Skill Mastery" value={summary.overallMastery || 0} accent="teal" />
        <ScoreCard
          label="Decay-Adjusted Readiness"
          value={decayAdjustedMastery !== null ? `${decayAdjustedMastery}%` : `${summary.overallMastery || 0}%`}
          suffix={decayedSkillsCount > 0 ? ` (${decayedSkillsCount} skills fading)` : " (All sharp)"}
          accent={decayedSkillsCount > 0 ? "amber" : "teal"}
        />
        <ScoreCard
          label="Latest quiz score"
          value={latestQuiz ? `${latestQuiz.accuracy}%` : "0%"}
          suffix={latestQuiz ? ` in ${latestQuiz.skillName || "JS"}` : ""}
          accent="teal"
        />
        <ScoreCard
          label="Latest task score"
          value={latestTask ? `${latestTask.taskScore}%` : "None"}
          suffix=""
          accent="amber"
        />
      </div>

      {/* Skills Needing Attention & Current Topic */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Skills Needing Attention */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink-950 text-base sm:text-lg">
                Skills Needing Attention
              </h2>
              <span className="text-xs text-teal-700 font-bold hover:underline cursor-pointer" onClick={() => navigate("/skill-profile")}>
                View Skill Profile →
              </span>
            </div>

            <div className="space-y-3.5">
              {summary.topGaps.length ? (
                summary.topGaps.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-800 font-semibold">{s.name}</span>
                      <span className="text-ink-500 font-medium">
                        Current: <strong>{s.currentScore}%</strong> / Target: {s.requiredScore}%
                      </span>
                    </div>
                    <ProgressBar value={s.currentScore} max={s.requiredScore} color="amber" showLabel={false} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-500">No skills need attention — keep it up!</p>
              )}
            </div>
          </div>

          {decayedSkillsCount > 0 && (
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
              <span className="text-amber-700 font-semibold">{decayedSkillsCount} skill{decayedSkillsCount !== 1 ? "s" : ""} fading — review soon</span>
              <button onClick={() => navigate("/knowledge-refresh")} className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Refresh →
              </button>
            </div>
          )}
        </Card>

        {/* Current Learning & Next Step */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Current Learning Focus
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Active Topic
              </span>
            </div>

            <h3 className="font-display font-extrabold text-lg text-ink-950">
              React State Management
            </h3>
            <p className="text-xs text-ink-600 mt-1 leading-relaxed">
              Focusing on Context API, lifting state up, avoiding stale closures in event handlers, and unidirectional data flow.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-paper/80 border border-line">
              <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">
                Next Recommended Step
              </p>
              <p className="text-xs font-semibold text-ink-800">
                Complete the React form with validation practical task.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-2">
            <Button variant="accent" size="sm" onClick={() => navigate("/learning?skill=react")}>
              Continue Learning →
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/real-world-task?skill=react")}>
              Try Practical Task
            </Button>
          </div>
        </Card>
      </div>

      {/* Skill Trend & Learning Insights (Section 26) */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Skill Trend Chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-ink-950 text-base">
                Skill Learning Trend
              </h2>
              <p className="text-xs text-ink-500">Trajectory across calibration intervals</p>
            </div>
            <span className="text-xs font-bold text-teal-700">Trajectory: Improving ↗</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallSkillTimeline} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#28565F" }} stroke="#DEDCD3" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#28565F" }} stroke="#DEDCD3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #DEDCD3",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
                <Line type="monotone" dataKey="overallReadiness" name="Overall Mastery" stroke="#246B62" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="JavaScript" name="JavaScript" stroke="#F0AD3F" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="React" name="React" stroke="#4F9D91" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Learning Insights Widget */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h2 className="font-display font-bold text-ink-950 text-base">
                  Learning Insights
                </h2>
              </div>
              <button
                onClick={() => navigate("/learning-insights")}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Full AI Dashboard →
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-emerald-900 font-bold block">Strongest Improvement:</span>
                  <span className="text-emerald-800">JavaScript +18% (Async & Promises)</span>
                </div>
                <span className="text-base">🚀</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-amber-900 font-bold block">Weakest Area:</span>
                  <span className="text-amber-800">React State Management (35%)</span>
                </div>
                <span className="text-base">⚠️</span>
              </div>

              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-teal-900 font-bold block">AI Projection:</span>
                  <span className="text-teal-800">On pace to reach 80% full-stack readiness in 4 weeks</span>
                </div>
                <span className="text-base">🎯</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-500">
            <span>Continuous Bayesian updates</span>
            <span className="text-teal-700 font-semibold">Healthy Learning Velocity</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed (Section 26) */}
      <Card className="p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <h2 className="font-display font-bold text-ink-950 text-base">
              Recent Activity Feed
            </h2>
          </div>
          <button
            onClick={() => navigate("/learning-history")}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            View Full Learning History →
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {recentActivities.map((act) => (
            <div key={act.id} className="p-3 rounded-xl bg-paper/70 border border-line flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-ink-500 mb-1">
                  <span className="text-teal-800 uppercase">{act.type}</span>
                  <span>{act.date}</span>
                </div>
                <p className="font-semibold text-ink-900 mt-0.5">{act.skill}</p>
                <p className="text-ink-600 line-clamp-2 mt-0.5 text-[11px]">{act.note}</p>
              </div>
              {act.score !== undefined && (
                <div className="mt-2 text-right">
                  <span className="font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-line">
                    {act.score}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Navigation Footer Links */}
      <div className="flex gap-3 flex-wrap pt-2">
        <Button variant="accent" onClick={() => navigate("/adaptive-roadmap")}>
          View Adaptive Roadmap
        </Button>
        <Button variant="outline" onClick={() => navigate("/knowledge-refresh")}>
          Knowledge Refresh
        </Button>
        <Button variant="ghost" onClick={() => navigate("/skill-profile")}>
          Skill profile
        </Button>
        <Button variant="ghost" onClick={() => navigate("/learning-history")}>
          Learning history
        </Button>
      </div>
    </Layout>
  );
}
