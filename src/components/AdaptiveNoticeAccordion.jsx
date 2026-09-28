import { useState } from "react";

export default function AdaptiveNoticeAccordion({
  headline = "Your roadmap changed based on your latest performance.",
  whatChanged = [
    { icon: "✓", text: "React skill improved from 40% to 68%", type: "improved" },
    { icon: "✓", text: "React State Management practical task completed", type: "completed" },
    { icon: "↑", text: "Node.js is now your highest priority gap", type: "reordered" },
  ],
  whySummary = "Your React score increased from 40% to 68%. You demonstrated React skills in a practical task. Because React is no longer your biggest gap, Node.js has become your next priority.",
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border-2 border-teal-500/40 bg-teal-50/70 p-5 shadow-xs transition-all mb-8">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-base shadow-2xs">
            🔄
          </div>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-teal-950">
              {headline}
            </h3>
            <p className="text-xs text-teal-800/80 mt-0.5">
              Continuous adaptive recalibration responded to your latest practical performance evidence.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto text-xs font-bold text-teal-800 hover:text-teal-950 bg-white/90 border border-teal-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
        >
          <span>Why did my roadmap change?</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* "What Changed?" List (Section 18) */}
      <div className="mt-4 pt-3 border-t border-teal-200/70">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
          What Changed?
        </p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          {whatChanged.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl bg-white/90 border border-teal-200/60 p-2.5 font-medium text-ink-900 shadow-2xs"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                  item.type === "improved" || item.type === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-teal-100 text-teal-800"
                }`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Explanation (Section 19) */}
      {isOpen && (
        <div className="mt-4 rounded-xl bg-white p-4 border border-teal-200 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 mb-2">
            <span>💡</span>
            <span>Why did my roadmap change?</span>
          </div>
          <p className="text-xs sm:text-sm text-ink-800 leading-relaxed">
            {whySummary}
          </p>

          <div className="mt-3 pt-3 border-t border-line text-[11px] text-ink-500 flex items-center justify-between flex-wrap gap-2">
            <span>Adaptive System Transparency: No static course tracks</span>
            <span className="text-teal-700 font-semibold">Priority automatically adjusted</span>
          </div>
        </div>
      )}
    </div>
  );
}
