export default function QuestionCard({ question, index, total, selected, onSelect }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
          Question {index + 1} of {total}
        </p>
        {question.skillId && (
          <span className="text-xs font-medium px-2 py-0.5 bg-paper rounded border border-line text-ink-700 capitalize">
            Skill: {question.skillId} • Difficulty {question.difficulty}/3
          </span>
        )}
      </div>

      <h3 className="font-display font-bold text-lg md:text-xl text-ink-900 mt-2 mb-6">
        {question.question}
      </h3>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={`text-left px-4 py-3.5 rounded-xl border transition-all focus-ring ${
                isSelected
                  ? "border-teal-500 bg-teal-50 text-ink-950 shadow-xs ring-1 ring-teal-500 font-medium"
                  : "border-line bg-white hover:border-teal-300 hover:bg-slate-50 text-ink-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? "bg-teal-600 text-white"
                      : "bg-paper text-ink-500 border border-line"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm leading-relaxed">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
