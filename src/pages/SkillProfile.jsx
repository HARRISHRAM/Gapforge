import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import ProgressBar from "../components/ProgressBar";
import MultiEvidenceCard from "../components/MultiEvidenceCard";
import TopicSkillTree from "../components/TopicSkillTree";
import KnowledgeTimelineChart from "../components/KnowledgeTimelineChart";
import EmptyState from "../components/EmptyState";
import { topicSkillProfiles } from "../data/topicSkills";
import { getGap } from "../utils/skillCalculations";
import { useApp } from "../App";

export default function SkillProfile() {
  const { state } = useApp();
  const navigate = useNavigate();
  const skills = state.skills || [];

  const [selectedSkillId, setSelectedSkillId] = useState("javascript");
  const [activeViewTab, setActiveViewTab] = useState("overview"); // "overview" | "topics" | "timeline" | "ai_estimation"

  if (!skills.length) {
    return (
      <Layout>
        <EmptyState
          title="Build your skill profile"
          message="Learn on the roadmap and raise career readiness above 80% to unlock the benchmark assessment."
          action={<Button variant="accent" onClick={() => navigate("/roadmap")}>Open roadmap</Button>}
        />
      </Layout>
    );
  }

  // Active skill profile from mock topic data or fallback
  const activeProfile = topicSkillProfiles[selectedSkillId] || topicSkillProfiles.javascript;
  const currentSkillState = skills.find((s) => s.id === selectedSkillId) || skills[0];
  const overallScore = currentSkillState?.currentScore ?? activeProfile.currentScore;
  const requiredScore = currentSkillState?.requiredScore ?? activeProfile.requiredScore;
  const gap = Math.max(0, requiredScore - overallScore);

  return (
    <Layout>
      <BackButton to="/dashboard" label="Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              Visual Skill Profile
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
              AI/ML Estimation Ready
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Multi-signal Bayesian skill estimation, topic decomposition, and verifiable evidence sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/skill-gaps")}>
            View Gap Chart →
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate("/roadmap")}>
            Go to Roadmap
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center bg-paper p-1 rounded-xl border border-line mb-8 max-w-2xl text-xs font-bold">
        <button
          onClick={() => setActiveViewTab("overview")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeViewTab === "overview" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          Skills Overview
        </button>
        <button
          onClick={() => setActiveViewTab("topics")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeViewTab === "topics" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          Topic-Level Tracking
        </button>
        <button
          onClick={() => setActiveViewTab("timeline")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeViewTab === "timeline" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          Progress Timeline
        </button>
        <button
          onClick={() => setActiveViewTab("ai_estimation")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeViewTab === "ai_estimation" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          AI Estimation Card
        </button>
      </div>

      {/* VIEW 1: SKILLS OVERVIEW (Section 4 & 15) */}
      {activeViewTab === "overview" && (
        <div className="space-y-8">
          {/* Main Skills Matrix Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-ink-950">Current Skills & Calibration</h2>
              <span className="text-xs text-ink-500">Target Career: Full-Stack Developer</span>
            </div>

            <div className="space-y-5">
              {skills.map((s) => {
                const sGap = getGap(s);
                const isSelected = s.id === selectedSkillId;
                const profileMeta = topicSkillProfiles[s.id] || {
                  confidence: "High",
                  lastAssessed: "March 2026",
                  evidenceChecks: { assessment: true, quiz: true, project: true, practicalTask: true },
                };

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSkillId(s.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/40 shadow-xs"
                        : "border-line hover:border-teal-300 hover:bg-paper/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-ink-950">{s.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          {s.currentScore}%
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            profileMeta.confidence === "High"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Confidence: {profileMeta.confidence}
                        </span>
                      </div>

                      <div className="text-xs text-ink-500 flex items-center gap-3">
                        <span>Required: <strong>{s.requiredScore}%</strong></span>
                        <span className={sGap > 0 ? "text-amber-700 font-semibold" : "text-emerald-700 font-semibold"}>
                          {sGap > 0 ? `Gap: ${sGap}%` : "Target Met ✓"}
                        </span>
                        <span className="hidden md:inline text-[11px] text-ink-400">
                          Assessed: {profileMeta.lastAssessed}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar
                      value={s.currentScore}
                      max={s.requiredScore}
                      color={sGap > 0 ? "amber" : "teal"}
                      showLabel={false}
                    />

                    {/* Skill Evidence Verified (Section 4) */}
                    <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-600 flex-wrap gap-2">
                      <span className="font-semibold text-ink-700">Verifiable Evidence:</span>
                      <div className="flex items-center gap-3">
                        <span className="text-teal-700 font-medium">Assessment ✓</span>
                        <span className="text-teal-700 font-medium">Quiz ✓</span>
                        <span className="text-teal-700 font-medium">Project ✓</span>
                        <span className="text-teal-700 font-medium">Practical Task ✓</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Multi-Evidence Card for Currently Selected Skill */}
          <div className="grid md:grid-cols-2 gap-6">
            <MultiEvidenceCard
              skillName={currentSkillState.name}
              overallScore={overallScore}
              evidence={activeProfile.evidence}
              confidence={activeProfile.confidence}
              lastAssessed={activeProfile.lastAssessed}
            />

            {/* Quick Weak Topics & Recommendations Box */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎯</span>
                  <h3 className="font-display font-bold text-ink-950">Diagnostic Analysis</h3>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Identified Weak Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProfile.weakTopics?.map((w, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300"
                      >
                        ⚠️ {w}
                      </span>
                    )) || <span className="text-xs text-ink-500">None detected</span>}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500 block mb-1">
                    Demonstrated Strong Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProfile.strongTopics?.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        ✓ {s}
                      </span>
                    )) || <span className="text-xs text-ink-500">Foundational skills calibrated</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <span className="text-xs text-ink-500">Ready to close this gap?</span>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => navigate(`/learning?skill=${currentSkillState.id}`)}
                >
                  Learn {currentSkillState.name} →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: TOPIC-LEVEL SKILL TRACKING (Section 8) */}
      {activeViewTab === "topics" && (
        <div className="space-y-6">
          {/* Skill Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {skills.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSkillId(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  s.id === selectedSkillId
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-white text-ink-700 border-line hover:border-teal-300"
                }`}
              >
                {s.name} ({s.currentScore}%)
              </button>
            ))}
          </div>

          {/* Deep Hierarchy Tree */}
          <TopicSkillTree
            skillName={currentSkillState.name}
            overallScore={overallScore}
            topics={activeProfile.topics || []}
            confidence={activeProfile.confidence}
            evidenceSummary={activeProfile.evidenceChecks}
          />
        </div>
      )}

      {/* VIEW 3: KNOWLEDGE PROGRESS TIMELINE (Section 9) */}
      {activeViewTab === "timeline" && (
        <div className="space-y-6">
          <KnowledgeTimelineChart
            skillProfiles={topicSkillProfiles}
            selectedSkillKey={selectedSkillId}
          />
        </div>
      )}

      {/* VIEW 4: AI/ML ESTIMATION CARD (Section 10) */}
      {activeViewTab === "ai_estimation" && (
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-6 border-teal-300 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-2xl mb-3">
              🤖
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Future AI/ML Skill Estimation Endpoint Preview
            </span>
            <h2 className="font-display font-extrabold text-2xl text-ink-950 mt-1">
              {currentSkillState.name}
            </h2>

            <div className="my-6 p-4 rounded-xl bg-paper/80 border border-line inline-block w-full max-w-sm">
              <p className="text-xs text-ink-500 font-semibold uppercase">Skill Level</p>
              <p className="font-display font-extrabold text-4xl text-teal-700 mt-1">
                {overallScore}%
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-ink-700">Confidence:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeProfile.confidence} ({Math.round(activeProfile.confidenceValue * 100)}%)
                </span>
              </div>
            </div>

            {/* Weak Topics */}
            <div className="text-left bg-white p-4 rounded-xl border border-line mb-6">
              <p className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-2">
                Identified Weak Topics:
              </p>
              <ul className="space-y-1.5 text-xs text-ink-700">
                {activeProfile.weakTopics?.map((w, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="font-semibold text-ink-900">{w}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                      Needs Practice
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Raw JSON Structure Preview for Backend/AI readiness */}
            <div className="text-left">
              <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1">
                <span className="font-mono">Expected JSON Schema (GET /api/ml/estimate):</span>
                <span>Ready for ML integration</span>
              </div>
              <pre className="bg-ink-950 text-teal-200 text-[11px] p-3 rounded-xl overflow-x-auto font-mono">
                {JSON.stringify(
                  {
                    skill: currentSkillState.name,
                    score: overallScore,
                    confidence: activeProfile.confidenceValue,
                    evidence: ["assessment", "quiz", "project", "practical_task"],
                    weakTopics: activeProfile.weakTopics || [],
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
}
