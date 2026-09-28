import { useState, useEffect, useRef } from "react";

export default function AssessmentTimer({
  duration = 45,
  onTimeUp,
  questionKey,
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset timer whenever questionKey changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [questionKey, duration]);

  // Countdown timer loop — no pause functionality
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setTimeout(() => {
            onTimeUpRef.current?.();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [questionKey]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / duration) * 100));

  const isUrgent = timeLeft <= 8;
  const isWarning = timeLeft <= 15 && !isUrgent;

  const colorClasses = isUrgent
    ? "text-rose-600 border-rose-300 bg-rose-50 animate-pulse"
    : isWarning
    ? "text-amber-600 border-amber-300 bg-amber-50"
    : "text-teal-700 border-teal-200 bg-teal-50";

  const barColor = isUrgent
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-teal-500";

  return (
    <div className="flex items-center gap-3">
      {/* Time Display Badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition-colors ${colorClasses}`}
        title="Time remaining for this question"
      >
        <svg
          className={`w-3.5 h-3.5 ${isUrgent ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-20 md:w-28 bg-line/60 h-2 rounded-full overflow-hidden hidden sm:block">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
