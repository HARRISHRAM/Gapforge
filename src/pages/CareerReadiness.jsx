import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import ScoreCard from "../components/ScoreCard";
import ProgressBar from "../components/ProgressBar";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { calculateReadiness, simulateReadiness } from "../utils/skillCalculations";
import { careerReadinessBreakdown } from "../data/adaptiveMock";
import { getCareerById } from "../data/careers";
import { useApp } from "../App";

export default function CareerReadiness() {
  const { state } = useApp();
  const navigate = useNavigate();
  const skills = state.skills || [];
  const career = getCareerById(state.selectedCareer) || getCareerById("fullstack");

  const readiness = useMemo(() => calculateReadiness(skills) || 68, [skills]);
  const [whatIfSkill, setWhatIfSkill] = useState(skills[0]?.id || "react");
  const [whatIfValue, setWhatIfValue] = useState(skills[0]?.currentScore || 40);

  if (!skills.length || !career) {
    return (
      <Layout>
        <EmptyState
          title="No readiness data yet"
          message="Raise career readiness above 80% on the roadmap, then take the benchmark assessment."
          action={<Button variant="accent" onClick={() => navigate("/roadmap")}>Open roadmap</Button>}
        />
      </Layout>
    );
  }

  const activeSkill = skills.find((s) => s.id === whatIfSkill) || skills[0];
  const simulated = whatIfSkill ? simulateReadiness(skills, whatIfSkill, Number(whatIfValue)) : readiness;
  const potentialImpact = simulated - readiness;

  return (
    <Layout>
      <BackButton to="/dashboard" label="Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              Career Readiness Index
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Employability Predictor
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Target Career: <strong className="text-ink-950 font-bold">{career.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/skill-profile")}>
            Visual Skill Profile →
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate("/adaptive-roadmap")}>
            Adaptive Roadmap
          </Button>
        </div>
      </div>

      {/* Main Readiness Scores */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ScoreCard label="Overall career readiness" value={readiness} accent="teal" />
        <ScoreCard label="Skills evaluated" value={skills.length} suffix=" domains" accent="ink" />
        <ScoreCard label="Benchmark target" value="85" suffix="%" accent="amber" />
      </div>

      {/* Section 16: Dimensional Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Readiness Dimensions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-ink-950">
                Career Dimensions Breakdown
              </h2>
              <p className="text-xs text-ink-500">Evaluated across required technical capabilities</p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Weighted Average
            </span>
          </div>

          <div className="space-y-4">
            {careerReadinessBreakdown.dimensions.map((dim) => (
              <div key={dim.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-900">{dim.name}</span>
                  <div className="flex items-center gap-2 text-ink-500">
                    <span>Target: {dim.benchmark}%</span>
                    <strong className="text-teal-800 text-sm font-bold">{dim.score}%</strong>
                  </div>
                </div>
                <ProgressBar
                  value={dim.score}
                  max={dim.benchmark}
                  color={dim.score < 50 ? "amber" : "teal"}
                  showLabel={false}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Section 16: Biggest Factors Affecting Readiness */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <h2 className="font-display font-bold text-lg text-ink-950">
                Biggest Factors Affecting Readiness
              </h2>
            </div>
            <p className="text-xs text-ink-500 mb-5">
              Identified critical gaps that will yield the greatest increase in your overall score:
            </p>

            <div className="space-y-3">
              {careerReadinessBreakdown.biggestFactors.map((f) => (
                <div
                  key={f.rank}
                  className="p-3.5 rounded-xl border border-line bg-paper/60 flex items-start gap-3 hover:border-teal-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {f.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-ink-950">{f.factor}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-amber-100 text-amber-900">
                        {f.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                      {f.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-ink-500">
            <span>Adaptive recommendation model</span>
            <span className="text-teal-700 font-semibold">+19% potential gain</span>
          </div>
        </Card>
      </div>

      {/* Section 17: Career Readiness "What If?" Simulator */}
      <Card className="p-6 mb-8 border-2 border-teal-500/30 bg-gradient-to-br from-white via-teal-50/20 to-amber-50/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-ink-950">
              Career Readiness "What If?" Simulator
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
            Predictive Simulation
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-600 mb-6">
          Experiment with hypothetical improvements across different skills to preview potential impact on your overall readiness score.
        </p>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-800 uppercase tracking-wider mb-1.5">
                Select Skill to Simulate
              </label>
              <select
                value={whatIfSkill}
                onChange={(e) => {
                  setWhatIfSkill(e.target.value);
                  const s = skills.find((sk) => sk.id === e.target.value);
                  setWhatIfValue(s?.currentScore || 40);
                }}
                className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm focus-ring bg-white font-medium"
              >
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Current: {s.currentScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-ink-800 mb-1.5">
                <span>Move slider to new score:</span>
                <span className="text-teal-700 font-extrabold text-sm">{whatIfValue}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={whatIfValue}
                onChange={(e) => setWhatIfValue(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono">
                <span>0% (Beginner)</span>
                <span>Current: {activeSkill?.currentScore}%</span>
                <span>100% (Expert)</span>
              </div>
            </div>
          </div>

          {/* Simulated Impact Display */}
          <div className="rounded-xl bg-white p-5 border border-teal-200 shadow-xs text-center flex flex-col justify-center">
            <span className="text-xs uppercase font-bold text-ink-500 tracking-wider">
              Estimated Career Readiness
            </span>

            <div className="flex items-center justify-center gap-3 my-2">
              <span className="font-display font-extrabold text-2xl text-ink-400">
                {readiness}%
              </span>
              <span className="text-teal-600 text-2xl font-bold">→</span>
              <span className="font-display font-extrabold text-4xl text-teal-700">
                {simulated}%
              </span>
            </div>

            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  potentialImpact > 0
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : potentialImpact < 0
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-paper text-ink-600"
                }`}
              >
                {potentialImpact > 0
                  ? `Potential Impact: +${potentialImpact}% Overall Readiness`
                  : potentialImpact < 0
                  ? `Simulated Reduction: ${potentialImpact}%`
                  : "No change to baseline"}
              </span>
            </div>

            <p className="text-[11px] text-ink-500 mt-3">
              Simulating {activeSkill?.name} at {whatIfValue}% closes {Math.max(0, (activeSkill?.requiredScore || 80) - whatIfValue)}% gap.
            </p>
          </div>
        </div>

        {/* Section 17 Note */}
        <div className="mt-6 pt-4 border-t border-teal-200/60 text-xs text-ink-600 italic">
          <strong>Important note: </strong>
          "This is an estimated learning/readiness indicator and not a guarantee of employment."
        </div>
      </Card>

      {/* Individual Skill Contributions */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-ink-950 mb-4">
          Individual Skill Contribution
        </h3>
        <div className="space-y-3">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center gap-4 text-xs">
              <span className="w-28 font-semibold text-ink-800 shrink-0">{s.name}</span>
              <div className="flex-1">
                <ProgressBar value={s.currentScore} max={s.requiredScore} showLabel={false} />
              </div>
              <span className="w-16 text-right font-bold text-teal-800 shrink-0">
                {s.currentScore}% / {s.requiredScore}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Layout>
  );
}
