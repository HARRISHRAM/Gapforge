export default function ProgressBar({ value, max = 100, color = "teal", height = "h-2", showLabel = false }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = {
    teal: "bg-teal-500",
    amber: "bg-amber-400",
    ink: "bg-ink-800",
  };
  return (
    <div className="w-full">
      <div className={`w-full ${height} rounded-full bg-teal-50 overflow-hidden`}>
        <div
          className={`${height} ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <div className="mt-1 text-xs text-ink-600 font-medium">{Math.round(pct)}%</div>}
    </div>
  );
}
