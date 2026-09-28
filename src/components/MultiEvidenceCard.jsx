import ProgressBar from "./ProgressBar";

export default function MultiEvidenceCard({ skillName, overallScore, evidence = {}, confidence = "High", lastAssessed }) {
  const sources = [
    { key: "assessment", label: "Assessment", icon: "📝", score: evidence.assessment ?? 55, weight: "25%" },
    { key: "quiz", label: "Quiz", icon: "⚡", score: evidence.quiz ?? 70, weight: "25%" },
    { key: "project", label: "Project", icon: "💻", score: evidence.project ?? 65, weight: "25%" },
    { key: "practicalTask", label: "Practical Task", icon: "🛠️", score: evidence.practicalTask ?? 75, weight: "25%" },
  ];

  const confidenceStyles = {
    High: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    Low: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-teal-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg text-ink-950">{skillName} Skill</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                confidenceStyles[confidence] || confidenceStyles.Medium
              }`}
            >
              Confidence: {confidence}
            </span>
          </div>
          {lastAssessed && (
            <p className="text-[11px] text-ink-500 mt-0.5">Last assessed: {lastAssessed}</p>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-ink-500 tracking-wider block">
            Overall Score
          </span>
          <span className="font-display font-extrabold text-2xl text-teal-700">
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Multi-Evidence Bar Breakdown */}
      <div className="mb-4 space-y-2.5">
        <p className="text-xs font-bold text-ink-700 uppercase tracking-wider">
          Multi-Source Evidence Breakdown
        </p>

        {sources.map((src) => (
          <div key={src.key} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-ink-800">
                <span>{src.icon}</span>
                <span>{src.label}</span>
                <span className="text-[10px] text-ink-400">({src.weight})</span>
              </span>
              <span className="text-teal-800 font-bold">{src.score}%</span>
            </div>
            <ProgressBar value={src.score} max={100} color="teal" showLabel={false} />
          </div>
        ))}
      </div>

      {/* Evidence Verified Checkmarks (Section 4) */}
      <div className="pt-3 border-t border-line/80">
        <div className="flex items-center justify-between text-[11px] text-ink-600 flex-wrap gap-1">
          <span className="font-semibold text-ink-800">Evidence Verified:</span>
          <div className="flex items-center gap-2.5 font-medium">
            <span className="text-teal-700">Assessment ✓</span>
            <span className="text-teal-700">Quiz ✓</span>
            <span className="text-teal-700">Project ✓</span>
            <span className="text-teal-700">Practical Task ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
