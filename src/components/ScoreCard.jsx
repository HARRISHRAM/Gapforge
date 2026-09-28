export default function ScoreCard({ label, value, suffix = "%", accent = "teal" }) {
  const accents = { teal: "text-teal-600", amber: "text-amber-500", ink: "text-ink-900" };
  return (
    <div className="border border-line rounded-card p-5 bg-white">
      <p className="text-xs uppercase tracking-wide text-ink-500 font-medium">{label}</p>
      <p className={`font-display font-extrabold text-3xl mt-1 ${accents[accent]}`}>
        {value}
        <span className="text-lg align-top">{suffix}</span>
      </p>
    </div>
  );
}
