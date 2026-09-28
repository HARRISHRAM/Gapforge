import { useCallback, useEffect, useState } from "react";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "../services/authService";
import { initialCourses, initialProjects, initialCertifications, initialActivityTimeline } from "../data/learningHistory";

const CURRENT_SESSION_KEY = "skillpath_active_session";
const VERSION = 5;

// Clean zero-data state for any newly registered account
const createZeroState = (user = null, token = null) => ({
  version: VERSION,
  user,
  authToken: token,
  profile: user ? {
    name: user.name || "",
    email: user.email || "",
    college: "",
    degree: "",
    educationLevel: "",
    currentSkills: "",
    experienceLevel: "Beginner",
    learningGoal: user.career || "fullstack",
  } : null,
  selectedCareer: user?.career || "fullstack",
  assessmentAnswers: {},
  skills: [],            // Zero skills
  quizResults: [],       // Zero quizzes
  taskResults: [],       // Zero tasks
  readinessHistory: [],
  externalCourses: [],   // Zero outside courses
  courses: [],           // Zero courses
  projects: [],          // Zero projects (only from GitHub sync)
  certifications: [],    // Zero certifications (only from verified PDF upload)
  activityTimeline: [],  // Zero activity items
  attemptedQuestions: [],
  topicsCompleted: [],   // Completed learning topics (progress only; assessment unlocks above 80%)
  githubConnected: false,
  githubUsername: null,
  githubRepos: [],
  assessmentCertificate: null, // Stores issued certificate after assessment completion
});

// Demo state for the standard demo account (Alex Rivers)
const createDemoState = () => ({
  version: VERSION,
  user: {
    id: "user_demo_alex",
    name: "Alex Rivers",
    email: "alex@example.com",
    career: "fullstack",
  },
  authToken: "s_demo_token_alex",
  profile: {
    name: "Alex Rivers",
    college: "State Tech University",
    degree: "B.S. Computer Science",
    educationLevel: "Undergraduate",
    currentSkills: "JavaScript, HTML, CSS",
    experienceLevel: "Intermediate",
    learningGoal: "Full-Stack Developer",
  },
  selectedCareer: "fullstack",
  assessmentAnswers: {},
  skills: [
    { id: "javascript", name: "JavaScript", category: "frontend", currentScore: 65, requiredScore: 80, history: [{ source: "assessment", score: 65 }] },
    { id: "react", name: "React", category: "frontend", currentScore: 35, requiredScore: 75, history: [{ source: "assessment", score: 35 }] },
    { id: "nodejs", name: "Node.js", category: "backend", currentScore: 40, requiredScore: 75, history: [{ source: "assessment", score: 40 }] },
    { id: "sql", name: "SQL & Databases", category: "data", currentScore: 55, requiredScore: 70, history: [{ source: "assessment", score: 55 }] },
  ],
  quizResults: [
    { skillId: "javascript", oldScore: 50, newScore: 65, correctCount: 8, totalCount: 10, confidence: 80 },
  ],
  taskResults: [],
  readinessHistory: [],
  externalCourses: [],
  courses: initialCourses,
  projects: initialProjects,
  certifications: initialCertifications,
  activityTimeline: initialActivityTimeline,
  attemptedQuestions: ["jq1", "jq2", "rq1"],
  topicsCompleted: ["javascript"],
  githubConnected: true,
  githubUsername: "alexrivers",
  githubRepos: [
    { name: "react-task-tracker", language: "JavaScript", description: "Kanban board built with React" },
    { name: "node-rest-api", language: "JavaScript", description: "Express authentication API" }
  ],
});

function sanitizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => ({
    ...s,
    currentScore: Math.min(100, Math.max(0, Math.round(Number(s.currentScore) || 0))),
    requiredScore: Math.min(100, Math.max(0, Math.round(Number(s.requiredScore) || 0))),
  }));
}

function getUserStorageKey(email) {
  return `skillpath_user_${(email || "guest").toLowerCase().trim()}`;
}

function loadStateForUser(user, token) {
  if (!user || !user.email) return createZeroState();
  const email = user.email.toLowerCase().trim();

  // If standard demo user and no stored data yet, seed with demo state
  if (email === "alex@example.com") {
    const rawDemo = localStorage.getItem(getUserStorageKey(email));
    if (!rawDemo) {
      const demoState = createDemoState();
      demoState.skills = sanitizeSkills(demoState.skills);
      localStorage.setItem(getUserStorageKey(email), JSON.stringify(demoState));
      return demoState;
    }
  }

  try {
    const raw = localStorage.getItem(getUserStorageKey(email));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.skills) {
        parsed.skills = sanitizeSkills(parsed.skills);
      }
      return {
        ...createZeroState(user, token),
        ...parsed,
        user,
        authToken: token,
      };
    }
  } catch (e) {
    console.error("Error reading user storage:", e);
  }

  // Brand new account: return fresh zero state
  return createZeroState(user, token);
}

function saveUserState(state) {
  if (!state) return;
  try {
    const email = state.user?.email;
    const sanitizedState = state.skills ? { ...state, skills: sanitizeSkills(state.skills) } : state;
    if (email) {
      const key = getUserStorageKey(email);
      localStorage.setItem(key, JSON.stringify(sanitizedState));
      localStorage.setItem(
        CURRENT_SESSION_KEY,
        JSON.stringify({ email, token: state.authToken || "session_token" })
      );

      // Async sync with SQLite database
      fetch("/api/state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
        },
        body: JSON.stringify({ userId: state.user.id, state: sanitizedState }),
      }).catch(() => {});
    } else {
      localStorage.setItem("skillpath_guest_state", JSON.stringify(sanitizedState));
    }
  } catch (e) {
    console.error("Error writing user storage:", e);
  }
}

function readInitialSession() {
  try {
    const rawSession = localStorage.getItem(CURRENT_SESSION_KEY);
    if (rawSession) {
      const { email, token } = JSON.parse(rawSession);
      if (email) {
        const rawUserData = localStorage.getItem(getUserStorageKey(email));
        if (rawUserData) {
          const parsed = JSON.parse(rawUserData);
          if (parsed.skills) {
            parsed.skills = sanitizeSkills(parsed.skills);
          }
          return { ...parsed, authToken: token };
        }
      }
    }
    const rawGuest = localStorage.getItem("skillpath_guest_state");
    if (rawGuest) {
      const parsedGuest = JSON.parse(rawGuest);
      if (parsedGuest && typeof parsedGuest === "object") {
        if (parsedGuest.skills) {
          parsedGuest.skills = sanitizeSkills(parsedGuest.skills);
        }
        return parsedGuest;
      }
    }
  } catch (e) {
    console.error("Error reading initial session:", e);
  }
  return createZeroState();
}

export function useAppState() {
  const [state, setState] = useState(readInitialSession);

  // Auto-persist whenever state changes
  useEffect(() => {
    saveUserState(state);
  }, [state]);

  // Validate active session token with backend if present and real
  useEffect(() => {
    if (state.authToken && !state.user && state.authToken !== "session_token" && state.authToken !== "guest_token") {
      getCurrentUser(state.authToken).then((u) => {
        if (u) {
          const loaded = loadStateForUser(u, state.authToken);
          setState(loaded);
        } else {
          setState(createZeroState());
          localStorage.removeItem(CURRENT_SESSION_KEY);
        }
      });
    }
  }, [state.authToken, state.user]);

  const update = useCallback((patch) => {
    setState((prev) => {
      const updated = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      if (updated.skills) {
        updated.skills = sanitizeSkills(updated.skills);
      }
      return updated;
    });
  }, []);

  // Login: loads the existing account data if available
  const login = useCallback(async (email, password) => {
    const { user, token } = await loginUser(email, password);
    const loadedState = loadStateForUser(user, token);
    setState(loadedState);
    saveUserState(loadedState);
    return user;
  }, []);

  // Register: brand new account ALWAYS starts at zero
  const register = useCallback(async ({ name, email, password, career }) => {
    const { user, token } = await registerUser({ name, email, password, career });
    const freshZeroState = createZeroState(user, token);
    setState(freshZeroState);
    saveUserState(freshZeroState);
    return user;
  }, []);

  const logout = useCallback(async () => {
    if (state.authToken) {
      await logoutUser(state.authToken);
    }
    localStorage.removeItem(CURRENT_SESSION_KEY);
    setState(createZeroState());
  }, [state.authToken]);

  const reset = useCallback(() => {
    if (state.user?.email) {
      localStorage.removeItem(getUserStorageKey(state.user.email));
    }
    localStorage.removeItem(CURRENT_SESSION_KEY);
    setState(createZeroState());
  }, [state.user]);

  const loadDemo = useCallback((demoData) => {
    const demo = createDemoState();
    if (demoData?.profile) {
      demo.profile = { ...demo.profile, ...demoData.profile };
    }
    demo.skills = sanitizeSkills(demo.skills);
    setState(demo);
    saveUserState(demo);
  }, []);

  // Add course — requires verified course details and PDF certificate
  const addCourse = useCallback((newCourse) => {
    setState((prev) => {
      const updatedCourses = [newCourse, ...(prev.courses || [])];
      
      // Also update or add skill in user skills to reflect course evidence
      let updatedSkills = [...(prev.skills || [])];
      if (newCourse.skill) {
        const skillKey = newCourse.skill.toLowerCase().replace(/[^a-z]/g, "");
        const existingIdx = updatedSkills.findIndex((s) => s.id === skillKey || s.name.toLowerCase() === newCourse.skill.toLowerCase());
        const awardedScore = Math.min(100, Math.max(0, newCourse.score || 70));
        if (existingIdx >= 0) {
          const current = updatedSkills[existingIdx];
          const newScore = Math.min(100, Math.max(current.currentScore || 0, awardedScore));
          updatedSkills[existingIdx] = {
            ...current,
            currentScore: newScore,
            history: [...(current.history || []), { source: "course", score: newScore, title: newCourse.courseName }],
          };
        } else {
          updatedSkills.push({
            id: skillKey,
            name: newCourse.skill,
            category: "specialized",
            currentScore: awardedScore,
            requiredScore: 75,
            history: [{ source: "course", score: awardedScore, title: newCourse.courseName }],
          });
        }
      }

      return {
        ...prev,
        courses: updatedCourses,
        skills: updatedSkills,
        activityTimeline: [
          {
            id: `act_${Date.now()}`,
            type: "Course",
            activityType: "course",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: new Date().toISOString().split("T")[0],
            skill: newCourse.skill || "Software Development",
            skillId: (newCourse.skill || "dev").toLowerCase().replace(/[^a-z]/g, ""),
            score: newCourse.score || 85,
            note: `${newCourse.courseName} (${newCourse.platform}) completed with verified certificate`,
            badge: "Course Credit",
          },
          ...(prev.activityTimeline || []),
        ],
      };
    });
  }, []);

  // Helper: Extract skills from GitHub repo based on language, name, description, and keywords
  const extractSkillsFromRepo = (repo) => {
    const detected = new Map();
    const lang = (repo.language || "").toLowerCase();
    const text = `${repo.name || ""} ${repo.description || ""}`.toLowerCase();

    const add = (id, name) => {
      if (!detected.has(id)) detected.set(id, name);
    };

    if (lang === "javascript") add("javascript", "JavaScript");
    if (lang === "typescript") {
      add("javascript", "JavaScript");
      add("typescript", "TypeScript");
    }
    if (lang === "python") add("python", "Python");
    if (lang === "html") add("html", "HTML");
    if (lang === "css") add("css", "CSS");

    if (text.includes("react") || text.includes("nextjs") || text.includes("next.js") || text.includes("redux")) {
      add("react", "React");
      add("javascript", "JavaScript");
    }
    if (text.includes("node") || text.includes("express") || text.includes("nest") || text.includes("fastify") || text.includes("backend") || text.includes("api")) {
      add("nodejs", "Node.js");
      add("javascript", "JavaScript");
    }
    if (text.includes("sql") || text.includes("postgres") || text.includes("mysql") || text.includes("sqlite") || text.includes("database") || text.includes("prisma")) {
      add("sql", "SQL");
    }
    if (text.includes("git") || text.includes("workflow") || text.includes("github-action")) {
      add("git", "Git");
    }
    if (text.includes("tailwind") || text.includes("bootstrap") || text.includes("css") || text.includes("sass") || text.includes("ui")) {
      add("css", "CSS");
    }
    if (text.includes("html") || text.includes("web") || text.includes("landing")) {
      add("html", "HTML");
    }
    if (text.includes("ml") || text.includes("machine-learning") || text.includes("machine learning") || text.includes("ai") || text.includes("model") || text.includes("pytorch") || text.includes("tensorflow")) {
      add("machinelearning", "Machine Learning");
      add("python", "Python");
    }
    if (text.includes("pandas") || text.includes("data") || text.includes("dataset") || text.includes("analysis") || text.includes("numpy")) {
      add("pandas", "Pandas");
      add("python", "Python");
    }

    if (detected.size === 0) {
      const fallbackName = repo.language || "Software Engineering";
      const fallbackKey = fallbackName.toLowerCase().replace(/[^a-z]/g, "");
      add(fallbackKey, fallbackName);
    }

    return Array.from(detected.entries()).map(([id, name]) => ({ id, name }));
  };

  // Sync projects from GitHub profile ONLY
  const syncGitHubRepos = useCallback((username, repos) => {
    const importedProjects = repos.map((repo, i) => {
      const matched = extractSkillsFromRepo(repo);
      const primarySkill = matched[0] || { id: "softwareengineering", name: "Software Engineering" };
      const allSkillNames = matched.map((m) => m.name);

      return {
        id: `gh_${username}_${repo.name || i}`,
        projectName: repo.name,
        description: repo.description || `Repository synced from GitHub (@${username})`,
        technologies: repo.language ? [repo.language, ...allSkillNames.filter((s) => s !== repo.language)] : allSkillNames,
        skills: allSkillNames,
        skillId: primarySkill.id,
        matchedSkillIds: matched.map((m) => m.id),
        stars: repo.stargazers_count || repo.stars || 0,
        forks: repo.forks_count || repo.forks || 0,
        repoUrl: repo.html_url || `https://github.com/${username}/${repo.name}`,
        projectStatus: "Verified on GitHub",
        lastUpdated: repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : new Date().toLocaleDateString(),
        source: "github",
        verified: true,
      };
    });

    setState((prev) => {
      let updatedSkills = [...(prev.skills || [])];

      // Group repos by every matched skill
      const bySkill = {};
      repos.forEach((repo) => {
        const matched = extractSkillsFromRepo(repo);
        matched.forEach(({ id: key, name }) => {
          if (!bySkill[key]) {
            bySkill[key] = { name, repos: [] };
          }
          bySkill[key].repos.push(repo);
        });
      });

      // Apply boost per skill group
      Object.entries(bySkill).forEach(([skillKey, { name, repos: skillRepos }]) => {
        const repoCount = skillRepos.length;
        const totalStars = skillRepos.reduce((sum, r) => sum + (r.stargazers_count || r.stars || 0), 0);
        const totalForks = skillRepos.reduce((sum, r) => sum + (r.forks_count || r.forks || 0), 0);

        // Quality-based boost: max +25 per skill
        const repoBoost = Math.min(repoCount * 6, 18);
        const starBoost = Math.min(Math.floor(totalStars / 5), 8);
        const forkBoost = Math.min(Math.floor(totalForks / 3), 5);
        const totalBoost = Math.min(repoBoost + starBoost + forkBoost, 25);

        const existingIdx = updatedSkills.findIndex((s) => s.id === skillKey);

        if (existingIdx >= 0) {
          const cur = updatedSkills[existingIdx];
          const newScore = Math.min(100, (cur.currentScore || 0) + totalBoost);
          updatedSkills[existingIdx] = {
            ...cur,
            currentScore: newScore,
            history: [
              ...(cur.history || []),
              {
                source: "github_project",
                score: newScore,
                note: `GitHub sync: ${repoCount} repo${repoCount > 1 ? "s" : ""} (${skillRepos[0]?.name || "repo"}), ${totalStars} ⭐, ${totalForks} forks → +${totalBoost} pts`,
              },
            ],
          };
        } else {
          const baseScore = Math.min(100, Math.max(totalBoost + 20, 25));
          updatedSkills.push({
            id: skillKey,
            name,
            category: "development",
            currentScore: baseScore,
            requiredScore: 75,
            history: [
              {
                source: "github_project",
                score: baseScore,
                note: `GitHub sync: ${repoCount} repo${repoCount > 1 ? "s" : ""} (${skillRepos[0]?.name || "repo"}), ${totalStars} ⭐, ${totalForks} forks → ${baseScore} pts`,
              },
            ],
          });
        }
      });

      return {
        ...prev,
        githubConnected: true,
        githubUsername: username,
        githubRepos: repos,
        projects: [...importedProjects, ...(prev.projects || []).filter((p) => p.source !== "github")],
        skills: updatedSkills,
        activityTimeline: [
          {
            id: `act_gh_${Date.now()}`,
            type: "Project",
            activityType: "project",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: new Date().toISOString().split("T")[0],
            skill: "Software Engineering",
            skillId: "softwareengineering",
            score: 75,
            note: `Synced ${importedProjects.length} repositories from GitHub profile (@${username})`,
            badge: "GitHub Sync",
          },
          ...(prev.activityTimeline || []),
        ],
      };
    });
  }, []);

  // Add certification — requires uploaded PDF certificate
  const addCertification = useCallback((newCert) => {
    setState((prev) => ({
      ...prev,
      certifications: [newCert, ...(prev.certifications || [])],
      activityTimeline: [
        {
          id: `act_cert_${Date.now()}`,
          type: "Certification",
          activityType: "certification",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          fullDate: new Date().toISOString().split("T")[0],
          skill: newCert.skill,
          skillId: (newCert.skill || "cert").toLowerCase().replace(/[^a-z]/g, ""),
          score: 90,
          note: `${newCert.certificationName} issued by ${newCert.issuingOrg} (PDF verified)`,
          badge: "Credential",
        },
        ...(prev.activityTimeline || []),
      ],
    }));
  }, []);

  // Complete a learning topic from the roadmap
  const completeTopicLearning = useCallback((skillId, topicTitle) => {
    setState((prev) => ({
      ...prev,
      topicsCompleted: Array.from(new Set([...(prev.topicsCompleted || []), skillId])),
      activityTimeline: [
        {
          id: `act_learn_${Date.now()}`,
          type: "Learning",
          activityType: "course",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          fullDate: new Date().toISOString().split("T")[0],
          skill: skillId,
          skillId: skillId,
          note: `Completed course module: ${topicTitle || skillId}`,
          badge: "Course Module",
        },
        ...(prev.activityTimeline || []),
      ],
    }));
  }, []);

  const recordAttempt = useCallback((questionId) => {
    setState((prev) => ({
      ...prev,
      attemptedQuestions: Array.from(new Set([...(prev.attemptedQuestions || []), questionId])),
    }));
  }, []);

  return {
    state,
    update,
    login,
    register,
    logout,
    reset,
    loadDemo,
    addCourse,
    syncGitHubRepos,
    addCertification,
    completeTopicLearning,
    recordAttempt,
  };
}
