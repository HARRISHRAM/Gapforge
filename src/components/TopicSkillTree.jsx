import { useState } from "react";
import ProgressBar from "./ProgressBar";

export function ConfidenceBadge({ level = "High" }) {
  const styles = {
    High: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    Low: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        styles[level] || styles.Medium
      }`}
      title={`AI Estimation Confidence: ${level}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      Confidence: {level}
    </span>
  );
}

export function EvidencePills({ evidence = [] }) {
  if (!evidence || !evidence.length) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {evidence.map((ev, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-paper border border-line text-ink-700"
        >
          <span className="text-teal-600 font-bold">✓</span> {ev}
        </span>
      ))}
    </div>
  );
}

export function SubtopicItem({ name }) {
  return (
    <li className="text-xs text-ink-600 flex items-center gap-2 pl-6 py-0.5">
      <span className="text-teal-500 font-mono text-[10px]">└─</span>
      <span>{name}</span>
    </li>
  );
}

export function TopicNode({ topic, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const isWeak = topic.isWeak || topic.score < 50;

  return (
    <div className="relative group border-b border-line/60 last:border-b-0 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="text-ink-400 font-mono text-sm mt-0.5 select-none">
            {isLast ? "└──" : "├──"}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-ink-900">{topic.name}</span>
              {isWeak && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Weak Concept
                </span>
              )}
              {topic.confidence && <ConfidenceBadge level={topic.confidence} />}
            </div>

            {/* Evidence tags */}
            {topic.evidence && (
              <div className="mt-1.5">
                <EvidencePills evidence={topic.evidence} />
              </div>
            )}
          </div>
        </div>

        {/* Progress bar and score */}
        <div className="flex items-center gap-3 sm:w-48 pl-6 sm:pl-0">
          <div className="flex-1">
            <ProgressBar
              value={topic.score}
              max={100}
              color={isWeak ? "amber" : "teal"}
              showLabel={false}
            />
          </div>
          <span
            className={`text-xs font-bold w-10 text-right ${
              isWeak ? "text-amber-700" : "text-teal-700"
            }`}
          >
            {topic.score}%
          </span>
          {topic.subtopics?.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-ink-500 hover:text-ink-800 p-1 rounded focus-ring"
              title="Toggle subtopics"
              aria-label="Toggle subtopics"
            >
              {expanded ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {/* Expandable subtopics */}
      {expanded && topic.subtopics?.length > 0 && (
        <ul className="mt-2 pl-4 border-l-2 border-teal-200/60 ml-2 space-y-1">
          {topic.subtopics.map((sub, i) => (
            <SubtopicItem key={i} name={sub} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TopicSkillTree({ skillName, overallScore, topics = [], confidence = "High", evidenceSummary }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
      {/* Skill Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center font-display text-base shadow-2xs">
            {skillName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-ink-950">{skillName}</h3>
              <ConfidenceBadge level={confidence} />
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Topic-level knowledge tracing & weakness diagnostic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-ink-500 block">Overall Mastery</span>
            <span className="font-display font-extrabold text-xl text-teal-700">
              {overallScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="py-2">
        <div className="text-[11px] font-mono font-semibold text-ink-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <span>Root Skill: {skillName}</span>
          <span>(Deconstructed into {topics.length} calibrated topics)</span>
        </div>

        <div className="space-y-0.5">
          {topics.map((topic, index) => (
            <TopicNode
              key={topic.id || index}
              topic={topic}
              isLast={index === topics.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Evidence summary footer */}
      {evidenceSummary && (
        <div className="mt-4 pt-3 border-t border-line/80 flex items-center justify-between flex-wrap gap-2 text-xs text-ink-600">
          <span className="font-semibold text-ink-800">Multi-Signal Evidence Sources:</span>
          <div className="flex items-center gap-3">
            <span className={evidenceSummary.assessment ? "text-teal-700 font-bold" : "text-ink-400"}>
              Assessment {evidenceSummary.assessment ? "✓" : "—"}
            </span>
            <span className={evidenceSummary.quiz ? "text-teal-700 font-bold" : "text-ink-400"}>
              Quiz {evidenceSummary.quiz ? "✓" : "—"}
            </span>
            <span className={evidenceSummary.project ? "text-teal-700 font-bold" : "text-ink-400"}>
              Project {evidenceSummary.project ? "✓" : "—"}
            </span>
            <span className={evidenceSummary.practicalTask ? "text-teal-700 font-bold" : "text-ink-400"}>
              Practical Task {evidenceSummary.practicalTask ? "✓" : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
