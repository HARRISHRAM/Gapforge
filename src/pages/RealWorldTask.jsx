import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import TaskCard from "../components/TaskCard";
import ProgressBar from "../components/ProgressBar";
import TaskCompilerRunner from "../components/TaskCompilerRunner";
import { getTaskForSkill } from "../data/tasks";
import { evaluateTask } from "../services/taskService";
import { compileAndRunTests } from "../services/taskCompiler";
import { useApp } from "../App";

export default function RealWorldTask() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, update } = useApp();
  const skillId = params.get("skill") || "css";
  const skill = state.skills?.find((s) => s.id === skillId) || {
    id: skillId,
    name: skillId.toUpperCase(),
    currentScore: 45,
    requiredScore: 80,
  };
  const task = getTaskForSkill(skillId);

  const [submission, setSubmission] = useState(task?.starterCode || "");
  const [evaluating, setEvaluating] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const handleCodeChange = (newCode) => {
    setSubmission(newCode);
    setSubmitError("");
  };

  const handleResetCode = () => {
    setSubmission(task?.starterCode || "");
    setSubmitError("");
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setEvaluating(true);

    // Step 1: Compile and run test assertions
    let currentTests = testResults;
    try {
      currentTests = await compileAndRunTests(skillId, submission, task);
      setTestResults(currentTests);
    } catch (err) {
      setSubmitError("Compilation failed: " + err.message);
      setEvaluating(false);
      return;
    }

    // Step 2: Strict Anti-Cheat & Direct Print Check
    const hasCheat = currentTests.testCases?.some((t) => t.id.includes("cheat") && !t.passed);
    if (hasCheat) {
      setSubmitError(
        "❌ Direct print statement detected! Print/console statements (e.g. console.log, print) or dummy text are strictly rejected. You must implement the required code structure."
      );
      setEvaluating(false);
      return;
    }

    // Step 3: Strict Test Case Requirement - ALL test cases must pass
    if (!currentTests.allPassed) {
      setSubmitError(
        `❌ Submission Blocked: All test cases must pass before you can submit (currently ${currentTests.passedCount}/${currentTests.totalCount} passed). Please resolve the failed tests in the compiler editor above.`
      );
      setEvaluating(false);
      return;
    }

    // Step 4: Evaluate with AI & Update Skill
    try {
      const res = await evaluateTask(skillId, skill.currentScore, submission, currentTests);
      const updatedSkills = (state.skills || []).map((s) =>
        s.id === skillId
          ? {
              ...s,
              currentScore: Math.min(100, Math.max(0, res.newScore)),
              history: [
                ...(s.history || []),
                {
                  source: "task",
                  score: Math.min(100, Math.max(0, res.newScore)),
                  date: new Date().toISOString(),
                },
              ],
            }
          : s
      );

      // Record activity in learning history timeline
      const newActivity = {
        id: `act_${Date.now()}`,
        type: "Practical Task",
        activityType: "practical_task",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: new Date().toISOString().split("T")[0],
        skill: skill.name,
        skillId,
        score: res.taskScore,
        note: `${task.title} verified & passed (${res.taskScore}%)`,
        badge: "Practical Proof",
      };

      update({
        skills: updatedSkills,
        taskResults: [...(state.taskResults || []), res],
        activityTimeline: [newActivity, ...(state.activityTimeline || [])],
      });

      setResult(res);
    } catch (err) {
      setSubmitError("Evaluation error: " + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Section 14: After evaluation display
  if (result) {
    return (
      <Layout>
        <BackButton to="/dashboard" label="Dashboard" />
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-6 text-center border-teal-300 shadow-sm">
            <div className="w-16 h-16 mx-auto bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-3xl mb-3">
              🎉
            </div>

            <p className="text-xs uppercase font-extrabold tracking-wider text-teal-700">
              Practical Task Verification Complete
            </p>
            <p className="font-display font-extrabold text-5xl text-ink-950 mt-1">
              Task Score: {result.taskScore}%
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                ✓ {result.testsPassed || "All Test Cases Passed"}
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-2">
              {result.evaluatedBy}
            </p>

            {/* Section 14: Skill Update */}
            <div className="my-6 p-4 rounded-xl bg-paper/80 border border-line text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-ink-700">
                  Skill Update: {skill.name}
                </span>
                <span className="text-xs font-bold text-teal-700">
                  +{result.newScore - result.oldScore}% Gain!
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="text-center">
                  <span className="text-[11px] text-ink-500 font-semibold block">Before</span>
                  <span className="font-display font-bold text-xl text-ink-600">
                    {result.oldScore}%
                  </span>
                </div>
                <span className="text-teal-600 font-bold text-2xl">→</span>
                <div className="text-center">
                  <span className="text-[11px] text-teal-800 font-semibold block">After</span>
                  <span className="font-display font-extrabold text-2xl text-teal-700">
                    {result.newScore}%
                  </span>
                </div>
              </div>

              <ProgressBar value={result.newScore} max={skill.requiredScore || 80} color="teal" showLabel={false} />
            </div>

            {/* Section 14: Strong vs Needs Improvement Breakdown */}
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-6">
              {/* Strong */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-xs font-bold uppercase text-emerald-900 mb-2 flex items-center gap-1.5">
                  <span>✓</span> Strong Concepts
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {result.strong?.map((st, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-bold bg-white text-emerald-800 border border-emerald-300"
                    >
                      {st}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  {result.strengths}
                </p>
              </div>

              {/* Needs Improvement */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <p className="text-xs font-bold uppercase text-amber-900 mb-2 flex items-center gap-1.5">
                  <span>ℹ️</span> Evaluator Note
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {result.needsImprovement?.length > 0 ? (
                    result.needsImprovement.map((ni, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-xs font-bold bg-white text-amber-900 border border-amber-300"
                      >
                        {ni}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-emerald-800 border border-emerald-300">
                      Zero Defects
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  {result.improvements}
                </p>
              </div>
            </div>

            {/* Call to action navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate("/adaptive-roadmap")}
              >
                View Adaptive Roadmap →
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton to={skillId ? `/quiz?skill=${skillId}` : "/roadmap"} label="Back to Quiz" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
            Real-World Skill Proof
          </h1>
          <p className="text-ink-600 text-sm mt-1">
            Build and submit practical solutions to establish verifiable skill evidence.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <TaskCard task={task} />

        {/* Section 14: Interactive Compiler, Live Preview & Automated Test Runner */}
        <TaskCompilerRunner
          skillId={skillId}
          task={task}
          code={submission}
          onChangeCode={handleCodeChange}
          onResetCode={handleResetCode}
          onCompileResults={setTestResults}
          isEvaluating={evaluating}
        />

        {/* Submission Gate Card */}
        <Card className="p-6">
          {submitError && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <span className="text-xl leading-none">⚠️</span>
              <div className="space-y-1">
                <p className="font-bold text-rose-950 uppercase tracking-wide">
                  Submission Rejected
                </p>
                <p className="leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-ink-950">
                  Ready to Submit?
                </span>
                {testResults?.allPassed ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                    <span>✓</span> All Tests Passing
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    {testResults?.passedCount || 0} / {testResults?.totalCount || 0} Tests Passing
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Submitting updates your {skill.name} score from {skill.currentScore}% towards target {skill.requiredScore || 80}%.
                Must pass 100% of test cases.
              </p>
            </div>

            <Button
              variant={testResults?.allPassed ? "accent" : "outline"}
              size="lg"
              disabled={evaluating}
              onClick={handleSubmit}
              className={`font-bold shadow-xs whitespace-nowrap transition-all ${
                testResults?.allPassed
                  ? "bg-amber-400 hover:bg-amber-500 text-ink-950 ring-2 ring-amber-300"
                  : "hover:border-rose-400"
              }`}
            >
              {evaluating
                ? "Running Compiler & AI Tests..."
                : testResults?.allPassed
                ? "Submit Verified Solution →"
                : "Verify & Submit Solution →"}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
