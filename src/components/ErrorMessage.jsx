export default function ErrorMessage({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-display font-bold">!</div>
      <p className="text-ink-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-semibold text-teal-600 hover:text-teal-700 focus-ring rounded">
          Try again
        </button>
      )}
    </div>
  );
}
