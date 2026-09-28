// Canonical career definitions. Each required skill maps to a skillId
// used consistently across assessment, roadmap, quiz, task and readiness data.
export const careers = [
  {
    id: "fullstack",
    name: "Full-Stack Developer",
    description:
      "Build complete web applications end to end, from interfaces users touch to the servers and databases behind them.",
    requiredSkills: [
      { skillId: "html", name: "HTML", requiredScore: 80, category: "frontend" },
      { skillId: "css", name: "CSS", requiredScore: 80, category: "frontend" },
      { skillId: "javascript", name: "JavaScript", requiredScore: 85, category: "language" },
      { skillId: "react", name: "React", requiredScore: 80, category: "frontend" },
      { skillId: "nodejs", name: "Node.js", requiredScore: 75, category: "backend" },
      { skillId: "sql", name: "SQL", requiredScore: 70, category: "data" },
      { skillId: "git", name: "Git", requiredScore: 65, category: "tools" },
    ],
  },
  {
    id: "aiml",
    name: "AI / ML Engineer",
    description:
      "Design and train models that learn from data, and ship them into products that make decisions.",
    requiredSkills: [
      { skillId: "python", name: "Python", requiredScore: 85, category: "language" },
      { skillId: "math", name: "Mathematics", requiredScore: 75, category: "data" },
      { skillId: "ml", name: "Machine Learning", requiredScore: 80, category: "data" },
      { skillId: "dl", name: "Deep Learning", requiredScore: 70, category: "data" },
      { skillId: "sql", name: "SQL", requiredScore: 65, category: "data" },
      { skillId: "dataproc", name: "Data Processing", requiredScore: 70, category: "data" },
    ],
  },
  {
    id: "datascience",
    name: "Data Scientist",
    description:
      "Turn raw data into decisions: analyze, model, and communicate insight that changes what a business does next.",
    requiredSkills: [
      { skillId: "python", name: "Python", requiredScore: 80, category: "language" },
      { skillId: "statistics", name: "Statistics", requiredScore: 80, category: "data" },
      { skillId: "sql", name: "SQL", requiredScore: 75, category: "data" },
      { skillId: "dataanalysis", name: "Data Analysis", requiredScore: 80, category: "data" },
      { skillId: "ml", name: "Machine Learning", requiredScore: 70, category: "data" },
      { skillId: "dataviz", name: "Data Visualization", requiredScore: 70, category: "data" },
    ],
  },
];

export const getCareerById = (id) => careers.find((c) => c.id === id);
