import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import { SyncGitHubModal } from "../components/LearningHistoryModals";
import { useApp } from "../App";

export default function LearningHistory() {
  const { state, syncGitHubRepos } = useApp();

  // Active Tab: "projects" | "timeline"
  const [activeTab, setActiveTab] = useState("projects");

  // Filters for timeline
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal open state
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleSyncGitHub = (username, repos) => {
    syncGitHubRepos(username, repos);
    showToast(`✓ Synced ${repos.length} repositories from GitHub (@${username})!`);
  };

  const projects =
    state.projects?.length > 0
      ? state.projects
      : (state.githubRepos || []).map((r, i) => ({
          id: `gh_${i}`,
          projectName: r.name,
          description: r.description || "GitHub repository",
          technologies: r.language ? [r.language] : ["JavaScript"],
          skills: [r.language || "Code"],
          repoUrl: r.html_url || `https://github.com/${state.githubUsername || "developer"}/${r.name}`,
          stars: r.stars || r.stargazers_count || 0,
          forks: r.forks || r.forks_count || 0,
          source: "github",
          verified: true,
        }));

  const rawTimeline = state.activityTimeline || [];

  // Filtered & sorted timeline
  const filteredTimeline = useMemo(() => {
    let list = [...rawTimeline];
    if (filterSkill !== "all") {
      list = list.filter((item) => item.skill?.toLowerCase().includes(filterSkill.toLowerCase()));
    }
    if (filterType !== "all") {
      list = list.filter((item) => item.activityType === filterType);
    }
    list.sort((a, b) => {
      const dateA = new Date(a.fullDate || a.date).getTime() || 0;
      const dateB = new Date(b.fullDate || b.date).getTime() || 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    return list;
  }, [rawTimeline, filterSkill, filterType, sortOrder]);

  const activityBadges = {
    assessment: "bg-teal-100 text-teal-800 border-teal-200",
    quiz: "bg-blue-100 text-blue-800 border-blue-200",
    practical_task: "bg-purple-100 text-purple-800 border-purple-200",
    course: "bg-emerald-100 text-emerald-800 border-emerald-200",
    project: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <Layout>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-teal-700 flex items-center gap-3 animate-slideDown">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-teal-300 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <BackButton to="/dashboard" label="Dashboard" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink-950">
              Student Learning History
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
              GitHub Verified
            </span>
          </div>
          <p className="text-ink-600 text-sm mt-1">
            Maintain your verified GitHub portfolio. Each indexed repository validates your practical coding skill.
          </p>
        </div>

        {/* Action Button: ONLY GitHub */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGitHubModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
          >
            <span>🐙</span>
            <span>{state.githubConnected ? "Sync More Repos" : "Sync GitHub"}</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs — Only GitHub Projects & Activity Feed */}
      <div className="flex items-center bg-paper p-1 rounded-xl border border-line mb-6 max-w-md text-xs font-bold">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeTab === "projects" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          GitHub Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeTab === "timeline" ? "bg-white text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-900"
          }`}
        >
          Activity Feed ({rawTimeline.length})
        </button>
      </div>

      {/* TAB 1: GITHUB PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-500 font-medium">
              Public repositories indexed from your GitHub account:
            </p>
            {state.githubConnected && (
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Connected: @{state.githubUsername}
              </span>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No GitHub repositories synced yet"
              message="Only verified public GitHub projects are credited in your learning history. Connect your GitHub profile to index your repositories."
              action={
                <Button variant="accent" onClick={() => setIsGitHubModalOpen(true)}>
                  <span>🐙 Connect &amp; Sync GitHub Profile →</span>
                </Button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <Card key={proj.id} className="p-5 flex flex-col justify-between hover:border-teal-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                          {proj.technologies?.[0] || proj.skills?.[0] || "Code"}
                        </span>
                        <h3 className="font-display font-bold text-base text-ink-950 mt-1 truncate">
                          {proj.projectName}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 shrink-0">
                        Verified
                      </span>
                    </div>

                    <p className="text-xs text-ink-600 line-clamp-2 mb-3">
                      {proj.description || "GitHub repository verified for learning portfolio."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-ink-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <span>⭐</span>
                      <span>{proj.stars || 0}</span>
                      <span className="ml-1 text-ink-300">·</span>
                      <span className="ml-1">🍴 {proj.forks || 0}</span>
                    </span>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        View Repo →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVITY TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-line shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-ink-700 uppercase tracking-wider">Filters:</span>

              {/* Skill Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-ink-500">Skill:</span>
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="rounded-lg border border-line bg-paper px-2.5 py-1 font-semibold text-ink-800 focus-ring"
                >
                  <option value="all">All Skills</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="React">React</option>
                  <option value="Node">Node.js</option>
                  <option value="Python">Python</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>

              {/* Activity Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-ink-500">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-lg border border-line bg-paper px-2.5 py-1 font-semibold text-ink-800 focus-ring"
                >
                  <option value="all">All Activities</option>
                  <option value="project">GitHub Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-500">Sort:</span>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="font-semibold text-ink-800 hover:text-teal-700 underline"
              >
                {sortOrder === "desc" ? "Newest First ↓" : "Oldest First ↑"}
              </button>
            </div>
          </div>

          {/* Timeline Feed */}
          {filteredTimeline.length === 0 ? (
            <EmptyState
              title="No learning activities recorded yet"
              message="Activities will appear here as you take assessments and sync GitHub projects."
              action={
                <Button variant="accent" size="sm" onClick={() => setIsGitHubModalOpen(true)}>
                  <span>🐙 Sync GitHub Repos</span>
                </Button>
              }
            />
          ) : (
            <div className="relative border-l-2 border-line ml-4 pl-6 space-y-6">
              {filteredTimeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                  <div className="bg-white p-4 rounded-xl border border-line shadow-2xs hover:border-teal-300 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            activityBadges[item.activityType] || "bg-paper text-ink-700"
                          }`}
                        >
                          {item.type || item.activityType}
                        </span>
                        <span className="font-bold text-ink-950 text-sm">{item.skill || item.title}</span>
                      </div>
                      <span className="text-[11px] font-medium text-ink-400">{item.date}</span>
                    </div>

                    <p className="text-xs text-ink-600 mb-3">{item.note}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-line/60">
                      <span className="font-semibold text-ink-500">Verified Evidence</span>
                      {item.score !== undefined && (
                        <span className="font-display font-bold text-teal-700">
                          Score: {item.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GitHub Sync Modal Only */}
      <SyncGitHubModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSync={handleSyncGitHub}
      />
    </Layout>
  );
}
