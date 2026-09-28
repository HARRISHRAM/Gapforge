import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import QuestionCard from "../components/QuestionCard";
import CodeReviewCard from "../components/CodeReviewCard";
import AssessmentTimer from "../components/AssessmentTimer";
import ProgressBar from "../components/ProgressBar";
import { fetchAssessment, submitAssessment } from "../services/assessmentService";
import { getCareerById } from "../data/careers";
import { getCareerReadinessScore, isAssessmentUnlocked, ASSESSMENT_UNLOCK_THRESHOLD } from "../utils/skillCalculations";
import useAssessmentProctor from "../hooks/useAssessmentProctor";
import AssessmentProctorGate, { ProctorOverlay } from "../components/AssessmentProctor";
import { useApp } from "../App";

export default function Assessment() {
  const { state, update, recordAttempt } = useApp();
  const navigate = useNavigate();

  const [rawQuestions, setRawQuestions] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [questionSet, setQuestionSet] = useState("all");
  const noRepeatActive = true;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeNotice, setTimeNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shownCorrect, setShownCorrect] = useState({}); // track which questions have shown correct answer

  const career = getCareerById(state.selectedCareer) || getCareerById("fullstack");

  // Unlock only when career readiness is strictly above 80% (70–80% stays locked).
  const readinessScore = useMemo(() => {
    return getCareerReadinessScore(state.skills || [], career);
  }, [state.skills, career]);

  const assessmentUnlocked = isAssessmentUnlocked(state.skills || [], career);
  const hasCompletedCourse = assessmentUnlocked;

  const proctor = useAssessmentProctor({ active: assessmentUnlocked && !finished });
  const {
    videoRef,
    cameraReady,
    cameraError,
    fullscreenOn,
    proctorWarning,
    faceStatus,
    tabSwitchCount,
    sessionStarted,
    startCamera,
    enterFullscreen,
    startSession,
    getMetrics,
  } = proctor;

  // Adaptive difficulty tracking
  const [adaptiveFeedback, setAdaptiveFeedback] = useState("");
  const [currentPerformanceTier, setCurrentPerformanceTier] = useState("Intermediate");

  // Load questions
  useEffect(() => {
    if (!state.selectedCareer || !hasCompletedCourse) return;
    fetchAssessment(state.selectedCareer, {
      excludeAttempted: noRepeatActive,
      questionSetId: questionSet,
    }).then((data) => {
      setRawQuestions(data);
      setIndex(0);
    });
  }, [state.selectedCareer, questionSet, noRepeatActive, hasCompletedCourse]);

  const questions = useMemo(() => {
    if (!rawQuestions) return [];
    if (filterMode === "code_review") return rawQuestions.filter((q) => q.type === "code_review");
    if (filterMode === "mcq") return rawQuestions.filter((q) => q.type !== "code_review");
    return rawQuestions;
  }, [rawQuestions, filterMode]);

  useEffect(() => {
    if (index >= questions.length && questions.length > 0) setIndex(0);
  }, [filterMode, questions.length, index]);

  if (!state.selectedCareer) {
    return (
      <Layout>
        <EmptyState
          title="Pick a career first"
          message="We need to know your target career before we can build a personalized assessment."
          action={<Button variant="accent" onClick={() => navigate("/careers")}>Choose a career</Button>}
        />
      </Layout>
    );
  }

  if (!hasCompletedCourse && !finished) {
    return (
      <Layout>
        <BackButton to="/roadmap" label="Roadmap" />
        <div className="max-w-xl mx-auto py-8">
          <Card className="text-center p-8 border-amber-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl mb-4">
              🔒
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Prerequisite Locked
            </span>
            <h2 className="font-display font-black text-2xl text-ink-950 mt-3 mb-2">
              Career Assessment is Locked
            </h2>
            <p className="text-sm text-ink-600 leading-relaxed mb-6">
              To unlock this benchmark assessment, career readiness must be <strong>strictly above {ASSESSMENT_UNLOCK_THRESHOLD}%</strong> (81%+).
              A score of 70% or even {ASSESSMENT_UNLOCK_THRESHOLD}% keeps it locked.
              Your current progress is <strong className="text-amber-800">{readinessScore}%</strong>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="accent" onClick={() => navigate("/roadmap")}>
                Continue Learning Roadmap (Current: {readinessScore}%) →
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!rawQuestions) {
    return (
      <Layout>
        <Loading message={`Preparing dynamic ${career?.name || "career"} assessment questions...`} />
      </Layout>
    );
  }

  if (!sessionStarted) {
    return (
      <Layout>
        <BackButton to="/roadmap" label="Roadmap" />
        <div className="max-w-xl mx-auto py-8">
          <AssessmentProctorGate
            careerName={career?.name || "career"}
            videoRef={videoRef}
            cameraReady={cameraReady}
            cameraError={cameraError}
            fullscreenOn={fullscreenOn}
            faceStatus={faceStatus}
            onEnableCamera={startCamera}
            onEnterFullscreen={enterFullscreen}
            onStart={startSession}
          />
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <EmptyState
          title="No questions in this filter"
          message="Switch to 'All Questions' or disable No-Repeat filter to view available questions."
          action={
            <Button variant="primary" onClick={() => { setFilterMode("all"); }}>
              Reset filters
            </Button>
          }
        />
      </Layout>
    );
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;
  const isCodeReview = q?.type === "code_review";
  const questionDuration = isCodeReview ? 65 : 45;

  const isPreviouslyAttempted = state.attemptedQuestions?.includes(q?.id);
  const difficultyLabel =
    typeof q?.difficulty === "string"
      ? q.difficulty
      : q?.difficulty === 3
      ? "hard"
      : q?.difficulty === 2
      ? "medium"
      : "easy";

  const handleSelect = (optionIndex) => {
    if (answers[q.id] !== undefined) return; // prevent re-answering
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    recordAttempt(q.id);

    const isCorrect = optionIndex === q.correct;
    if (isCorrect) {
      setCurrentPerformanceTier("Advanced");
      setAdaptiveFeedback("✓ Correct answer! Calibrating to higher difficulty challenge.");
    } else {
      setCurrentPerformanceTier("Developing");
      setAdaptiveFeedback("Incorrect — the correct answer is shown below.");
      // Show correct answer after a wrong answer
      setShownCorrect((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const handleFinish = async (latestAnswers = answers) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const scores = await submitAssessment(state.selectedCareer, latestAnswers, getMetrics());
      const updatedSkills = (career?.requiredSkills || []).map((rs) => ({
        id: rs.skillId,
        name: rs.name,
        category: rs.category,
        requiredScore: rs.requiredScore,
        currentScore: scores[rs.skillId] ?? 40,
        history: [{ source: "assessment", score: scores[rs.skillId] ?? 40 }],
      }));

      // Calculate score for certificate
      const correctCount = questions.filter((item) => latestAnswers[item.id] === item.correct).length;
      const scorePercent = Math.round((correctCount / questions.length) * 100);
      const passed = scorePercent > ASSESSMENT_UNLOCK_THRESHOLD;

      setFinished(true);
      update({
        skills: updatedSkills,
        assessmentAnswers: latestAnswers,
        assessmentCertificate: passed
          ? {
              careerName: career?.name || "Career",
              scorePercent,
              correctCount,
              total: questions.length,
              date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              issued: new Date().toISOString(),
            }
          : null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    setTimeNotice(`Time's up for Question ${index + 1}!`);
    setTimeout(() => setTimeNotice(null), 2000);
    if (isLast) {
      handleFinish(answers);
    } else {
      setAdaptiveFeedback("");
      setIndex((i) => i + 1);
    }
  };

  // ── Completed State View with Certificate ──
  if (finished) {
    const totalAnswered = Object.keys(answers).length;
    const correctCount = questions.filter((item) => answers[item.id] === item.correct).length;
    const prQuestions = questions.filter((item) => item.type === "code_review");
    const prCorrectCount = prQuestions.filter((item) => answers[item.id] === item.correct).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercent > ASSESSMENT_UNLOCK_THRESHOLD;

    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center py-10 px-6 border-teal-200">
            <div className="w-16 h-16 mx-auto bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl mb-4">
              🎉
            </div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-ink-900">
              Assessment Completed!
            </h2>
            <p className="text-ink-600 mt-2 max-w-md mx-auto">
              We evaluated your skills for <span className="font-semibold text-ink-900">{career?.name}</span> across theoretical knowledge and code reviews.
            </p>

            {/* Score Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 max-w-lg mx-auto">
              <div className="p-3 rounded-xl bg-paper border border-line">
                <p className="text-xs text-ink-500 font-semibold uppercase">Total Score</p>
                <p className="font-display font-bold text-2xl text-teal-700 mt-1">
                  {correctCount} / {questions.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-700 font-semibold uppercase">Bugs Spotted</p>
                <p className="font-display font-bold text-2xl text-purple-800 mt-1">
                  {prCorrectCount} / {prQuestions.length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-paper border border-line col-span-2 sm:col-span-1">
                <p className="text-xs text-ink-500 font-semibold uppercase">Answered</p>
                <p className="font-display font-bold text-2xl text-ink-800 mt-1">
                  {totalAnswered} / {questions.length}
                </p>
              </div>
            </div>

            {/* Tab Switch Warning in Results */}
            {tabSwitchCount > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                ⚠️ Tab switches detected during assessment: {tabSwitchCount} time{tabSwitchCount > 1 ? "s" : ""}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
              <Button variant="accent" size="lg" onClick={() => navigate("/skill-profile")}>
                View visual skill profile →
              </Button>
              <Button variant="outline" onClick={() => navigate("/skill-gaps")}>
                View skill gaps
              </Button>
            </div>
          </Card>

          {/* ── Assessment Certificate ── */}
          <div
            id="assessment-certificate"
            className="relative overflow-hidden rounded-2xl border-4 border-double border-teal-300 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-8 text-center shadow-xl"
          >
            {/* Decorative corner accents */}
            <div className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

            <div className="mb-2 flex justify-center">
              <span className="text-5xl">{passed ? "🏆" : "🎓"}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-600 mb-1">
              GapForge — Certificate of Assessment
            </p>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-ink-950 mt-1">
              {state.profile?.name || state.user?.name || "Student"}
            </h3>
            <p className="text-sm text-ink-600 mt-2">
              has successfully completed the
            </p>
            <p className="font-display font-extrabold text-xl text-teal-800 mt-1">
              {career?.name} Diagnostic Assessment
            </p>

            <div className="flex items-center justify-center gap-4 mt-5 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-teal-700">{scorePercent}%</p>
                <p className="text-[11px] text-ink-500 uppercase font-semibold">Score</p>
              </div>
              <div className="h-10 w-px bg-line" />
              <div className="text-center">
                <p className="text-3xl font-black text-ink-900">{correctCount}/{questions.length}</p>
                <p className="text-[11px] text-ink-500 uppercase font-semibold">Correct</p>
              </div>
              <div className="h-10 w-px bg-line" />
              <div className="text-center">
                <p className="text-lg font-black" style={{ color: passed ? "#246B62" : "#B45309" }}>
                  {passed ? "PASSED (>80%)" : "NOT PASSED"}
                </p>
                <p className="text-[11px] text-ink-500 uppercase font-semibold">
                  {passed ? "Certificate unlocked" : "Need above 80%"}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-400 mt-3">
              Issued on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <div className="mt-4 pt-4 border-t border-teal-200 flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
              >
                🖨️ Print Certificate
              </button>
            </div>
          </div>

          {/* Pull Request Bug Review Breakdown */}
          {prQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
                <span>🔍</span> Code Review &amp; Bug Hunt Explanations
              </h3>
              {prQuestions.map((item, idx) => {
                const isCorrect = answers[item.id] === item.correct;
                const wasAnswered = answers[item.id] !== undefined;
                return (
                  <Card key={item.id} className="p-4 border-line">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-paper border border-line font-bold text-ink-700">
                          {item.pr?.prNumber || `#PR-${idx + 1}`}
                        </span>
                        <h4 className="font-semibold text-ink-900 text-sm">{item.pr?.title}</h4>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                          !wasAnswered
                            ? "bg-amber-100 text-amber-800"
                            : isCorrect
                            ? "bg-teal-100 text-teal-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {!wasAnswered ? "Timed Out" : isCorrect ? "✓ Spotted Bug" : "✕ Missed Bug"}
                      </span>
                    </div>
                    {!isCorrect && wasAnswered && item.options && (
                      <div className="mb-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                        <span className="font-bold">Correct Answer: </span>
                        {item.options[item.correct]}
                      </div>
                    )}
                    <div className="mt-2 bg-teal-50/60 p-3 rounded-lg border border-teal-200/80 text-xs text-ink-800 leading-relaxed">
                      <span className="font-bold text-teal-800">Senior Dev Analysis: </span>
                      {item.explanation}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const mcqCount = rawQuestions.filter((item) => item.type !== "code_review").length;
  const prCount = rawQuestions.filter((item) => item.type === "code_review").length;

  return (
    <Layout>
      <ProctorOverlay
        videoRef={videoRef}
        faceStatus={faceStatus}
        fullscreenOn={fullscreenOn}
        warning={proctorWarning}
      />

      <div className="max-w-2xl mx-auto space-y-6" style={{ marginTop: proctorWarning ? "52px" : "0" }}>
        {/* Assessment Header */}
        <BackButton to="/dashboard" label="Dashboard" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                Career Diagnostic Assessment
              </span>
              <span className="text-xs px-2 py-0.5 bg-paper rounded border border-line text-ink-600 font-mono">
                {career?.name}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-ink-900 mt-1">
              Adaptive Skill Calibration
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
            <span className="text-ink-500 font-semibold">Bank:</span>
            <select
              value={questionSet}
              onChange={(e) => setQuestionSet(e.target.value)}
              className="rounded-lg border border-line bg-paper px-2 py-1 font-semibold text-ink-800 focus-ring"
            >
              <option value="all">Full Question Pool</option>
              <option value="set_alpha">Set Alpha (Core)</option>
              <option value="set_beta">Set Beta (Advanced)</option>
            </select>
          </div>
        </div>

        {/* Tab switch info bar */}
        {tabSwitchCount > 0 && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-800 flex items-center gap-2">
            ⚠️ Tab switches recorded: <strong>{tabSwitchCount}</strong> — this is logged and affects your integrity score.
          </div>
        )}

        {/* Adaptive Assessment Info Bar */}
        <div className="rounded-xl bg-gradient-to-r from-teal-50 to-amber-50/50 border border-teal-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-900">Current Level: {currentPerformanceTier}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-teal-200 text-teal-900">
                Adaptive UI Active
              </span>
            </div>
            <p className="text-teal-800/80 mt-0.5">Questions adapt to your performance.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-teal-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-teal-200">
              Calibrated for {career?.name}
            </span>
          </div>
        </div>

        {/* Question Type Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center bg-paper p-1 rounded-xl border border-line text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setFilterMode("all"); setIndex(0); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "all" ? "bg-white text-ink-900 shadow-xs" : "text-ink-600 hover:text-ink-900"}`}
            >
              All ({rawQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode("code_review"); setIndex(0); }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${filterMode === "code_review" ? "bg-purple-100 text-purple-900 shadow-xs font-bold" : "text-ink-600 hover:text-ink-900"}`}
            >
              <span>🔍</span> Spot the Bug ({prCount})
            </button>
            <button
              type="button"
              onClick={() => { setFilterMode("mcq"); setIndex(0); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "mcq" ? "bg-white text-ink-900 shadow-xs" : "text-ink-600 hover:text-ink-900"}`}
            >
              MCQs ({mcqCount})
            </button>
          </div>
        </div>

        {/* Progress & Question Metadata Bar */}
        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-paper border border-line text-ink-700">
                ID: {q.id}
              </span>
              <span className="font-bold text-teal-800">{q.skill || q.skillId?.toUpperCase()}</span>
              {q.topic && (
                <span className="text-ink-600 font-medium">
                  Topic: <strong className="text-ink-900">{q.topic}</strong>
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  difficultyLabel === "hard"
                    ? "bg-rose-100 text-rose-800"
                    : difficultyLabel === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                Difficulty: {difficultyLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isPreviouslyAttempted
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isPreviouslyAttempted ? "Previously Seen" : "Fresh Question"}
              </span>

              {/* Per-Question Countdown Timer — no pause */}
              <AssessmentTimer
                key={q.id}
                duration={questionDuration}
                questionKey={q.id}
                onTimeUp={handleTimeUp}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-ink-500 mb-1">
            <span>Question {index + 1} of {questions.length}</span>
            <span>{Math.round(((index + 1) / questions.length) * 100)}% Completed</span>
          </div>

          <ProgressBar value={index + 1} max={questions.length} showLabel={false} />

          {/* Adaptive Live Feedback */}
          {adaptiveFeedback && (
            <div className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-between border ${
              adaptiveFeedback.startsWith("✓")
                ? "text-teal-900 bg-teal-50 border-teal-200"
                : "text-rose-900 bg-rose-50 border-rose-200"
            }`}>
              <span>{adaptiveFeedback}</span>
              <span className="text-[11px] font-mono opacity-70">Dynamic Calibration</span>
            </div>
          )}

          {/* Show correct answer when wrong */}
          {shownCorrect[q.id] && answers[q.id] !== undefined && answers[q.id] !== q.correct && q.options && (
            <div className="mt-2 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              ✅ <span className="font-bold">Correct Answer:</span> {q.options[q.correct]}
            </div>
          )}

          {/* Time Expired Notice */}
          {timeNotice && (
            <div className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center justify-between animate-fadeIn">
              <span>⏱ {timeNotice}</span>
              <span className="text-[11px] text-rose-500">Auto-advancing to next question</span>
            </div>
          )}
        </div>

        {/* Current Question */}
        <Card className="border-line shadow-xs">
          {isCodeReview ? (
            <CodeReviewCard
              question={q}
              index={index}
              total={questions.length}
              selected={answers[q.id]}
              onSelect={handleSelect}
            />
          ) : (
            <QuestionCard
              question={q}
              index={index}
              total={questions.length}
              selected={answers[q.id]}
              onSelect={handleSelect}
            />
          )}

          {/* Navigation Controls — Previous is DISABLED, no going back */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-line">
            <div className="text-xs text-ink-400 font-medium italic">
              ← Previous questions cannot be revisited
            </div>

            <div className="flex items-center gap-2">
              {!isLast && answers[q.id] === undefined && (
                <button
                  type="button"
                  onClick={() => { setAdaptiveFeedback(""); setShownCorrect((p) => ({ ...p, [q.id]: false })); setIndex((i) => i + 1); }}
                  className="text-xs text-ink-500 hover:text-ink-800 font-medium px-3 py-2"
                >
                  Skip for now →
                </button>
              )}

              {isLast ? (
                <Button
                  variant="accent"
                  disabled={submitting}
                  onClick={() => handleFinish(answers)}
                >
                  {submitting ? "Scoring Assessment..." : "Finish Assessment"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => { setAdaptiveFeedback(""); setShownCorrect((p) => ({ ...p, [q.id]: false })); setIndex((i) => i + 1); }}
                >
                  Next Question →
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
