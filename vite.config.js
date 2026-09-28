import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import https from 'https'
import http from 'http'
import {

  findUserByEmail,
  createUser,
  createSession,
  getSession,
  deleteSession,
  getProfile,
  upsertProfile,
  getUserSkills,
  upsertUserSkill,
  getUserProjects,
  saveUserProjects,
  getUserCourses,
  addUserCourse,
  getUserCertifications,
  addUserCertification,
  getUserTimeline,
  addTimelineEvent,
  getCompletedTopics,
  markTopicCompleted,
  saveAssessmentSession,
  getAssessmentSessions,
  recordQuestionAttempt,
  getQuestionAttempts,
  issueCertificate,
  getUserCertificates,
  saveAiMetric,
  getAiMetrics,
  saveUserStateSnapshot,
  getUserStateSnapshot,
  getDbStats
} from './server/db.js'

// Server-side URL fetch using Node.js (no CORS restrictions)
function fetchUrlServerSide(targetUrl, timeoutMs = 10000) {
  return new Promise((resolve) => {
    try {
      const parsedTarget = new URL(targetUrl);
      const lib = parsedTarget.protocol === 'https:' ? https : http;
      const options = {
        hostname: parsedTarget.hostname,
        path: parsedTarget.pathname + parsedTarget.search,
        method: 'GET',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      };

      const req = lib.request(options, (response) => {
        // Follow redirects (up to 5 hops)
        if (
          [301, 302, 303, 307, 308].includes(response.statusCode) &&
          response.headers.location
        ) {
          resolve({ ok: false, redirectTo: response.headers.location, status: response.statusCode });
          return;
        }

        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          resolve({ ok: response.statusCode >= 200 && response.statusCode < 400, status: response.statusCode, body: body.slice(0, 100000) });
        });
      });

      req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
      req.on('error', (err) => { resolve({ ok: false, status: 0, error: err.message }); });
      req.end();
    } catch (err) {
      resolve({ ok: false, status: 0, error: err.message });
    }
  });
}

// Follow redirects server-side (up to 5 hops)
async function fetchWithRedirects(url, maxHops = 5) {
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const result = await fetchUrlServerSide(current);
    if (result.redirectTo) {
      // Resolve relative redirects
      try {
        current = new URL(result.redirectTo, current).href;
      } catch {
        current = result.redirectTo;
      }
      continue;
    }
    return result;
  }
  return { ok: false, status: 0, error: 'Too many redirects' };
}

function sqliteBackendPlugin() {
  return {
    name: 'vite-plugin-sqlite-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only handle /api requests
        if (!req.url.startsWith('/api')) {
          return next();
        }

        const readBody = () =>
          new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
              try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
            });
          });

        const sendJson = (status, data) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;
        const method = req.method;

        // Helper: Extract session user from Bearer token
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const currentUser = token ? getSession(token) : null;

        try {
          // --- Database Diagnostic Stats ---
          if (method === 'GET' && pathname === '/api/db/stats') {
            return sendJson(200, getDbStats());
          }

          // --- Certificate URL Verifier (server-side direct fetch, no CORS) ---
          if (method === 'GET' && pathname === '/api/verify-url') {
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl) {
              return sendJson(400, { error: 'Missing ?url= parameter' });
            }

            // Validate it's a real http/https URL
            let parsedTarget;
            try {
              parsedTarget = new URL(targetUrl);
              if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
                return sendJson(400, { error: 'Only http and https URLs are allowed' });
              }
            } catch {
              return sendJson(400, { error: 'Invalid URL' });
            }

            // Block private/local IPs to prevent SSRF
            const host = parsedTarget.hostname.toLowerCase();
            if (
              host === 'localhost' ||
              host === '127.0.0.1' ||
              host.startsWith('192.168.') ||
              host.startsWith('10.') ||
              host.startsWith('172.16.') ||
              host === '[::1]'
            ) {
              return sendJson(403, { error: 'Private/local URLs are not allowed' });
            }

            const result = await fetchWithRedirects(targetUrl, 5);

            if (!result.ok) {
              return sendJson(200, {
                fetched: false,
                httpStatus: result.status,
                error: result.error || 'Page could not be fetched',
                text: '',
              });
            }

            // Extract title and meta tag contents (e.g., og:title, og:description)
            const metaMatches = result.body.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*>/gi) || [];
            const metaTexts = metaMatches.map((tag) => {
              const m = tag.match(/content=["']([^"']+)["']/i);
              return m ? m[1] : '';
            }).join(' ');

            const titleMatch = result.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const titleText = titleMatch ? titleMatch[1] : '';

            // Strip HTML tags server-side before sending to client
            const stripped = (titleText + ' ' + metaTexts + ' ' + result.body
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<[^>]+>/g, ' '))
              .replace(/\s+/g, ' ')
              .slice(0, 16000);

            return sendJson(200, {
              fetched: true,
              httpStatus: result.status,
              text: stripped,
            });
          }

          // --- Authentication Routes ---
          if (method === 'POST' && pathname === '/api/auth/login') {
            const { email, password } = await readBody();
            if (!email || !password) {
              return sendJson(400, { error: 'Email and password are required' });
            }
            const user = findUserByEmail(email);
            if (!user || user.password !== password) {
              return sendJson(401, { error: 'Invalid email or password' });
            }
            const newToken = createSession(user.id);
            const { password: _, ...safeUser } = user;
            return sendJson(200, { user: safeUser, token: newToken });
          }

          if (method === 'POST' && pathname === '/api/auth/register') {
            const { name, email, password, career } = await readBody();
            if (!name || !email || !password) {
              return sendJson(400, { error: 'Name, email, and password are required' });
            }
            if (findUserByEmail(email)) {
              return sendJson(409, { error: 'An account with this email already exists' });
            }
            const user = createUser({ name, email, password, career: career || 'fullstack' });
            const newToken = createSession(user.id);
            return sendJson(201, { user, token: newToken });
          }

          if (method === 'POST' && pathname === '/api/auth/logout') {
            if (token) deleteSession(token);
            return sendJson(200, { success: true });
          }

          if (method === 'GET' && pathname === '/api/auth/me') {
            if (!currentUser) {
              return sendJson(401, { error: 'Session expired or not logged in' });
            }
            return sendJson(200, { user: currentUser });
          }

          // --- Application State Sync (Bidirectional SQLite Persistence) ---
          if (method === 'GET' && pathname === '/api/state') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const snapshot = getUserStateSnapshot(userId);
            return sendJson(200, { state: snapshot });
          }

          if (method === 'POST' && pathname === '/api/state') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || (body.user && body.user.id) || 'user_demo_alex';
            saveUserStateSnapshot(userId, body.state || body);
            return sendJson(200, { success: true });
          }

          // --- Student Profile ---
          if (method === 'GET' && pathname === '/api/profile') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const profile = getProfile(userId);
            return sendJson(200, { profile });
          }

          if ((method === 'POST' || method === 'PUT') && pathname === '/api/profile') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const updated = upsertProfile(userId, body);
            return sendJson(200, { profile: updated });
          }

          // --- Skills & Mastery ---
          if (method === 'GET' && pathname === '/api/skills') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const skills = getUserSkills(userId);
            return sendJson(200, { skills });
          }

          if (method === 'POST' && pathname === '/api/skills') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            upsertUserSkill(userId, body);
            const skills = getUserSkills(userId);
            return sendJson(200, { skills });
          }

          // --- Learning History (Courses, Projects, Certs, Timeline) ---
          if (method === 'GET' && pathname === '/api/learning-history') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const courses = getUserCourses(userId);
            const projects = getUserProjects(userId);
            const certifications = getUserCertifications(userId);
            const timeline = getUserTimeline(userId);
            return sendJson(200, { courses, projects, certifications, timeline });
          }

          if (method === 'POST' && pathname === '/api/learning-history/course') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const saved = addUserCourse(userId, body);
            return sendJson(201, { course: saved });
          }

          if (method === 'POST' && pathname === '/api/learning-history/certification') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const saved = addUserCertification(userId, body);
            return sendJson(201, { certification: saved });
          }

          if (method === 'POST' && pathname === '/api/learning-history/sync-github') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const savedProjects = saveUserProjects(userId, body.repos || body.projects || []);
            // Update profile with github username if passed
            if (body.username) {
              upsertProfile(userId, { githubUsername: body.username, githubUrl: `https://github.com/${body.username}` });
            }
            return sendJson(200, { projects: savedProjects });
          }

          if (method === 'GET' && pathname === '/api/learning-history/timeline') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const timeline = getUserTimeline(userId);
            return sendJson(200, { timeline });
          }

          if (method === 'POST' && pathname === '/api/learning-history/timeline') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            addTimelineEvent(userId, body);
            return sendJson(201, { success: true });
          }

          // --- Assessment Sessions, Question Attempts & Topics Completed ---
          if (method === 'POST' && pathname === '/api/assessment/session') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const sessionId = saveAssessmentSession(userId, body);
            return sendJson(201, { sessionId });
          }

          if (method === 'GET' && pathname === '/api/assessment/sessions') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const sessions = getAssessmentSessions(userId);
            return sendJson(200, { sessions });
          }

          if (method === 'POST' && pathname === '/api/assessment/attempt') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const attemptId = recordQuestionAttempt(userId, body);
            return sendJson(201, { attemptId });
          }

          if (method === 'GET' && pathname === '/api/assessment/attempts') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const attempts = getQuestionAttempts(userId);
            return sendJson(200, { attempts });
          }

          if (method === 'POST' && pathname === '/api/assessment/topic-completed') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            markTopicCompleted(userId, body.skillId, body.topicTitle);
            return sendJson(200, { success: true });
          }

          // --- Certificates ---
          if (method === 'POST' && pathname === '/api/certificates') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const cert = issueCertificate(userId, body);
            return sendJson(201, { certificate: cert });
          }

          if (method === 'GET' && pathname === '/api/certificates') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const certs = getUserCertificates(userId);
            return sendJson(200, { certificates: certs });
          }

          // --- The 6 AI Metrics Handlers ---
          if (method === 'POST' && pathname === '/api/ai-metrics') {
            const body = await readBody();
            const userId = currentUser?.id || body.userId || 'user_demo_alex';
            const id = saveAiMetric(userId, body.metricType, body.data);
            return sendJson(201, { id, success: true });
          }

          if (method === 'GET' && pathname === '/api/ai-metrics') {
            const userId = currentUser?.id || parsedUrl.searchParams.get('userId') || 'user_demo_alex';
            const metricType = parsedUrl.searchParams.get('type');
            const metrics = getAiMetrics(userId, metricType);
            return sendJson(200, { metrics });
          }

          return next();
        } catch (err) {
          console.error('[SQLite API Error]:', err);
          return sendJson(500, { error: 'Internal Server Error', message: err.message });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sqliteBackendPlugin()],
})
