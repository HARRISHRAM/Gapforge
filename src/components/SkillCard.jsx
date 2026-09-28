import ProgressBar from "./ProgressBar";
import { getGap, getPriority } from "../utils/skillCalculations";

const priorityStyles = {
  HIGH: "bg-amber-100 text-amber-600",
  MEDIUM: "bg-teal-100 text-teal-700",
  LOW: "bg-ink-100 text-ink-600",
  COMPLETED: "bg-teal-500 text-white",
};

export default function SkillCard({ skill }) {
  const gap = getGap(skill);
  const priority = getPriority(skill);
  return (
    <div className="border border-line rounded-card p-5 bg-white">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-display font-bold text-ink-900">{skill.name}</h4>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[priority]}`}>
          {priority.charAt(0) + priority.slice(1).toLowerCase()}
        </span>
      </div>
      <ProgressBar value={skill.currentScore} color={priority === "COMPLETED" ? "teal" : "amber"} />
      <div className="flex justify-between text-xs text-ink-600 mt-2">
        <span>Current: {skill.currentScore}%</span>
        <span>Required: {skill.requiredScore}%</span>
        <span>Gap: {gap}%</span>
      </div>
    </div>
  );
}
