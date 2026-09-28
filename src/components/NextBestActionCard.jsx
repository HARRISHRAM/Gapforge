import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function NextBestActionCard({ actionData, onAction }) {
  const navigate = useNavigate();

  if (!actionData) return null;

  const handleClick = () => {
    if (onAction) {
      onAction(actionData);
    } else if (actionData.actionUrl) {
      navigate(actionData.actionUrl);
    } else {
      navigate(`/real-world-task?skill=${actionData.skillId || "react"}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/90 via-white to-amber-50/40 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold shadow-xs">
            ⚡
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Your Next Best Action
          </span>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
            AI Recommended
          </span>
        </div>
        {actionData.estimatedTime && (
          <span className="text-xs font-semibold text-ink-500 flex items-center gap-1">
            <span>⏱️</span> Est. {actionData.estimatedTime}
          </span>
        )}
      </div>

      {/* Main Action Title */}
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-ink-950 mb-2">
        {actionData.action || actionData.title}
      </h3>

      {/* Detail Grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
        <div className="rounded-xl bg-white/80 border border-line p-3">
          <span className="font-bold text-ink-500 uppercase tracking-wider text-[11px] block mb-1">
            Target Skill & Topic
          </span>
          <p className="font-semibold text-ink-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
            {actionData.skill} {actionData.topic ? `— ${actionData.topic}` : ""}
          </p>
        </div>

        <div className="rounded-xl bg-white/80 border border-line p-3">
          <span className="font-bold text-ink-500 uppercase tracking-wider text-[11px] block mb-1">
            Expected Benefit
          </span>
          <p className="font-semibold text-teal-700">
            {actionData.expectedBenefit || "+14% estimated boost in skill mastery"}
          </p>
        </div>
      </div>

      {/* Reason Box */}
      <div className="rounded-xl bg-teal-50/70 border border-teal-200/80 p-3 mb-5 text-xs text-ink-700 leading-relaxed">
        <span className="font-bold text-teal-900">Why this is recommended: </span>
        {actionData.reason}
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="text-xs text-ink-500">
          Closes your largest bottleneck towards career readiness.
        </div>
        <Button variant="accent" size="md" onClick={handleClick} className="shadow-xs font-bold">
          {actionData.ctaText || "Take Next Action →"}
        </Button>
      </div>
    </div>
  );
}
