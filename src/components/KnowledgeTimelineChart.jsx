import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { computeDecayedScore } from "../utils/knowledgeDecay";

export default function KnowledgeTimelineChart({ skillProfiles = {}, selectedSkillKey = "javascript" }) {
  const [activeSkill, setActiveSkill] = useState(selectedSkillKey);
  const [showDecayCurve, setShowDecayCurve] = useState(true);

  const currentProfile = skillProfiles[activeSkill] || skillProfiles.javascript;
  const timelineData = currentProfile?.timeline || [
    { month: "January", score: 40, assessment: 40, quiz: 38, task: 42 },
    { month: "February", score: 48, assessment: 45, quiz: 50, task: 49 },
    { month: "March", score: 62, assessment: 55, quiz: 66, task: 65 },
    { month: "April", score: 72, assessment: 65, quiz: 74, task: 77 },
  ];

  const skillOptions = [
    { key: "javascript", label: "JavaScript" },
    { key: "react", label: "React" },
    { key: "nodejs", label: "Node.js" },
    { key: "sql", label: "SQL" },
    { key: "git", label: "Git" },
  ];

  // Generate projected decay data extending from the last known data point
  const enhancedData = useMemo(() => {
    const lastDataPoint = timelineData[timelineData.length - 1];
    if (!lastDataPoint || !showDecayCurve) return timelineData;

    const lastScore = lastDataPoint.score;
    const projectionMonths = ["May", "June", "July", "August"];

    // Build the combined dataset: real data + projected decay
    const realData = timelineData.map((d) => ({
      ...d,
      projectedScore: null,
      isProjection: false,
    }));

    // Add the bridge point (last real = first projected)
    realData[realData.length - 1].projectedScore = lastScore;

    const projections = projectionMonths.map((month, idx) => {
      const daysElapsed = (idx + 1) * 30;
      return {
        month,
        score: null, // No real data
        assessment: null,
        quiz: null,
        task: null,
        projectedScore: computeDecayedScore(lastScore, daysElapsed),
        isProjection: true,
      };
    });

    return [...realData, ...projections];
  }, [timelineData, showDecayCurve]);

  // Find the last real data month to draw a reference line
  const lastRealMonth = timelineData[timelineData.length - 1]?.month;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <h3 className="font-display font-bold text-lg text-ink-950">
              Knowledge Progress Timeline
            </h3>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            Multi-signal historical trajectory with projected knowledge decay
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Decay toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDecayCurve}
              onChange={(e) => setShowDecayCurve(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-line text-amber-500 focus:ring-amber-400"
            />
            <span className="text-[11px] font-semibold text-ink-600">Show Decay Curve</span>
          </label>

          {/* Skill Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-ink-600">Skill:</label>
            <select
              value={activeSkill}
              onChange={(e) => setActiveSkill(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-800 focus-ring"
            >
              {skillOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {timelineData.map((d, i) => (
          <div key={d.month} className="p-3 rounded-xl bg-paper/70 border border-line/60">
            <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">{d.month}</p>
            <p className="font-display font-extrabold text-lg text-ink-950 mt-0.5">{d.score}%</p>
            <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
              {i === 0 ? "Baseline" : `+${d.score - timelineData[i - 1].score}% gain`}
            </p>
          </div>
        ))}
      </div>

      {/* Decay Projection Warning */}
      {showDecayCurve && (
        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
          <span>⚠️</span>
          <span className="text-amber-800 font-medium">
            <strong>Dotted line</strong> shows estimated knowledge decay if no practice occurs.
            The projected score after 4 months of inactivity:
            <strong className="ml-1 text-amber-900">
              {computeDecayedScore(timelineData[timelineData.length - 1]?.score || 0, 120)}%
            </strong>
          </span>
        </div>
      )}

      {/* Recharts Multi-Line Chart with Decay Projection */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enhancedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEDCD3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#28565F" }} stroke="#DEDCD3" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#28565F" }} stroke="#DEDCD3" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #DEDCD3",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              formatter={(value, name) => {
                if (value === null) return ["-", name];
                return [`${value}%`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />

            {/* Reference line at the boundary between real data and projections */}
            {showDecayCurve && lastRealMonth && (
              <ReferenceLine
                x={lastRealMonth}
                stroke="#F0AD3F"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#F0AD3F",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Real data lines */}
            <Line
              type="monotone"
              dataKey="score"
              name="Overall Skill Score"
              stroke="#246B62"
              strokeWidth={3}
              dot={{ r: 5, fill: "#246B62" }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="assessment"
              name="Assessment Score"
              stroke="#F0AD3F"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="quiz"
              name="Quiz Score"
              stroke="#4F9D91"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="task"
              name="Practical Task Score"
              stroke="#0D1B1E"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls={false}
            />

            {/* Projected decay line */}
            {showDecayCurve && (
              <Line
                type="monotone"
                dataKey="projectedScore"
                name="Projected Decay (if inactive)"
                stroke="#EF4444"
                strokeWidth={2.5}
                strokeDasharray="8 6"
                dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#EF4444" }}
                connectNulls={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-line/80 flex items-center justify-between text-[11px] text-ink-500">
        <span>AI Knowledge Tracing Model: Continuous Bayesian Skill Calibration + Ebbinghaus Decay</span>
        <span className="text-teal-700 font-semibold">Trend: Steadily Improving (+32% net gain)</span>
      </div>
    </div>
  );
}
