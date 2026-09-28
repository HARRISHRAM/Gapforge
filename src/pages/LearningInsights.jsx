import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { useApp } from "../App";

export default function LearningInsights() {
  const { state } = useApp();
  const navigate = useNavigate();

  const skills = state.skills || [];
  const quizzes = state.quizResults || [];
  const courses = state.courses || [];
  const projects = state.projects || [];
  const timeline = state.activityTimeline || [];

  // Derive simple, clear insights from user state
  const insights = useMemo(() => {
    if (!skills.length && !quizzes.length && !courses.length) {
      return null;
    }

    // Sort skills by current score
    const sortedByScore = [...skills].sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0));
    const strongestSkill = sortedByScore[0];

    // Sort skills by gap size
    const sortedByGap = [...skills].sort((a, b) => {
      const gapA = Math.max(0, (a.requiredScore || 75) - (a.currentScore || 0));
      const gapB = Math.max(0, (b.requiredScore || 75) - (b.currentScore || 0));
      return gapB - gapA;
    });
    const biggestGapSkill = sortedByGap[0];
    const biggestGap = biggestGapSkill
      ? Math.max(0, (biggestGapSkill.requiredScore || 75) - (biggestGapSkill.currentScore || 0))
      : 0;

    const latestQuiz = quizzes[quizzes.length - 1];

    return {
      strongestSkill,
      biggestGapSkill,
      biggestGap,
      latestQuiz,
      totalActivities: timeline.length,
      completedCoursesCount: courses.length,
      syncedProjectsCount: projects.length,
    };
  }, [skills, quizzes, courses, projects, timeline]);

  return (
    <Layout>
      <BackButton to="/dashboard" label="Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              AI Learning Insights
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Simple & Actionable
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Clear, easy-to-understand advice tailored to your learning progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="accent" size="sm" onClick={() => navigate("/roadmap")}>
            View Roadmap →
          </Button>
        </div>
      </div>

      {!insights ? (
        <EmptyState
          title="No learning data recorded yet"
          message="Welcome to GapForge! Complete your first topic lesson or take a quiz to see your personalized AI recommendations here."
          action={
            <Button variant="accent" onClick={() => navigate("/roadmap")}>
              Go to Roadmap & Start Learning →
            </Button>
          }
        />
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* 1. Quick Summary Card */}
          <Card className="p-6 bg-gradient-to-br from-teal-50/50 via-white to-paper border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <h2 className="font-display font-bold text-lg text-ink-950">
                Your Progress Summary
              </h2>
            </div>
            <p className="text-sm text-ink-800 leading-relaxed">
              You currently have <strong className="text-ink-950">{skills.length} skills tracked</strong>, with{" "}
              <strong className="text-teal-700">{courses.length} verified courses</strong> and{" "}
              <strong className="text-teal-700">{projects.length} GitHub projects</strong> in your profile.
              {insights.strongestSkill && (
                <> Your top skill is <strong>{insights.strongestSkill.name}</strong> with a score of <strong>{insights.strongestSkill.currentScore}%</strong>.</>
              )}
            </p>
          </Card>

          {/* 2. Clear Next Action Card */}
          {insights.biggestGapSkill && (
            <Card className="p-6 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Top Priority For Today
              </span>
              <h3 className="font-display font-bold text-xl text-ink-950 mt-2 mb-1">
                Focus on {insights.biggestGapSkill.name}
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">
                You have a <strong>{insights.biggestGap}% gap</strong> to reach your target of {insights.biggestGapSkill.requiredScore}%. Closing this will make the fastest difference in mastering your target career.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => navigate(`/quiz?skill=${insights.biggestGapSkill.id}`)}
                >
                  Take {insights.biggestGapSkill.name} Quiz ⚡
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/learning?skill=${insights.biggestGapSkill.id}`)}
                >
                  Read Lesson First →
                </Button>
              </div>
            </Card>
          )}

          {/* 3. Simple Breakdown Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* What's Going Well */}
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                ✓ What You're Doing Well
              </span>
              <p className="font-display font-bold text-base text-ink-950">
                {insights.strongestSkill ? insights.strongestSkill.name : "Consistent Learning"}
              </p>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                {insights.strongestSkill
                  ? `You've achieved ${insights.strongestSkill.currentScore}% in ${insights.strongestSkill.name}. Keep practicing to maintain your mastery.`
                  : "You are actively building up your learning history."}
              </p>
            </Card>

            {/* Quick Practice Tip */}
            <Card className="p-5 border-l-4 border-l-teal-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-1">
                ⚡ Simple Practice Tip
              </span>
              <p className="font-display font-bold text-base text-ink-950">
                Small Daily Steps
              </p>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                Completing just one 10-question quiz or milestone project per week keeps concepts fresh and steadily raises your skill scores.
              </p>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
}
