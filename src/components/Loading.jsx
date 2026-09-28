export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-600">
      <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
