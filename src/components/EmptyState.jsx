export default function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-line rounded-card">
      <h3 className="font-display font-bold text-ink-800">{title}</h3>
      {message && <p className="text-sm text-ink-600 max-w-sm">{message}</p>}
      {action}
    </div>
  );
}
