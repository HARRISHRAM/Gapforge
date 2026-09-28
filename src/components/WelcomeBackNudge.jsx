import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  analyzeKnowledgeDecay,
  shouldShowWelcomeBack,
  getOverallInactivityDays,
  formatInactivityDuration,
  DECAY_LEVEL,
} from "../utils/knowledgeDecay";

/**
 * WelcomeBackNudge — A smart contextual banner shown on the Dashboard
 * when the user returns after a long inactivity period.
 *
 * It detects decayed skills and offers quick actions:
 *  • Take a Quick Diagnostic (pulse check quiz)
 *  • View the Refresh Roadmap (condensed catch-up plan)
 *  • View Cheat Sheet Cards (flashcard recap)
 *  • Dismiss
 */
export default function WelcomeBackNudge({ skills = [], activityTimeline = [], userName = "Student" }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Don't render if already dismissed or not enough inactivity
  if (dismissed) return null;
  if (!shouldShowWelcomeBack(activityTimeline)) return null;

  const inactivityDays = getOverallInactivityDays(activityTimeline);
  const durationText = formatInactivityDuration(inactivityDays);
  const decayAnalysis = analyzeKnowledgeDecay(skills, activityTimeline);
  const decayedSkills = decayAnalysis.filter((d) => d.needsRefresh);
  const criticalSkills = decayAnalysis.filter((d) => d.decayLevel === DECAY_LEVEL.NEEDS_REVIEW);
  const rustySkills = decayAnalysis.filter((d) => d.decayLevel === DECAY_LEVEL.RUSTY);

  if (decayedSkills.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/60 to-yellow-50/40 p-5 sm:p-6 mb-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-100/50 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-orange-100/40 blur-xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-100 hover:text-amber-800 transition-all text-sm font-bold"
        title="Dismiss"
      >
        ×
      </button>

      {/* Header */}
      <div className="relative flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-xl shadow-md shadow-amber-200/50 flex-shrink-0">
          👋
        </div>
        <div>
          <h2 className="font-display font-extrabold text-lg text-ink-950 leading-tight">
            Welcome back, {userName}!
          </h2>
          <p className="text-sm text-ink-600 mt-0.5">
            It's been <strong className="text-amber-700">{durationText}</strong> since your last activity.
            {decayedSkills.length === 1
              ? " One skill may need a refresh."
              : ` ${decayedSkills.length} skills may need a refresh.`}
          </p>
        </div>
      </div>

      {/* Decay Summary Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {decayedSkills.map((d) => (
          <span
            key={d.skillId}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${d.decayColor.bg} ${d.decayColor.border} ${d.decayColor.text}`}
          >
            <span>{d.decayEmoji}</span>
            <span>{d.skillName}</span>
            <span className="opacity-70">−{d.decayPercent}%</span>
          </span>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mb-4 p-4 rounded-xl bg-white/70 border border-amber-100 space-y-2.5 text-xs animate-in fade-in duration-200">
          <p className="font-bold text-ink-700 uppercase tracking-wider text-[11px]">
            Knowledge Health Report
          </p>
          {decayedSkills.map((d) => (
            <div key={d.skillId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{d.decayEmoji}</span>
                <span className="font-semibold text-ink-800">{d.skillName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-500">
                  {d.lastKnownScore}% → <strong className={d.decayColor.accent}>{d.retainedScore}%</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${d.decayColor.bg} ${d.decayColor.text}`}>
                  {d.decayLabel}
                </span>
              </div>
            </div>
          ))}
          {criticalSkills.length > 0 && (
            <p className="text-red-600 font-semibold pt-1 border-t border-amber-100">
              ⚠️ {criticalSkills.map(s => s.skillName).join(", ")} {criticalSkills.length === 1 ? "has" : "have"} significantly decayed and {criticalSkills.length === 1 ? "needs" : "need"} a full refresher.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative flex flex-wrap items-center gap-2">
        <button
          onClick={() => navigate(`/knowledge-refresh`)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-200/50 hover:shadow-lg hover:shadow-amber-300/60 hover:-translate-y-0.5 transition-all"
        >
          🧠 Take Diagnostic Quiz
        </button>
        <button
          onClick={() => navigate(`/knowledge-refresh?tab=roadmap`)}
          className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-50 transition-all"
        >
          📋 Refresh Roadmap
        </button>
        <button
          onClick={() => navigate(`/knowledge-refresh?tab=flashcards`)}
          className="px-4 py-2 rounded-xl bg-white border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-50 transition-all"
        >
          📇 Quick Cheat Sheets
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-2 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
        >
          {expanded ? "Show Less ▲" : "Details ▼"}
        </button>
      </div>
    </div>
  );
}
