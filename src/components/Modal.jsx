export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
      <div className="relative bg-white rounded-card border border-line p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-ink-900">{title}</h3>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900 focus-ring rounded text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
