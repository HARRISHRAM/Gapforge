import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Layout from "../components/Layout";
import SkillCard from "../components/SkillCard";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { getGap, getPriority } from "../utils/skillCalculations";
import { useApp } from "../App";

export default function SkillGaps() {
  const { state } = useApp();
  const navigate = useNavigate();
  const skills = state.skills || [];

  if (!skills.length) {
    return (
      <Layout>
        <EmptyState
          title="No assessment results available yet"
          message="Complete roadmap learning until career readiness is above 80%, then take the assessment."
          action={<Button variant="accent" onClick={() => navigate("/roadmap")}>Open roadmap</Button>}
        />
      </Layout>
    );
  }

  const strong = skills.filter((s) => getGap(s) === 0);
  const improve = skills.filter((s) => getGap(s) > 0 && getGap(s) < 40);
  const priority = skills.filter((s) => getPriority(s) === "HIGH");

  const chartData = skills.map((s) => ({ name: s.name, Current: s.currentScore, Required: s.requiredScore }));

  return (
    <Layout>
      <BackButton to="/assessment" label="Assessment" />
      <h1 className="font-display font-extrabold text-2xl text-ink-900">Your skill gaps</h1>
      <p className="text-ink-600 mt-1 mb-8">Here's how your current skills compare to what this career requires.</p>

      <div className="h-72 border border-line rounded-card bg-white p-4 mb-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEDCD3" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#28565F" }} />
            <YAxis tick={{ fontSize: 12, fill: "#28565F" }} />
            <Tooltip />
            <Bar dataKey="Current" fill="#2F8478" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Required" fill="#F0AD3F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {priority.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Top priority skills</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {priority.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </section>
      )}

      {improve.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Skills to improve</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {improve.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </section>
      )}

      {strong.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display font-bold text-lg text-ink-900 mb-4">Strong skills</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strong.map((s) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </section>
      )}

      <Button variant="accent" size="lg" onClick={() => navigate("/roadmap")}>View my roadmap</Button>
    </Layout>
  );
}
