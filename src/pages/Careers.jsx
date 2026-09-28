import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CareerCard from "../components/CareerCard";
import Button from "../components/Button";
import Loading from "../components/Loading";
import { fetchCareers } from "../services/careerService";
import { useApp } from "../App";

export default function Careers() {
  const { state, update } = useApp();
  const navigate = useNavigate();
  const [careers, setCareers] = useState(null);
  const [selected, setSelected] = useState(state.selectedCareer);

  useEffect(() => {
    fetchCareers().then(setCareers);
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    update({ selectedCareer: selected });
    navigate("/roadmap");
  };

  const handleViewRoadmap = (careerId) => {
    navigate(`/roadmap?career=${careerId}`);
  };

  if (!careers) return <Layout><Loading message="Loading career paths..." /></Layout>;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-900">
            Choose your target career
          </h1>
          <p className="text-ink-600 mt-1">
            We'll calibrate your skill assessment and dynamic learning roadmap against this industry profile.
          </p>
        </div>

        <button
          onClick={() => navigate("/roadmap")}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-xl transition-all hover:bg-teal-100/70 self-start sm:self-auto shrink-0 shadow-xs"
        >
          🗺️ Compare All Career Roadmaps →
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {careers.map((c) => (
          <CareerCard
            key={c.id}
            career={c}
            selected={selected === c.id}
            onSelect={() => setSelected(c.id)}
            onViewRoadmap={handleViewRoadmap}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button variant="accent" size="lg" disabled={!selected} onClick={handleContinue}>
          Continue to assessment →
        </Button>

        {selected && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleViewRoadmap(selected)}
          >
            Preview {careers.find((c) => c.id === selected)?.name} Roadmap
          </Button>
        )}
      </div>
    </Layout>
  );
}
