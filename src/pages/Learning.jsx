import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { getTopicBySkill } from "../data/learningContent";
import { useApp } from "../App";

// GitHub-only resource link — ensures all references are from verified official/GitHub sources
function ResourceLink({ href, children, isGitHub }) {
  const isVerified =
    href?.includes("github.com") ||
    href?.includes("developer.mozilla.org") ||
    href?.includes("javascript.info") ||
    href?.includes("eloquentjavascript.net") ||
    href?.includes("web.dev") ||
    href?.includes("docs.") ||
    href?.includes("reactjs.org") ||
    href?.includes("react.dev") ||
    href?.includes("nodejs.org") ||
    href?.includes("youtube.com") ||
    href?.includes("youtu.be");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group px-3.5 py-2.5 rounded-lg border border-line bg-paper hover:border-teal-400 hover:bg-teal-50/50 transition-all text-sm text-ink-800 font-medium"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isVerified && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              ✓ Verified
            </span>
          )}
          <svg className="w-4 h-4 text-ink-400 group-hover:text-teal-600 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function Learning() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state, completeTopicLearning } = useApp();
  const skillId = params.get("skill");
  const topic = getTopicBySkill(skillId);
  const skill = state.skills?.find((s) => s.id === skillId);

  const currentScore = skill?.currentScore ?? 0;
  const targetScore = skill?.requiredScore ?? 75;
  const skillGap = Math.max(0, targetScore - currentScore);
  const gapTier = skillGap >= 40 ? "high" : skillGap >= 15 ? "medium" : "low";

  // ── GitHub & Official Sources Only ──
  // All resources are filtered to verified GitHub/official documentation
  const adaptedResources = useMemo(() => {
    if (!topic?.resources) return null;

    const baseWeb = topic.resources.websites || [];
    const baseVideos = topic.resources.youtube || [];

    // GitHub-specific resources always included
    const githubResources = [
      {
        title: `${topic.title} — GitHub Search`,
        url: `https://github.com/search?q=${encodeURIComponent(topic.skillId)}&type=repositories&sort=stars`,
        description: "Explore top-starred open source repositories for real-world code examples.",
      },
      {
        title: `Awesome ${skill?.name || topic.skillId} — Curated GitHub List`,
        url: `https://github.com/sindresorhus/awesome`,
        description: "Community-curated list of the best tools, libraries, and tutorials.",
      },
    ];

    if (gapTier === "high") {
      return {
        tierName: "Foundational & Visual Concepts",
        tierBadge: "bg-amber-100 text-amber-900 border-amber-300",
        guidance: "Start with official documentation and visual diagrams before attempting complex architectures.",
        websites: [
          ...githubResources,
          ...(baseWeb.slice(0, 2)),
        ],
        youtube: [
          ...(baseVideos.slice(0, 2)),
        ],
      };
    } else if (gapTier === "medium") {
      return {
        tierName: "Core Architecture & Design Patterns",
        tierBadge: "bg-teal-100 text-teal-900 border-teal-300",
        guidance: "Your foundation is established. Focus on component lifecycle, error handling, and real-world patterns.",
        websites: [
          ...githubResources,
          ...(baseWeb.slice(0, 2)),
        ],
        youtube: [...(baseVideos.slice(0, 2))],
      };
    } else {
      return {
        tierName: "Advanced Optimization & Production Mastery",
        tierBadge: "bg-emerald-100 text-emerald-900 border-emerald-300",
        guidance: "Master performance profiling, memory leak detection, and high-throughput production edge cases.",
        websites: [
          ...githubResources,
          ...(baseWeb.slice(0, 1)),
        ],
        youtube: [...(baseVideos.slice(0, 2))],
      };
    }
  }, [topic, gapTier, skill?.name]);

  if (!topic) {
    return (
      <Layout>
        <BackButton to="/roadmap" label="Roadmap" />
        <EmptyState
          title="No lesson selected"
          message="Open a topic from your roadmap to start learning."
          action={<Button variant="accent" onClick={() => navigate("/roadmap")}>Go to roadmap</Button>}
        />
      </Layout>
    );
  }

  const handleStartQuiz = () => {
    completeTopicLearning(skillId, topic.title);
    navigate(`/quiz?skill=${skillId}&topic=${encodeURIComponent(topic.title)}`);
  };

  return (
    <Layout>
      <BackButton to="/roadmap" label="Roadmap" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
          {skill?.name || topic.skillId}
        </p>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-paper border border-line text-ink-700">
          Current Score: {currentScore}% • Target: {targetScore}% • {skillGap}% Gap
        </span>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-ink-900 mb-6">{topic.title}</h1>

      <div className="max-w-3xl space-y-6">
        {/* Main Content Card */}
        <Card>
          <p className="text-ink-700 leading-relaxed text-sm sm:text-base">{topic.explanation}</p>

          <h3 className="font-display font-bold text-ink-900 mt-6 mb-2">Learning Objectives</h3>
          <ul className="space-y-1.5">
            {topic.objectives.map((o, i) => (
              <li key={i} className="text-sm text-ink-600 flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-display font-bold text-ink-900 mt-6 mb-2">Code Example</h3>
          <pre className="bg-ink-950 text-teal-100 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
            <code>{topic.example}</code>
          </pre>

          <h3 className="font-display font-bold text-ink-900 mt-6 mb-2">Practice Activity</h3>
          <p className="text-sm text-ink-600 leading-relaxed bg-paper/60 p-3 rounded-xl border border-line">
            {topic.practice}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-line">
            <div>
              <span className="text-xs font-bold text-ink-800 block">Ready to test what you learned?</span>
              <span className="text-[11px] text-ink-500">
                Completing this quiz raises skill scores. The benchmark assessment unlocks only above 80% career readiness.
              </span>
            </div>
            <Button variant="accent" size="lg" className="w-full sm:w-auto" onClick={handleStartQuiz}>
              Take 10-Question Quiz &amp; Code →
            </Button>
          </div>
        </Card>

        {/* Reference Material — GitHub & Official Sources Only */}
        {adaptedResources && (
          <div className="space-y-5">
            {/* GitHub-first Banner */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-teal-950 uppercase tracking-wide">
                    📚 Official Reference Material
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${adaptedResources.tierBadge}`}>
                    {adaptedResources.tierName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ink-900 text-white border border-ink-700 flex items-center gap-1">
                    🐙 GitHub First
                  </span>
                </div>
                <p className="text-teal-900/80 leading-relaxed">{adaptedResources.guidance}</p>
              </div>
              <span className="text-[11px] font-bold text-teal-800 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                Tailored for {skillGap}% Gap
              </span>
            </div>

            {/* Website Resources — GitHub & Official Only */}
            {adaptedResources.websites?.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🌐</span>
                  <h3 className="font-display font-bold text-ink-900">
                    Recommended Reading &amp; Reference
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-ink-900 text-white">
                    GitHub &amp; Official Docs Only
                  </span>
                </div>
                <div className="space-y-2">
                  {adaptedResources.websites.map((site, i) => (
                    <ResourceLink key={i} href={site.url}>
                      <span className="text-teal-700 font-semibold group-hover:text-teal-800">
                        {site.title}
                      </span>
                      <p className="text-xs text-ink-500 mt-0.5 font-normal">{site.description}</p>
                    </ResourceLink>
                  ))}
                </div>
              </Card>
            )}

            {/* Adapted YouTube Videos */}
            {adaptedResources.youtube?.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">▶️</span>
                  <h3 className="font-display font-bold text-ink-900">Recommended Video Tutorials</h3>
                </div>
                <div className="space-y-2">
                  {adaptedResources.youtube.map((vid, i) => (
                    <a
                      key={i}
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-line bg-paper hover:border-rose-300 hover:bg-rose-50/40 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-rose-600 group-hover:bg-rose-700 flex items-center justify-center shrink-0 transition-colors">
                        <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-800 group-hover:text-rose-700 transition-colors truncate">
                          {vid.title}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {vid.channel} · {vid.duration}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-ink-400 group-hover:text-rose-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
