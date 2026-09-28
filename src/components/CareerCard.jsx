import { getCareerRoadmap } from "../data/careerRoadmaps";

export default function CareerCard({ career, selected, onSelect, onViewRoadmap }) {
  const roadmap = getCareerRoadmap(career.id);

  return (
    <div
      className={`border rounded-card p-6 bg-white transition-all flex flex-col justify-between hover:shadow-md ${
        selected
          ? "border-teal-500 ring-2 ring-teal-200 shadow-sm"
          : "border-line hover:border-teal-300"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xl">
            {career.id === "fullstack" ? "💻" : career.id === "aiml" ? "🧠" : "📊"}
          </span>
          {roadmap && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-paper text-ink-600 border border-line">
              {roadmap.duration} • {roadmap.phases.length} Phases
            </span>
          )}
        </div>

        <h3 className="font-display font-extrabold text-lg text-ink-900">{career.name}</h3>
        <p className="text-xs text-ink-600 mt-2 leading-relaxed">{career.description}</p>

        {roadmap && (
          <div className="mt-3 py-2 px-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-900 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1">
              <span>🌱</span> {roadmap.difficulty}
            </span>
            <span className="font-medium text-emerald-800">{roadmap.duration}</span>
          </div>
        )}

        <div className="mt-4">
          <span className="text-[10px] uppercase font-bold text-ink-400 tracking-wider block mb-1.5">
            Key Competencies ({career.requiredSkills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {career.requiredSkills.map((s) => (
              <span
                key={s.skillId}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-100/80"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-line/60 flex flex-col gap-2">
        <button
          onClick={onSelect}
          className={`w-full rounded-xl py-2.5 text-xs font-display font-bold transition-all focus-ring ${
            selected
              ? "bg-teal-600 text-white shadow-sm"
              : "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white"
          }`}
        >
          {selected ? "✓ Path Selected" : "Select this path"}
        </button>

        {onViewRoadmap && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRoadmap(career.id);
            }}
            className="w-full py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center justify-center gap-1"
          >
            <span>Explore Full Roadmap</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
