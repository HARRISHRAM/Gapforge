export default function TaskCard({ task }) {
  if (!task) return null;

  return (
    <div className="border border-line rounded-2xl p-6 bg-white shadow-xs">
      {/* Skill Being Tested (Section 14) */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Skill Being Tested: {task.skillName || task.skillId?.toUpperCase()}
          </span>
          <span className="text-[11px] font-bold text-ink-500 bg-paper px-2 py-0.5 rounded border border-line">
            Practical Proof
          </span>
        </div>
      </div>

      <h2 className="font-display font-bold text-xl text-ink-950 mt-1">
        {task.title}
      </h2>
      <p className="text-ink-700 mt-2 text-sm leading-relaxed">{task.task}</p>

      {/* Concepts Tested (Section 14) */}
      {task.concepts?.length > 0 && (
        <div className="mt-5 p-3 rounded-xl bg-paper/60 border border-line">
          <p className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-2">
            Concepts Evaluated:
          </p>
          <div className="flex flex-wrap gap-2">
            {task.concepts.map((c, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-800 shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      <div className="mt-5">
        <p className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-2">
          Task Requirements:
        </p>
        <ul className="space-y-1.5">
          {task.requirements?.map((r, i) => (
            <li key={i} className="text-xs sm:text-sm text-ink-600 flex gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expected Output */}
      <div className="mt-5 pt-4 border-t border-line/80 flex items-start gap-2">
        <span className="text-base">🎯</span>
        <div>
          <p className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-0.5">
            Expected Deliverable:
          </p>
          <p className="text-xs text-ink-600 leading-relaxed">{task.expectedOutput}</p>
        </div>
      </div>
    </div>
  );
}
