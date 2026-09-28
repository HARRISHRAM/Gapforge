import ProgressBar from "./ProgressBar";

const statusMeta = {
  COMPLETED: { icon: "✓", classes: "bg-emerald-600 text-white border-emerald-600" },
  CURRENT: { icon: "⚡", classes: "bg-amber-400 text-ink-950 border-amber-500 animate-pulse" },
  UPCOMING: { icon: "○", classes: "bg-white text-ink-400 border-line" },
};

const priorityStyles = {
  HIGH: "bg-amber-100 text-amber-900 border-amber-300",
  MEDIUM: "bg-teal-100 text-teal-900 border-teal-200",
  LOW: "bg-paper text-ink-700 border-line",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function RoadmapCard({ item, onLearn, onQuiz, onTask, onRefresh, isLast }) {
  const meta = statusMeta[item.status] || statusMeta.UPCOMING;
  const current = item.currentScore ?? 35;
  const target = item.requiredScore ?? 75;
  const topicName = item.topic || (item.id === "react" ? "State Management" : `${item.name} Core Concepts`);
  const effort = item.estimatedEffort || (item.priority === "HIGH" ? "2-3 weeks (12 hrs)" : "1-2 weeks (6 hrs)");

  // Reason for recommendation
  const defaultReason =
    item.reason ||
    (item.id === "react"
      ? "Your recent assessment and practical task indicate that state management is currently one of your largest gaps."
      : item.gap > 30
      ? `A significant ${item.gap}% gap in ${item.name} directly impacts your career readiness score.`
      : `${item.name} is a vital core requirement for Full-Stack Developer proficiency.`);

  const ghEvidence = item.ghEvidence;
  const tier = item.tier;

  return (
    <div className="flex gap-4">
      {/* Node connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-2xs ${meta.classes}`}
        >
          {meta.icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-line mt-1" />}
      </div>

      {/* Main card */}
      <div className="flex-1 pb-8">
        <div
          className={`border rounded-2xl p-5 bg-white shadow-xs transition-all ${
            item.status === "CURRENT" ? "border-amber-400/80 ring-2 ring-amber-400/20" : "border-line"
          }`}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  {item.name}
                </span>

                {tier && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                    {tier.icon} {tier.label}
                  </span>
                )}

                {/* GitHub Evidence Tag */}
                {ghEvidence?.hasEvidence && (
                  <span
                    className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1"
                    title={`Code demonstrated in GitHub repo: ${ghEvidence.topRepo}`}
                  >
                    <span>🐙</span>
                    <span>{ghEvidence.badgeText} ({ghEvidence.topRepo})</span>
                  </span>
                )}

                {/* Decay Alert Tag */}
                {item.isDecayed && (
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>⏳</span>
                    <span>Knowledge Fading</span>
                  </span>
                )}

                {/* Outside Accredited Course Tag */}
                {item.extCourse && (
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>🎓</span>
                    <span>{item.extCourse.platform} Certified</span>
                  </span>
                )}
              </div>

              <h4 className="font-display font-extrabold text-lg text-ink-950 mt-0.5">
                {item.name} {topicName}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  priorityStyles[item.priority] || priorityStyles.MEDIUM
                }`}
              >
                Priority: {item.priority}
              </span>
              <span className="text-[10px] uppercase font-bold text-ink-400 bg-paper px-2 py-0.5 rounded border border-line">
                {item.status}
              </span>
            </div>
          </div>

          {/* Level & Effort Grid */}
          <div className="grid grid-cols-3 gap-2 my-3 py-2 px-3 rounded-xl bg-paper/60 border border-line text-xs">
            <div>
              <span className="text-[10px] text-ink-500 uppercase font-semibold block">Current Level</span>
              <strong className="text-sm font-display font-bold text-ink-900">{current}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-ink-500 uppercase font-semibold block">Target Level</span>
              <strong className="text-sm font-display font-bold text-teal-700">{target}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-ink-500 uppercase font-semibold block">Estimated Effort</span>
              <span className="text-xs font-semibold text-ink-700">{effort}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <ProgressBar value={current} max={target} color={item.priority === "HIGH" ? "amber" : "teal"} showLabel={false} />
          </div>

          {/* Why this is recommended */}
          <div className="rounded-xl bg-teal-50/60 border border-teal-200/80 p-3 text-xs text-ink-700 leading-relaxed mb-4">
            <span className="font-bold text-teal-900 block mb-0.5">
              Why this is recommended:
            </span>
            {defaultReason}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-line/70 flex-wrap gap-2">
            <span className="text-[11px] text-ink-500">
              {item.status === "COMPLETED" ? "Requirement Satisfied ✓" : "Adaptive Learning Action"}
            </span>

            <div className="flex items-center gap-2">
              {item.isDecayed && onRefresh && (
                <button
                  onClick={() => onRefresh(item)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                >
                  <span>⏳</span>
                  <span>Refresh Quiz</span>
                </button>
              )}
              {item.status !== "COMPLETED" && onTask && ghEvidence?.hasEvidence && (
                <button
                  onClick={() => onTask(item)}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                >
                  <span>🛠️</span>
                  <span>Verify Task</span>
                </button>
              )}
              {item.status !== "COMPLETED" && onQuiz && (
                <button
                  onClick={() => onQuiz(item)}
                  className="text-xs font-bold text-ink-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-line hover:border-teal-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                >
                  <span>⚡</span>
                  <span>Take Quiz</span>
                </button>
              )}
              {item.status !== "COMPLETED" && onLearn && (
                <button
                  onClick={() => onLearn(item)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all"
                >
                  Learn Topic →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
