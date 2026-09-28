export default function CodeReviewCard({
  question,
  index,
  total,
  selected,
  onSelect,
}) {
  const pr = question.pr || {};
  const diffLines = pr.diff || [];

  return (
    <div className="space-y-5">
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Pull Request Review
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Question {index + 1} of {total}
          </span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-paper rounded border border-line text-ink-700 capitalize">
          Skill: {question.skillId} • Level {question.difficulty}
        </span>
      </div>

      {/* GitHub-like Pull Request Card */}
      <div className="border border-line rounded-xl overflow-hidden bg-white shadow-sm">
        {/* PR Info Header */}
        <div className="bg-paper/70 px-4 py-3 border-b border-line">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-teal-600 text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v7.5a1 1 0 01-1 1H8.5V15H11a2.5 2.5 0 002.5-2.5V5A2.5 2.5 0 0011 2.5z" />
                  </svg>
                  Open PR
                </span>
                <h4 className="font-display font-bold text-ink-900 text-base">
                  {pr.title || question.question}
                </h4>
                <span className="text-xs text-ink-500 font-mono">{pr.prNumber || "#PR-Review"}</span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-600 flex-wrap">
                <span className="font-medium text-ink-800">@{pr.author || "contributor"}</span>
                <span>wants to merge into</span>
                <span className="px-1.5 py-0.5 rounded bg-line/60 font-mono text-[11px] text-ink-800">
                  {pr.branch || "main"}
                </span>
              </div>
            </div>

            {pr.filename && (
              <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-line text-ink-700 hidden sm:inline-block shadow-xs">
                📄 {pr.filename}
              </span>
            )}
          </div>

          {pr.summary && (
            <p className="text-xs text-ink-600 mt-2 bg-white/70 p-2 rounded border border-line/60">
              <span className="font-semibold text-ink-800">PR Description:</span> {pr.summary}
            </p>
          )}
        </div>

        {/* Diff View Box */}
        <div className="bg-[#0f172a] text-slate-100 font-mono text-xs overflow-x-auto">
          {/* File bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
              {pr.filename || "diff-preview.js"}
            </span>
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">
              {pr.language || "Code Diff"}
            </span>
          </div>

          {/* Code Lines with Diff Highlighting */}
          <div className="py-2 divide-y divide-slate-900/40">
            {diffLines.length > 0 ? (
              diffLines.map((l, idx) => {
                const isAdded = l.type === "added";
                const isRemoved = l.type === "removed";
                const isBug = l.type === "bug";

                let rowBg = "hover:bg-slate-800/50";
                let textCol = "text-slate-300";
                let prefix = " ";

                if (isAdded) {
                  rowBg = "bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300";
                  prefix = "+";
                } else if (isRemoved) {
                  rowBg = "bg-rose-950/40 hover:bg-rose-900/40 text-rose-300";
                  prefix = "-";
                } else if (isBug) {
                  rowBg = "bg-amber-950/50 hover:bg-amber-900/50 text-amber-200 border-l-2 border-amber-400";
                  prefix = "!";
                }

                return (
                  <div key={idx} className={`flex items-start px-3 py-1 font-mono text-xs ${rowBg}`}>
                    <span className="w-8 select-none text-right pr-3 text-slate-600 text-[11px]">
                      {l.line || idx + 1}
                    </span>
                    <span className="w-4 select-none text-slate-500 font-bold">{prefix}</span>
                    <pre className={`flex-1 font-mono whitespace-pre-wrap break-all ${textCol}`}>
                      {l.code}
                    </pre>
                  </div>
                );
              })
            ) : (
              <pre className="p-4 text-xs text-slate-300 whitespace-pre-wrap">
                {pr.code || question.question}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Reviewer Action Prompt */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🧐</span>
          <h3 className="font-display font-bold text-base text-ink-900">
            {question.question || "Spot the bug: Which review comment correctly flags the critical flaw in this PR?"}
          </h3>
        </div>

        {/* Options styled as Code Review Feedback Comments */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`text-left p-3.5 rounded-xl border transition-all relative focus-ring ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/80 shadow-xs ring-1 ring-teal-500 text-ink-950"
                    : "border-line bg-white hover:border-teal-300 hover:bg-slate-50 text-ink-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-teal-600 text-white"
                        : "border border-line text-ink-500 bg-paper"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="flex-1 text-sm leading-relaxed">
                    {opt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
