import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Database file stored in workspace root
const dbPath = path.resolve(__dirname, "../../skillpath.db");

// Initialize SQLite database instance with WAL mode for high performance
const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

// -------------------------------------------------------------
// Schema Definitions
// -------------------------------------------------------------
db.exec(`
  -- 1. Users
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password TEXT NOT NULL,
    career TEXT DEFAULT 'fullstack',
    created_at TEXT NOT NULL,
    updated_at TEXT
  );

  -- 2. Auth Sessions
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 3. Student Profile
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    college TEXT,
    degree TEXT,
    education_level TEXT,
    current_skills TEXT,
    experience_level TEXT,
    learning_goal TEXT,
    bio TEXT,
    github_url TEXT,
    github_username TEXT,
    avatar_url TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 4. User Skills & BKT Mastery
  CREATE TABLE IF NOT EXISTS user_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT,
    current_score INTEGER DEFAULT 0,
    required_score INTEGER DEFAULT 75,
    mastery_prob REAL DEFAULT 0.1, -- Bayesian Knowledge Tracing estimated mastery [0.0 - 1.0]
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 5. Skill History (Score changes, audit trail)
  CREATE TABLE IF NOT EXISTS skill_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    source TEXT NOT NULL, -- 'assessment', 'quiz', 'course', 'github_project', 'task'
    score INTEGER NOT NULL,
    title TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 6. User Projects (GitHub Synced & verified)
  CREATE TABLE IF NOT EXISTS user_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    language TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    repo_url TEXT,
    project_status TEXT DEFAULT 'Verified on GitHub',
    verified INTEGER DEFAULT 1,
    source TEXT DEFAULT 'github',
    last_updated TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 7. User Courses
  CREATE TABLE IF NOT EXISTS user_courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    platform TEXT,
    skill TEXT,
    score INTEGER DEFAULT 70,
    certificate_url TEXT,
    verified INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 8. User Certifications
  CREATE TABLE IF NOT EXISTS user_certifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cert_name TEXT NOT NULL,
    issuing_org TEXT,
    issue_date TEXT,
    credential_url TEXT,
    skill TEXT,
    score INTEGER DEFAULT 85,
    verified INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 9. Activity Timeline
  CREATE TABLE IF NOT EXISTS activity_timeline (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    skill TEXT,
    skill_id TEXT,
    score INTEGER,
    note TEXT,
    badge TEXT,
    full_date TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 10. Completed Learning Topics
  CREATE TABLE IF NOT EXISTS user_topics_completed (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    topic_title TEXT,
    completed_at TEXT NOT NULL,
    UNIQUE(user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 11. Assessment Sessions (Stores scores and ML/proctoring metrics)
  CREATE TABLE IF NOT EXISTS assessment_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    career_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    attention_score REAL DEFAULT 100.0,      -- Idea 1: Gaze & Attention Tracker
    keystroke_confidence REAL DEFAULT 100.0, -- Idea 2: Keystroke Dynamics
    nlp_score REAL,                          -- Idea 3: NLP Semantic Answer Grader
    bkt_mastery REAL,                        -- Idea 4: Bayesian Knowledge Tracing
    originality_score REAL DEFAULT 100.0,    -- Idea 5: Code Plagiarism / Paste Detector
    tab_switches INTEGER DEFAULT 0,
    passed INTEGER DEFAULT 1,
    certificate_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 12. Question Attempts (Individual questions answered)
  CREATE TABLE IF NOT EXISTS question_attempts (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    skill_id TEXT,
    difficulty TEXT,
    user_answer TEXT,
    is_correct INTEGER NOT NULL,
    time_spent_seconds INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 13. Quiz Results
  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    old_score INTEGER,
    new_score INTEGER,
    correct_count INTEGER,
    total_count INTEGER,
    confidence INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 14. Real World Task Results
  CREATE TABLE IF NOT EXISTS task_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    skill_id TEXT,
    score INTEGER,
    feedback TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 15. Verified Certificates
  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    career_id TEXT NOT NULL,
    career_title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    attention_score REAL DEFAULT 100.0,
    originality_score REAL DEFAULT 100.0,
    bkt_mastery REAL DEFAULT 1.0,
    issued_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 16. AI & ML Metrics (Stores continuous data for the 6 Innovation Ideas)
  CREATE TABLE IF NOT EXISTS ai_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'gaze_attention', 'keystroke_dynamics', 'nlp_grader', 'bkt_state', 'code_originality', 'neural_recommendation'
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 17. User State Snapshots (Bidirectional full state persistence backup)
  CREATE TABLE IF NOT EXISTS user_state_snapshots (
    user_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    version INTEGER DEFAULT 5,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Indexes for lightning fast queries
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_skills ON user_skills(user_id, skill_id);
  CREATE INDEX IF NOT EXISTS idx_user_projects ON user_projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_courses ON user_courses(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_certifications ON user_certifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_timeline ON activity_timeline(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_assessment_sessions ON assessment_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_question_attempts ON question_attempts(user_id, question_id);
  CREATE INDEX IF NOT EXISTS idx_ai_metrics_user ON ai_metrics(user_id, metric_type);
`);

// Schema Migration Safety: Ensure new columns exist in older databases
try {
  db.exec("ALTER TABLE users ADD COLUMN updated_at TEXT;");
} catch {
  // Column already exists
}

try {
  db.exec("ALTER TABLE sessions ADD COLUMN expires_at TEXT;");
} catch {
  // Column already exists
}

// -------------------------------------------------------------
// Seed Demo Data for Alex Rivers
// -------------------------------------------------------------
const now = new Date().toISOString();

// Check users
const alexUser = db.prepare("SELECT * FROM users WHERE id = 'user_demo_alex';").get();
if (!alexUser) {
  db.prepare(`
    INSERT INTO users (id, name, email, password, career, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `).run(
    "user_demo_alex",
    "Alex Rivers",
    "alex@example.com",
    "password123",
    "fullstack",
    now,
    now
  );
}

// Check Profile
const alexProfile = db.prepare("SELECT * FROM profiles WHERE user_id = 'user_demo_alex';").get();
if (!alexProfile) {
  db.prepare(`
    INSERT INTO profiles (
      user_id, name, email, college, degree, education_level,
      current_skills, experience_level, learning_goal, bio,
      github_url, github_username, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(
    "user_demo_alex",
    "Alex Rivers",
    "alex@example.com",
    "State Tech University",
    "B.S. Computer Science",
    "Undergraduate",
    "JavaScript, HTML, CSS, React, Node.js",
    "Intermediate",
    "Full-Stack Developer",
    "Passionate about web applications and software engineering.",
    "https://github.com/alexrivers",
    "alexrivers",
    now
  );
}

// Check Skills
const skillCount = db.prepare("SELECT COUNT(*) AS count FROM user_skills WHERE user_id = 'user_demo_alex';").get()?.count || 0;
if (skillCount === 0) {
  const demoSkills = [
    { id: "javascript", name: "JavaScript", category: "frontend", score: 65, req: 80, mastery: 0.72 },
    { id: "react", name: "React", category: "frontend", score: 35, req: 75, mastery: 0.45 },
    { id: "nodejs", name: "Node.js", category: "backend", score: 40, req: 75, mastery: 0.48 },
    { id: "sql", name: "SQL & Databases", category: "data", score: 55, req: 70, mastery: 0.60 },
  ];

  const insertSkill = db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_id, skill_name, category, current_score, required_score, mastery_prob, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  for (const s of demoSkills) {
    insertSkill.run(`usk_${randomUUID().slice(0, 8)}`, "user_demo_alex", s.id, s.name, s.category, s.score, s.req, s.mastery, now);
  }
}

// Check Projects
const projCount = db.prepare("SELECT COUNT(*) AS count FROM user_projects WHERE user_id = 'user_demo_alex';").get()?.count || 0;
if (projCount === 0) {
  const insertProj = db.prepare(`
    INSERT INTO user_projects (id, user_id, project_name, description, language, stars, forks, repo_url, project_status, verified, source, last_updated, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  insertProj.run(
    "proj_demo_1",
    "user_demo_alex",
    "react-task-tracker",
    "Kanban task board built with React, drag-and-drop, and state management",
    "JavaScript",
    14,
    3,
    "https://github.com/alexrivers/react-task-tracker",
    "Verified on GitHub",
    1,
    "github",
    "2026-02-15",
    now
  );

  insertProj.run(
    "proj_demo_2",
    "user_demo_alex",
    "node-rest-api",
    "Express authentication API with JWT tokens and SQLite storage",
    "JavaScript",
    8,
    1,
    "https://github.com/alexrivers/node-rest-api",
    "Verified on GitHub",
    1,
    "github",
    "2026-01-20",
    now
  );
}

// Check Timeline
const timeCount = db.prepare("SELECT COUNT(*) AS count FROM activity_timeline WHERE user_id = 'user_demo_alex';").get()?.count || 0;
if (timeCount === 0) {
  const insertTime = db.prepare(`
    INSERT INTO activity_timeline (id, user_id, type, activity_type, skill, skill_id, score, note, badge, full_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  insertTime.run(
    "act_demo_1",
    "user_demo_alex",
    "Project",
    "project",
    "JavaScript",
    "javascript",
    75,
    "Synced 2 repositories from GitHub profile (@alexrivers)",
    "GitHub Sync",
    now.split("T")[0],
    now
  );

  insertTime.run(
    "act_demo_2",
    "user_demo_alex",
    "Assessment",
    "assessment",
    "JavaScript",
    "javascript",
    65,
    "Completed Full-Stack diagnostic assessment",
    "Assessment",
    now.split("T")[0],
    now
  );
}

// Check Completed Topics
const topicCount = db.prepare("SELECT COUNT(*) AS count FROM user_topics_completed WHERE user_id = 'user_demo_alex';").get()?.count || 0;
if (topicCount === 0) {
  db.prepare(`
    INSERT INTO user_topics_completed (id, user_id, skill_id, topic_title, completed_at)
    VALUES (?, ?, ?, ?, ?);
  `).run(`top_${randomUUID().slice(0, 8)}`, "user_demo_alex", "javascript", "JavaScript Fundamentals", now);
}

// -------------------------------------------------------------
// Database Operations & Helper Functions
// -------------------------------------------------------------

// --- Authentication & Users ---
export function findUserByEmail(email) {
  if (!email) return null;
  const stmt = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE;");
  return stmt.get(email.trim());
}

export function findUserById(id) {
  if (!id) return null;
  const stmt = db.prepare("SELECT id, name, email, career, created_at, updated_at FROM users WHERE id = ?;");
  return stmt.get(id);
}

export function createUser({ name, email, password, career = "fullstack" }) {
  const id = `usr_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO users (id, name, email, password, career, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `).run(id, name.trim(), email.trim().toLowerCase(), password, career, now, now);

  // Initialize profile record
  db.prepare(`
    INSERT INTO profiles (user_id, name, email, learning_goal, updated_at)
    VALUES (?, ?, ?, ?, ?);
  `).run(id, name.trim(), email.trim().toLowerCase(), career, now);

  return { id, name: name.trim(), email: email.trim().toLowerCase(), career, created_at: now };
}

export function createSession(userId) {
  const token = `s_${randomUUID().replace(/-/g, "")}`;
  const now = new Date().toISOString();
  const stmt = db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?);");
  stmt.run(token, userId, now);
  return token;
}

export function getSession(token) {
  if (!token) return null;
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.career, u.created_at
    FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.token = ?;
  `);
  return stmt.get(token);
}

export function deleteSession(token) {
  if (!token) return false;
  const stmt = db.prepare("DELETE FROM sessions WHERE token = ?;");
  stmt.run(token);
  return true;
}

// --- Profiles ---
export function getProfile(userId) {
  const stmt = db.prepare("SELECT * FROM profiles WHERE user_id = ?;");
  return stmt.get(userId) || null;
}

export function upsertProfile(userId, profileData) {
  const now = new Date().toISOString();
  const existing = getProfile(userId);

  if (existing) {
    db.prepare(`
      UPDATE profiles SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        college = COALESCE(?, college),
        degree = COALESCE(?, degree),
        education_level = COALESCE(?, education_level),
        current_skills = COALESCE(?, current_skills),
        experience_level = COALESCE(?, experience_level),
        learning_goal = COALESCE(?, learning_goal),
        bio = COALESCE(?, bio),
        github_url = COALESCE(?, github_url),
        github_username = COALESCE(?, github_username),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = ?
      WHERE user_id = ?;
    `).run(
      profileData.name || null,
      profileData.email || null,
      profileData.college || null,
      profileData.degree || null,
      profileData.educationLevel || null,
      profileData.currentSkills || null,
      profileData.experienceLevel || null,
      profileData.learningGoal || null,
      profileData.bio || null,
      profileData.githubUrl || null,
      profileData.githubUsername || null,
      profileData.avatarUrl || null,
      now,
      userId
    );
  } else {
    db.prepare(`
      INSERT INTO profiles (
        user_id, name, email, college, degree, education_level,
        current_skills, experience_level, learning_goal, bio,
        github_url, github_username, avatar_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `).run(
      userId,
      profileData.name || "",
      profileData.email || "",
      profileData.college || "",
      profileData.degree || "",
      profileData.educationLevel || "",
      profileData.currentSkills || "",
      profileData.experienceLevel || "Beginner",
      profileData.learningGoal || "fullstack",
      profileData.bio || "",
      profileData.githubUrl || "",
      profileData.githubUsername || "",
      profileData.avatarUrl || "",
      now
    );
  }
  return getProfile(userId);
}

// --- Skills & Mastery ---
export function getUserSkills(userId) {
  const stmt = db.prepare(`
    SELECT id, skill_id, skill_name, category, current_score, required_score, mastery_prob, updated_at
    FROM user_skills
    WHERE user_id = ?
    ORDER BY current_score DESC;
  `);
  const skills = stmt.all(userId);
  
  // Attach history entries
  const historyStmt = db.prepare("SELECT * FROM skill_history WHERE user_id = ? AND skill_id = ? ORDER BY created_at ASC;");
  return skills.map((s) => ({
    ...s,
    history: historyStmt.all(userId, s.skill_id),
  }));
}

export function upsertUserSkill(userId, { skillId, skillName, category, score, requiredScore = 75, masteryProb, source = "update", title }) {
  const now = new Date().toISOString();
  const existing = db.prepare("SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?;").get(userId, skillId);

  if (existing) {
    db.prepare(`
      UPDATE user_skills
      SET current_score = ?,
          mastery_prob = COALESCE(?, mastery_prob),
          category = COALESCE(?, category),
          skill_name = COALESCE(?, skill_name),
          updated_at = ?
      WHERE user_id = ? AND skill_id = ?;
    `).run(score, masteryProb !== undefined ? masteryProb : null, category || null, skillName || null, now, userId, skillId);
  } else {
    db.prepare(`
      INSERT INTO user_skills (id, user_id, skill_id, skill_name, category, current_score, required_score, mastery_prob, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `).run(`usk_${randomUUID().slice(0, 8)}`, userId, skillId, skillName || skillId, category || "development", score, requiredScore, masteryProb || 0.1, now);
  }

  // Record history
  db.prepare(`
    INSERT INTO skill_history (id, user_id, skill_id, source, score, title, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `).run(`skh_${randomUUID().slice(0, 8)}`, userId, skillId, source, score, title || null, now);
}

// --- Projects & GitHub Sync ---
export function getUserProjects(userId) {
  const stmt = db.prepare("SELECT * FROM user_projects WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function saveUserProjects(userId, projects) {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO user_projects (
      id, user_id, project_name, description, language, stars, forks, repo_url, project_status, verified, source, last_updated, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  for (const p of projects) {
    const projId = p.id || `proj_${randomUUID().slice(0, 8)}`;
    insert.run(
      projId,
      userId,
      p.projectName || p.name,
      p.description || "",
      p.language || (p.technologies ? p.technologies[0] : "JavaScript"),
      p.stars || p.stargazers_count || 0,
      p.forks || p.forks_count || 0,
      p.repoUrl || p.html_url || "",
      p.projectStatus || "Verified on GitHub",
      p.verified !== undefined ? (p.verified ? 1 : 0) : 1,
      p.source || "github",
      p.lastUpdated || now.split("T")[0],
      p.createdAt || now
    );
  }
  return getUserProjects(userId);
}

// --- Courses & Certifications ---
export function getUserCourses(userId) {
  const stmt = db.prepare("SELECT * FROM user_courses WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function addUserCourse(userId, course) {
  const id = course.id || `crs_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_courses (id, user_id, course_name, platform, skill, score, certificate_url, verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(id, userId, course.courseName, course.platform, course.skill, course.score || 70, course.certificateUrl || null, course.verified ? 1 : 0, now);
  return { id, ...course, created_at: now };
}

export function getUserCertifications(userId) {
  const stmt = db.prepare("SELECT * FROM user_certifications WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function addUserCertification(userId, cert) {
  const id = cert.id || `crt_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO user_certifications (id, user_id, cert_name, issuing_org, issue_date, credential_url, skill, score, verified, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(id, userId, cert.certName || cert.certificationName, cert.issuingOrg, cert.issueDate || cert.year, cert.credentialUrl || cert.credentialId, cert.skill, cert.score || 90, cert.verified ? 1 : 0, now);
  return { id, ...cert, created_at: now };
}

// --- Activity Timeline ---
export function getUserTimeline(userId) {
  const stmt = db.prepare("SELECT * FROM activity_timeline WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function addTimelineEvent(userId, item) {
  const id = item.id || `act_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO activity_timeline (id, user_id, type, activity_type, skill, skill_id, score, note, badge, full_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(id, userId, item.type || "Activity", item.activityType || "event", item.skill || "", item.skillId || "", item.score || null, item.note || "", item.badge || "", item.fullDate || now.split("T")[0], now);
}

// --- Topics Completed ---
export function getCompletedTopics(userId) {
  const stmt = db.prepare("SELECT skill_id, topic_title, completed_at FROM user_topics_completed WHERE user_id = ?;");
  return stmt.all(userId);
}

export function markTopicCompleted(userId, skillId, topicTitle) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO user_topics_completed (id, user_id, skill_id, topic_title, completed_at)
    VALUES (?, ?, ?, ?, ?);
  `).run(`top_${randomUUID().slice(0, 8)}`, userId, skillId, topicTitle || skillId, now);
}

// --- Assessments, Question Attempts & Certificates ---
export function recordQuestionAttempt(userId, { questionId, sessionId, skillId, difficulty, userAnswer, isCorrect, timeSpentSeconds }) {
  const now = new Date().toISOString();
  const id = `att_${randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO question_attempts (id, session_id, user_id, question_id, skill_id, difficulty, user_answer, is_correct, time_spent_seconds, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(id, sessionId || null, userId, questionId, skillId || null, difficulty || null, userAnswer ? String(userAnswer) : null, isCorrect ? 1 : 0, timeSpentSeconds || null, now);
  return id;
}

export function getQuestionAttempts(userId) {
  const stmt = db.prepare("SELECT * FROM question_attempts WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function saveAssessmentSession(userId, data) {
  const sessionId = data.id || `asess_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO assessment_sessions (
      id, user_id, career_id, score, total_questions, correct_count,
      attention_score, keystroke_confidence, nlp_score, bkt_mastery, originality_score,
      tab_switches, passed, certificate_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(
    sessionId,
    userId,
    data.careerId || "fullstack",
    data.score || 0,
    data.totalQuestions || 0,
    data.correctCount || 0,
    data.attentionScore || 100.0,
    data.keystrokeConfidence || 100.0,
    data.nlpScore || null,
    data.bktMastery || null,
    data.originalityScore || 100.0,
    data.tabSwitches || 0,
    data.passed !== undefined ? (data.passed ? 1 : 0) : 1,
    data.certificateId || null,
    now
  );

  return sessionId;
}

export function getAssessmentSessions(userId) {
  const stmt = db.prepare("SELECT * FROM assessment_sessions WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId);
}

export function issueCertificate(userId, certData) {
  const certId = certData.id || `cert_${randomUUID().slice(0, 8)}`;
  const certNumber = certData.certificateNumber || `SP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO certificates (
      id, user_id, certificate_number, career_id, career_title, student_name,
      score, attention_score, originality_score, bkt_mastery, issued_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `).run(
    certId,
    userId,
    certNumber,
    certData.careerId || "fullstack",
    certData.careerTitle || "Full-Stack Developer",
    certData.studentName || "Student",
    certData.score || 85,
    certData.attentionScore || 100.0,
    certData.originalityScore || 100.0,
    certData.bktMastery || 1.0,
    now
  );

  return { id: certId, certificateNumber: certNumber, ...certData, issuedAt: now };
}

export function getUserCertificates(userId) {
  const stmt = db.prepare("SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC;");
  return stmt.all(userId);
}

// --- The 6 AI Metrics Handlers ---
export function saveAiMetric(userId, metricType, data) {
  const id = `aim_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO ai_metrics (id, user_id, metric_type, data_json, created_at)
    VALUES (?, ?, ?, ?, ?);
  `).run(id, userId, metricType, JSON.stringify(data), now);
  return id;
}

export function getAiMetrics(userId, metricType = null) {
  if (metricType) {
    const stmt = db.prepare("SELECT * FROM ai_metrics WHERE user_id = ? AND metric_type = ? ORDER BY created_at DESC;");
    return stmt.all(userId, metricType).map((row) => ({ ...row, data: JSON.parse(row.data_json) }));
  }
  const stmt = db.prepare("SELECT * FROM ai_metrics WHERE user_id = ? ORDER BY created_at DESC;");
  return stmt.all(userId).map((row) => ({ ...row, data: JSON.parse(row.data_json) }));
}

// --- Full Application State Snapshots (Bidirectional Persistence) ---
export function saveUserStateSnapshot(userId, stateObject) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO user_state_snapshots (user_id, state_json, version, updated_at)
    VALUES (?, ?, ?, ?);
  `).run(userId, JSON.stringify(stateObject), stateObject.version || 5, now);
}

export function getUserStateSnapshot(userId) {
  const stmt = db.prepare("SELECT state_json, updated_at FROM user_state_snapshots WHERE user_id = ?;");
  const row = stmt.get(userId);
  if (!row) return null;
  try {
    return JSON.parse(row.state_json);
  } catch {
    return null;
  }
}

// --- Diagnostic & Stats ---
export function getDbStats() {
  const tables = [
    "users",
    "sessions",
    "profiles",
    "user_skills",
    "skill_history",
    "user_projects",
    "user_courses",
    "user_certifications",
    "activity_timeline",
    "user_topics_completed",
    "assessment_sessions",
    "question_attempts",
    "certificates",
    "ai_metrics",
    "user_state_snapshots"
  ];

  const stats = {};
  for (const t of tables) {
    try {
      const res = db.prepare(`SELECT COUNT(*) AS count FROM ${t};`).get();
      stats[t] = res?.count || 0;
    } catch {
      stats[t] = -1;
    }
  }
  return { dbPath, stats };
}

export default db;
