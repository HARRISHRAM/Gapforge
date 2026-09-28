import {
  initialCourses,
  initialProjects,
  initialCertifications,
  initialActivityTimeline,
} from "./learningHistory";

// Scripted "Demo Mode" dataset used to show judges the full adapt loop
// (Assess -> Identify -> Learn -> Do -> Evaluate -> Update -> Adapt)
// without needing a live backend. See utils/skillCalculations.js for the
// formulas this flow relies on.
export const demoStudent = {
  profile: {
    name: "Alex",
    college: "Riverdale State University",
    degree: "B.Sc. Computer Science",
    educationLevel: "Undergraduate",
    currentSkills: "HTML, CSS, basic JavaScript",
    experienceLevel: "Beginner",
    learningGoal: "Become a job-ready Full-Stack Developer",
  },
  selectedCareer: "fullstack",
  skills: [
    { id: "html", name: "HTML", category: "frontend", currentScore: 85, requiredScore: 80, history: [{ source: "assessment", score: 85 }] },
    { id: "css", name: "CSS", category: "frontend", currentScore: 70, requiredScore: 80, history: [{ source: "assessment", score: 70 }] },
    { id: "javascript", name: "JavaScript", category: "language", currentScore: 45, requiredScore: 85, history: [{ source: "assessment", score: 45 }] },
    { id: "react", name: "React", category: "frontend", currentScore: 20, requiredScore: 80, history: [{ source: "assessment", score: 20 }] },
    { id: "nodejs", name: "Node.js", category: "backend", currentScore: 30, requiredScore: 75, history: [{ source: "assessment", score: 30 }] },
    { id: "sql", name: "SQL", category: "data", currentScore: 60, requiredScore: 70, history: [{ source: "assessment", score: 60 }] },
    { id: "git", name: "Git", category: "tools", currentScore: 50, requiredScore: 65, history: [{ source: "assessment", score: 50 }] },
  ],
  courses: initialCourses,
  projects: initialProjects,
  certifications: initialCertifications,
  activityTimeline: initialActivityTimeline,
};
