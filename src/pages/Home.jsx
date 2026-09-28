import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { demoStudent } from "../data/demoStudent";
import { useApp } from "../App";

const steps = [
  { title: "Assess", body: "Find your current skill level with a short, targeted assessment." },
  { title: "Personalize", body: "Get a learning path built around your specific skill gaps." },
  { title: "Adapt", body: "Your roadmap changes automatically as your skills improve." },
];

export default function Home() {
  const navigate = useNavigate();
  const { loadDemo } = useApp();

  const startDemo = () => {
    loadDemo(demoStudent);
    navigate("/dashboard");
  };

  return (
    <div>
      <header className="flex items-center justify-between px-4 lg:px-8 h-16">
        <span className="font-display font-extrabold text-lg text-ink-900">
          Gap<span className="text-teal-600">Forge</span>
        </span>
        <button onClick={startDemo} className="text-sm font-semibold text-ink-600 hover:text-ink-900 focus-ring rounded">
          View Demo
        </button>
      </header>

      <section className="px-4 lg:px-8 pt-12 pb-20 max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold text-teal-600 mb-4">GapForge</p>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-ink-950 leading-tight">
          Find your skill gaps. Build your career path.
        </h1>
        <p className="text-ink-600 mt-5 text-lg leading-relaxed max-w-xl mx-auto">
          GapForge identifies what skills you're missing, helps you learn them, tests your practical ability,
          and continuously adapts your learning path as you grow.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link to="/profile">
            <Button variant="accent" size="lg">Get Started</Button>
          </Link>
          <Button variant="outline" size="lg" onClick={startDemo}>View Demo</Button>
        </div>
      </section>

      <section className="px-4 lg:px-8 pb-24 max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-ink-900 text-paper font-display font-bold flex items-center justify-center mx-auto sm:mx-0 mb-4">
              {i + 1}
            </div>
            <h3 className="font-display font-bold text-ink-900">{s.title}</h3>
            <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line py-8 px-4 lg:px-8 text-center text-xs text-ink-500">
        GapForge doesn't give every student the same learning path — it changes based on what you actually know and can do.
      </footer>
    </div>
  );
}
