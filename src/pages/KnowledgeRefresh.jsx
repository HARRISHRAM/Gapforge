import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import ProgressBar from "../components/ProgressBar";
import {
  analyzeKnowledgeDecay,
  buildRefreshRoadmap,
  getOverallInactivityDays,
  formatInactivityDuration,
  DECAY_LEVEL,
  USER_ASSESSMENT,
  loadUserDecayFeedback,
  saveUserDecayFeedback,
  clearUserDecayFeedback,
} from "../utils/knowledgeDecay";
import { getRecapForSkill, generateDiagnosticQuiz } from "../data/decayContent";
import { useApp } from "../App";

// ─── Tab Constants ──────────────────────────────────────────────────
const TABS = {
  OVERVIEW: "overview",
  DIAGNOSTIC: "diagnostic",
  ROADMAP: "roadmap",
  FLASHCARDS: "flashcards",
};

// ─── Diagnostic Mini-Quiz Sub-Component ─────────────────────────────
function DiagnosticQuiz({ skillId, onComplete, onGoToRoadmap, onGoToCheatsheet }) {
  const quiz = useMemo(() => generateDiagnosticQuiz(skillId), [skillId]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState("question"); // "question" | "reveal"
  const [scores, setScores] = useState([]); // array of "knew" / "forgot"
  const [finished, setFinished] = useState(false);

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-500 text-sm">No diagnostic questions available for this skill yet.</p>
      </div>
    );
  }

  const question = quiz.questions[currentIdx];
  const knewCount = scores.filter((s) => s === "knew").length;

  const handleNext = () => {
    // Move from question phase to answer-reveal phase
    setPhase("reveal");
  };

  const handleResponse = (response) => {
    const newScores = [...scores, response];
    setScores(newScores);

    if (currentIdx + 1 >= quiz.questions.length) {
      setFinished(true);
      const knew = newScores.filter((s) => s === "knew").length;
      const total = newScores.length;
      const percent = Math.round((knew / total) * 100);
      if (onComplete) onComplete(skillId, percent, knew, total);
    } else {
      setCurrentIdx(currentIdx + 1);
      setPhase("question");
    }
  };

  if (finished) {
    const total = scores.length;
    const percent = Math.round((knewCount / total) * 100);
    const level =
      percent >= 80 ? "still_sharp" : percent >= 50 ? "slightly_rusty" : percent >= 25 ? "rusty" : "needs_review";
    const levelLabels = {
      still_sharp: { label: "Still Sharp", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
      slightly_rusty: { label: "Slightly Rusty", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
      rusty: { label: "Rusty", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
      needs_review: { label: "Needs Full Review", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    };
    const info = levelLabels[level];

    return (
      <div className="text-center py-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${info.bg} ${info.border} ${info.color} border mb-4`}>
          {info.label}
        </div>
        <p className="text-2xl font-display font-extrabold text-ink-950 mb-1">
          {knewCount}/{total} Correct
        </p>
        <p className="text-sm text-ink-600 mb-6">
          {percent >= 80
            ? "Great memory! This skill has been recalibrated as Still Sharp."
            : percent >= 50
            ? "Some gaps detected. This skill has been recalibrated as Rusty."
            : "Significant gaps detected. This skill has been marked as Lacking (Needs Refresh)."}
        </p>
        {percent < 50 ? (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center leading-relaxed">
              Your score indicates critical gaps in this skill. We recommend reviewing the cheat sheet or following your personalized refresh roadmap before re-testing.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="accent"
                size="sm"
                onClick={() => onGoToRoadmap && onGoToRoadmap()}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                </svg>
                Refresh Roadmap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGoToCheatsheet && onGoToCheatsheet()}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Cheat Sheets
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setCurrentIdx(0);
                setScores([]);
                setFinished(false);
                setPhase("question");
              }}
            >
              Retry Quiz
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Quiz Progress */}
      <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
        <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
        <span className="font-semibold text-teal-700">{quiz.skillName} Diagnostic</span>
      </div>
      <ProgressBar value={currentIdx + 1} max={quiz.questions.length} className="mb-6 h-1.5" />

      {/* Question Card */}
      <div className="min-h-[160px] p-6 rounded-2xl bg-paper/60 border border-line mb-6 flex flex-col justify-center">
        <p className="text-xs uppercase font-mono font-bold text-teal-700 mb-2">
          {question.category || "Concept Check"}
        </p>
        <h3 className="font-display font-bold text-base sm:text-lg text-ink-950">
          {question.question}
        </h3>

        {/* Answer section — visible only after clicking Next */}
        {phase === "reveal" && (
          <div className="mt-4 pt-4 border-t border-line/80 animate-in fade-in duration-200">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              Answer:
            </p>
            <p className="text-sm text-ink-700 leading-relaxed font-medium">
              {question.answer}
            </p>
            {question.tip && (
              <p className="text-xs text-ink-500 mt-2 italic bg-paper p-2.5 rounded-lg border border-line/50">
                Tip: {question.tip}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {phase === "question" ? (
        <div className="flex justify-center">
          <Button variant="accent" size="md" onClick={handleNext}>
            Next →
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-xs text-ink-500 font-medium">
            Did you know the answer before it was revealed?
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleResponse("forgot")}
              className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-sm transition-colors"
            >
              I Forgot This
            </button>
            <button
              onClick={() => handleResponse("knew")}
              className="px-5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-sm transition-colors"
            >
              I Knew It ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Flashcard Viewer Sub-Component ─────────────────────────────────
function FlashcardViewer({ skillId, onSetFeedback }) {
  const recap = useMemo(() => getRecapForSkill(skillId), [skillId]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!recap || !recap.cards || recap.cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-500 text-sm">No flashcards available for this skill yet.</p>
      </div>
    );
  }

  const card = recap.cards[currentIdx];
  const total = recap.cards.length;

  const nextCard = () => {
    setCurrentIdx((prev) => (prev + 1) % total);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentIdx((prev) => (prev - 1 + total) % total);
    setFlipped(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
        <span>Card {currentIdx + 1} of {total}</span>
        <span className="font-semibold text-teal-700">{recap.skillName} Quick Recap</span>
      </div>
      <ProgressBar value={currentIdx + 1} max={total} className="mb-6 h-1.5" />

      {/* Card Body */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[220px] p-6 rounded-2xl bg-gradient-to-br from-paper to-white border-2 border-teal-200/80 hover:border-teal-400 cursor-pointer transition-all shadow-xs flex flex-col justify-center select-none"
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 mb-2">
          {card.category || "Core Concept"} • Click to flip
        </span>

        {!flipped ? (
          <div>
            <h3 className="font-display font-bold text-lg text-ink-950 mb-2">
              {card.front}
            </h3>
            <p className="text-xs text-ink-400 mt-4">
              Tap anywhere to reveal summary & code syntax →
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <h4 className="font-display font-bold text-sm text-ink-900 mb-2">
              {card.front}
            </h4>
            <p className="text-sm text-ink-700 font-medium leading-relaxed mb-3">
              {card.back}
            </p>
            {card.code && (
              <pre className="p-3 rounded-xl bg-ink-950 text-ink-100 font-mono text-xs overflow-x-auto">
                <code>{card.code}</code>
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-5">
        <Button variant="outline" size="sm" onClick={prevCard} disabled={currentIdx === 0}>
          ← Previous
        </Button>
        <span className="text-xs font-mono text-ink-400">
          {currentIdx + 1} / {total}
        </span>
        <Button variant="outline" size="sm" onClick={nextCard}>
          Next →
        </Button>
      </div>

      {/* Quick feedback tagging from card */}
      {onSetFeedback && (
        <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs">
          <span className="text-ink-500 font-medium">How confident do you feel with this skill?</span>
          <div className="flex gap-2">
            <button
              onClick={() => onSetFeedback(skillId, USER_ASSESSMENT.LACKING)}
              className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors"
            >
              Still Lacking
            </button>
            <button
              onClick={() => onSetFeedback(skillId, USER_ASSESSMENT.SHARP)}
              className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
            >
              I Got It (Sharp)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabIcon({ id, className = "w-3.5 h-3.5 shrink-0" }) {
  switch (id) {
    case "overview":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "diagnostic":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case "roadmap":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        </svg>
      );
    case "cheat-sheets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Main Knowledge Refresh Page ────────────────────────────────────
export default function KnowledgeRefresh() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const initialTab = params.get("tab") || TABS.OVERVIEW;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // User-calibrated feedback state (loaded from and persisted to localStorage)
  const [userFeedback, setUserFeedback] = useState(() => loadUserDecayFeedback());
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const handleSetFeedback = (skillId, level) => {
    setUserFeedback((prev) => {
      const updated = { ...prev };
      if (updated[skillId] === level) {
        delete updated[skillId];
      } else {
        updated[skillId] = level;
      }
      saveUserDecayFeedback(updated);
      return updated;
    });

    const label =
      level === USER_ASSESSMENT.LACKING
        ? "marked as Lacking (Needs Refresh)"
        : level === USER_ASSESSMENT.RUSTY
        ? "marked as Rusty (Needs Quick Recap)"
        : "marked as Sharp (Still Known)";
    setFeedbackNotice(`Skill ${label}. Roadmap and quizzes updated!`);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleClearFeedback = () => {
    clearUserDecayFeedback();
    setUserFeedback({});
    setFeedbackNotice("Cleared all manual calibrations. Reverted to timeline estimates.");
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Compute decay analysis using user feedback as authoritative calibration
  const decayAnalysis = useMemo(
    () => analyzeKnowledgeDecay(state.skills || [], state.activityTimeline || [], userFeedback),
    [state.skills, state.activityTimeline, userFeedback]
  );

  const refreshRoadmap = useMemo(() => buildRefreshRoadmap(decayAnalysis), [decayAnalysis]);
  const inactivityDays = getOverallInactivityDays(state.activityTimeline || []);
  const durationText = formatInactivityDuration(inactivityDays);

  const decayedSkills = decayAnalysis.filter((d) => d.needsRefresh);
  const sharpSkills = decayAnalysis.filter((d) => !d.needsRefresh);
  const userCalibratedCount = Object.keys(userFeedback).length;

  const tabItems = [
    { key: TABS.OVERVIEW, label: "Overview", iconId: "overview" },
    { key: TABS.DIAGNOSTIC, label: "Diagnostic Quiz", iconId: "diagnostic" },
    { key: TABS.ROADMAP, label: "Refresh Roadmap", iconId: "roadmap" },
    { key: TABS.FLASHCARDS, label: "Cheat Sheets", iconId: "cheat-sheets" },
  ];

  // Select the first decayed/lacking skill by default if none is selected
  const effectiveSkill =
    selectedSkill || (decayedSkills.length > 0 ? decayedSkills[0].skillId : decayAnalysis[0]?.skillId);

  return (
    <Layout>
      <BackButton to="/dashboard" label="Dashboard" />

      {/* Floating feedback notification toast */}
      {feedbackNotice && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{feedbackNotice}</span>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-teal-600 hover:text-teal-800 text-sm font-bold ml-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
            Knowledge Refresh Center
          </h1>
          <p className="text-ink-600 mt-1 text-sm">
            It's been <strong className="text-amber-700">{durationText}</strong> since your last activity.
            {userCalibratedCount > 0
              ? ` Calibrated based on ${userCalibratedCount} self-reported skill preference${userCalibratedCount !== 1 ? "s" : ""}.`
              : " Calibrate your skills below so your catch-up plan matches what you actually forgot."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
            {decayedSkills.length} skill{decayedSkills.length !== 1 ? "s" : ""} need refresh
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
            {sharpSkills.length} still sharp
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-paper/80 border border-line mb-6 overflow-x-auto">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-white text-ink-950 shadow-sm border border-line"
                : "text-ink-500 hover:text-ink-700 hover:bg-white/50"
            }`}
          >
            <TabIcon id={tab.iconId} className={`w-3.5 h-3.5 ${activeTab === tab.key ? "text-teal-600" : "text-ink-400"}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─────────────────────────────────────────── */}
      {activeTab === TABS.OVERVIEW && (
        <div className="space-y-6">
          {/* Direct Skill Self-Assessment Hero Card */}
          <div className="p-5 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/60 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                    Interactive Calibration
                  </span>
                  {userCalibratedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {userCalibratedCount} skill{userCalibratedCount !== 1 ? "s" : ""} user-calibrated
                    </span>
                  )}
                </div>
                <h2 className="font-display font-bold text-base text-ink-950">
                  What skills are you lacking after your break?
                </h2>
                <p className="text-xs text-ink-600 mt-1 max-w-2xl leading-relaxed">
                  Instead of assuming memory loss from days elapsed, tell us directly what you remember vs what you forgot.
                  Your input immediately recalibrates your <strong>Refresh Roadmap</strong>, <strong>Diagnostic Mini-Quizzes</strong>, and <strong>Cheat Sheets</strong>.
                </p>
              </div>

              {userCalibratedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFeedback}
                  className="self-start md:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 text-ink-700 transition-colors shadow-2xs"
                >
                  Reset to Time Estimates
                </button>
              )}
            </div>

            {/* Quick Skill Selector Grid */}
            <div className="pt-3 border-t border-teal-100/80">
              <p className="text-[11px] font-bold text-ink-700 uppercase tracking-wider mb-2">
                Click your current confidence level for each skill:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {decayAnalysis.map((d) => (
                  <div
                    key={d.skillId}
                    className="p-2.5 rounded-xl bg-white/95 border border-line flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ink-900 truncate">
                        {d.skillName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          d.userFeedback === USER_ASSESSMENT.LACKING
                            ? "bg-red-100 text-red-800"
                            : d.userFeedback === USER_ASSESSMENT.RUSTY
                            ? "bg-amber-100 text-amber-800"
                            : d.userFeedback === USER_ASSESSMENT.SHARP
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-ink-600"
                        }`}
                      >
                        {d.userFeedback ? d.decayLabel : "Estimated"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleSetFeedback(d.skillId, USER_ASSESSMENT.LACKING)}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.LACKING
                            ? "bg-red-600 text-white shadow-2xs font-extrabold"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                        title="I forgot this skill completely"
                      >
                        Lacking
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetFeedback(d.skillId, USER_ASSESSMENT.RUSTY)}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.RUSTY
                            ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                        title="I need a quick recap"
                      >
                        Rusty
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetFeedback(d.skillId, USER_ASSESSMENT.SHARP)}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.SHARP
                            ? "bg-emerald-600 text-white shadow-2xs font-extrabold"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                        title="I still know this well"
                      >
                        Sharp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Knowledge Health Map */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-base text-ink-950">
                Knowledge Health Map
              </h2>
              <span className="text-xs text-ink-500 font-medium">
                {userCalibratedCount > 0 ? "Driven by your input" : "Timeline-based baseline"}
              </span>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              Retention levels dynamically adjust based on your self-ratings or time away. Click any card to launch its diagnostic quiz.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {decayAnalysis.map((d) => (
                <div
                  key={d.skillId}
                  className={`p-4 rounded-xl border ${d.decayColor.bg} ${d.decayColor.border} transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between`}
                  onClick={() => { setSelectedSkill(d.skillId); setActiveTab(TABS.DIAGNOSTIC); }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-ink-900">{d.skillName}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        d.userFeedback === USER_ASSESSMENT.LACKING ? "bg-red-100 text-red-800 border border-red-300"
                        : d.userFeedback === USER_ASSESSMENT.RUSTY ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : d.userFeedback === USER_ASSESSMENT.SHARP ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : `${d.decayColor.bg} ${d.decayColor.accent}`
                      }`}>
                        {d.decayLabel}
                      </span>
                    </div>

                    {/* Score comparison bar */}
                    <div className="flex items-center gap-3 text-xs mb-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-ink-500 mb-1">
                          <span>Last Known: {d.lastKnownScore}%</span>
                          <span>Now: <strong className={d.decayColor.accent}>{d.retainedScore}%</strong></span>
                        </div>
                        <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              d.decayLevel === DECAY_LEVEL.SHARP ? "bg-emerald-500"
                              : d.decayLevel === DECAY_LEVEL.SLIGHTLY_RUSTY ? "bg-yellow-400"
                              : d.decayLevel === DECAY_LEVEL.RUSTY ? "bg-orange-400"
                              : "bg-red-400"
                            }`}
                            style={{ width: `${d.retainedScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-ink-400 font-semibold whitespace-nowrap text-xs">
                        −{d.decayPercent}%
                      </span>
                    </div>

                    {d.daysSinceLastActivity !== null && (
                      <p className="text-[10px] text-ink-400">
                        Last practiced: {formatInactivityDuration(d.daysSinceLastActivity)} ago
                      </p>
                    )}
                  </div>

                  {/* Inline Quick Calibration Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-line/60">
                    <div className="flex items-center justify-between text-[10px] mb-1.5 font-semibold text-ink-600">
                      <span>Rate this skill:</span>
                      {d.userFeedback ? (
                        <span className="text-teal-700 font-bold uppercase tracking-wider">
                          You Reported
                        </span>
                      ) : (
                        <span className="text-ink-400">Estimated</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetFeedback(d.skillId, USER_ASSESSMENT.LACKING);
                        }}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.LACKING
                            ? "bg-red-600 text-white shadow-2xs font-extrabold"
                            : "bg-white/80 hover:bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        Lacking
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetFeedback(d.skillId, USER_ASSESSMENT.RUSTY);
                        }}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.RUSTY
                            ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                            : "bg-white/80 hover:bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        Rusty
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetFeedback(d.skillId, USER_ASSESSMENT.SHARP);
                        }}
                        className={`py-1 rounded text-center transition-all ${
                          d.userFeedback === USER_ASSESSMENT.SHARP
                            ? "bg-emerald-600 text-white shadow-2xs font-extrabold"
                            : "bg-white/80 hover:bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        Sharp
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions (SVG icons, no emojis) */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card
              className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-amber-200"
              onClick={() => setActiveTab(TABS.DIAGNOSTIC)}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-ink-950 text-sm mb-1">Quick Diagnostic</h3>
              <p className="text-xs text-ink-500">
                Take a rapid pulse check to test if you still remember the fundamentals.
              </p>
              <p className="text-xs font-bold text-amber-700 mt-2">~3 min per skill →</p>
            </Card>

            <Card
              className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-teal-200"
              onClick={() => setActiveTab(TABS.ROADMAP)}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-ink-950 text-sm mb-1">Refresh Roadmap</h3>
              <p className="text-xs text-ink-500">
                A condensed catch-up plan targeting the exact skills you reported lacking.
              </p>
              <p className="text-xs font-bold text-teal-700 mt-2">{refreshRoadmap.totalSkillsToRefresh} skills to refresh →</p>
            </Card>

            <Card
              className="p-5 cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-200"
              onClick={() => setActiveTab(TABS.FLASHCARDS)}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-ink-950 text-sm mb-1">Cheat Sheets</h3>
              <p className="text-xs text-ink-500">
                Quick-recall flashcards for memory refreshers before diving into lessons.
              </p>
              <p className="text-xs font-bold text-indigo-700 mt-2">Bite-sized refreshers →</p>
            </Card>
          </div>
        </div>
      )}

      {/* ─── DIAGNOSTIC TAB ───────────────────────────────────────── */}
      {activeTab === TABS.DIAGNOSTIC && (
        <div className="space-y-6">
          {/* Skill Selector */}
          <Card className="p-4">
            <p className="text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">
              Select a skill to diagnose (Prioritizing skills you reported lacking):
            </p>
            <div className="flex flex-wrap gap-2">
              {decayAnalysis.map((d) => (
                <button
                  key={d.skillId}
                  onClick={() => setSelectedSkill(d.skillId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    effectiveSkill === d.skillId
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : `${d.decayColor.bg} ${d.decayColor.border} ${d.decayColor.text} hover:shadow-sm`
                  }`}
                >
                  <span>{d.skillName}</span>
                  <span className="text-[10px] opacity-80">
                    ({d.decayLabel})
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Quiz */}
          <Card className="p-5">
            <DiagnosticQuiz
              key={effectiveSkill}
              skillId={effectiveSkill}
              onGoToRoadmap={() => setActiveTab(TABS.ROADMAP)}
              onGoToCheatsheet={() => {
                setSelectedSkill(effectiveSkill);
                setActiveTab(TABS.FLASHCARDS);
              }}
              onComplete={(skillId, percent) => {
                if (percent >= 80) {
                  handleSetFeedback(skillId, USER_ASSESSMENT.SHARP);
                } else if (percent >= 50) {
                  handleSetFeedback(skillId, USER_ASSESSMENT.RUSTY);
                } else {
                  handleSetFeedback(skillId, USER_ASSESSMENT.LACKING);
                }
              }}
            />
          </Card>
        </div>
      )}

      {/* ─── REFRESH ROADMAP TAB ──────────────────────────────────── */}
      {activeTab === TABS.ROADMAP && (
        <div className="space-y-6">
          {refreshRoadmap.phases.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-ink-950 mb-1">All Skills Are Sharp!</h3>
              <p className="text-sm text-ink-500">
                You haven't reported any skills as lacking or rusty. Everything is confirmed sharp.
              </p>
            </Card>
          ) : (
            <>
              {/* Summary header */}
              <Card className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-ink-950">
                      Your Refresh Roadmap
                    </h2>
                    {refreshRoadmap.isUserCalibrated && (
                      <span className="text-[11px] font-bold text-teal-800">
                        Tailored directly to the skills you reported lacking
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-ink-600">
                  A condensed catch-up plan with <strong>{refreshRoadmap.totalSkillsToRefresh} skills</strong> to refresh.
                  Only targets what you need to get back up to speed quickly.
                </p>
              </Card>

              {/* Phases */}
              {refreshRoadmap.phases.map((phase, phaseIdx) => (
                <Card key={phase.phase} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-display font-bold text-ink-950 text-base">
                        Phase {phaseIdx + 1}: {phase.phase}
                      </h3>
                      <p className="text-xs text-ink-500">{phase.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        phase.priority === "HIGH" ? "bg-red-100 text-red-800"
                        : phase.priority === "MEDIUM" ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {phase.badge || `${phase.priority} Priority`}
                      </span>
                      <p className="text-[10px] text-ink-400 mt-0.5">~{phase.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {phase.skills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="p-3.5 rounded-xl border border-line bg-paper/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-ink-900">{skill.skillName}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-line text-ink-600 font-semibold">
                              {skill.decayLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-500 mt-0.5">
                            Original: {skill.lastKnownScore}% → Current: <strong className={skill.decayColor.accent}>{skill.retainedScore}%</strong>
                            {" "}(−{skill.decayPercent}% decay)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedSkill(skill.skillId); setActiveTab(TABS.FLASHCARDS); }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-line text-ink-700 hover:bg-white transition-colors"
                          >
                            Cards
                          </button>
                          <button
                            onClick={() => { setSelectedSkill(skill.skillId); setActiveTab(TABS.DIAGNOSTIC); }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          >
                            Quiz
                          </button>
                          <button
                            onClick={() => {
                              handleSetFeedback(skill.skillId, USER_ASSESSMENT.SHARP);
                              navigate(`/learning?skill=${skill.skillId}`);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                          >
                            Full Lesson
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* ─── FLASHCARDS TAB ───────────────────────────────────────── */}
      {activeTab === TABS.FLASHCARDS && (
        <div className="space-y-6">
          {/* Skill Selector */}
          <Card className="p-4">
            <p className="text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">
              Select a skill for cheat sheet:
            </p>
            <div className="flex flex-wrap gap-2">
              {decayAnalysis.map((d) => (
                <button
                  key={d.skillId}
                  onClick={() => setSelectedSkill(d.skillId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    effectiveSkill === d.skillId
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : `${d.decayColor.bg} ${d.decayColor.border} ${d.decayColor.text} hover:shadow-sm`
                  }`}
                >
                  <span>{d.skillName}</span>
                  <span className="text-[10px] opacity-80">({d.decayLabel})</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Flashcard Viewer */}
          <Card className="p-5">
            <FlashcardViewer
              key={effectiveSkill}
              skillId={effectiveSkill}
              onSetFeedback={handleSetFeedback}
            />
          </Card>

          {/* After flashcards, suggest quiz */}
          <div className="text-center p-4">
            <p className="text-xs text-ink-500 mb-2">Done reviewing? Test yourself:</p>
            <Button
              variant="accent"
              size="sm"
              onClick={() => { setActiveTab(TABS.DIAGNOSTIC); }}
            >
              Take Quick Diagnostic →
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex gap-3 flex-wrap pt-6 mt-6 border-t border-line">
        <Button variant="accent" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>
        <Button variant="ghost" onClick={() => navigate("/learning-insights")}>
          AI Insights
        </Button>
      </div>
    </Layout>
  );
}
