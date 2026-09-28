// Sample real-world tasks per skillId with concepts tested and AI evaluation criteria.
// Backend ready: will connect to POST /api/task/generate and AI Grader service later.

export const taskBank = {
  react: {
    skillId: "react",
    skillName: "React",
    title: "Build a React form with validation",
    task: "Build a React form with name, email, and password fields that validates input before submission.",
    concepts: ["Components", "State", "Event handling", "Validation"],
    starterCode: `import React, { useState } from 'react';

export default function SignupForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = 'Name is required';
    if (!formData.email.includes('@')) errs.email = 'Invalid email';
    if (formData.password.length < 6) errs.password = 'Min 6 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length === 0) {
      console.log('Valid submission', formData);
    } else {
      setErrors(errs);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Complete component implementation */}
    </form>
  );
}`,
    requirements: [
      "Use useState to manage each field's value",
      "Show an inline error when a field is invalid",
      "Disable the submit button until all fields are valid",
      "Implement proper event handling for change and submit",
    ],
    expectedOutput: "A working form component that blocks submission until name, email, and password all pass validation.",
    evaluationCriteria: ["Components", "State", "Event handling", "Validation"],
  },
  nodejs: {
    skillId: "nodejs",
    skillName: "Node.js",
    title: "Build a JSON status API",
    task: "Create a small Node.js HTTP server with a single GET /status route that returns { status: 'ok' } as JSON.",
    concepts: ["HTTP Server", "Routing", "Status Codes", "JSON Headers"],
    starterCode: `const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(3000);`,
    requirements: ["Use Node's built-in http module or Express", "Return proper JSON headers", "Handle unknown routes with a 404"],
    expectedOutput: "A server that responds correctly to GET /status and returns a 404 for other paths.",
    evaluationCriteria: ["HTTP Server", "Routing", "Status Codes", "JSON Headers"],
  },
  sql: {
    skillId: "sql",
    skillName: "SQL",
    title: "Write a sales summary query",
    task: "Write a SQL query that returns total revenue per product category, sorted from highest to lowest.",
    concepts: ["JOINs", "GROUP BY", "ORDER BY", "Aggregations"],
    starterCode: `SELECT 
  p.category,
  SUM(o.amount) AS total_revenue
FROM orders o
INNER JOIN products p ON o.product_id = p.id
GROUP BY p.category
ORDER BY total_revenue DESC;`,
    requirements: ["Use a JOIN across orders and products", "Group by category", "Sort by total revenue descending"],
    expectedOutput: "A single SQL query returning category and total_revenue columns, correctly sorted.",
    evaluationCriteria: ["JOINs", "GROUP BY", "ORDER BY", "Aggregations"],
  },
  javascript: {
    skillId: "javascript",
    skillName: "JavaScript",
    title: "Implement an asynchronous retry utility",
    task: "Write a utility function retryAsync(fn, retries, delayMs) that attempts to execute an asynchronous operation and retries upon failure.",
    concepts: ["Promises", "Async/Await", "Error handling", "Timing"],
    starterCode: `async function retryAsync(fn, retries = 3, delayMs = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return retryAsync(fn, retries - 1, delayMs * 2);
  }
}`,
    requirements: [
      "Accept an async callback function, maximum retry count, and delay between attempts",
      "Use Promises and setTimeout with exponential backoff or fixed delay",
      "Throw the last caught error if all attempts fail",
    ],
    expectedOutput: "A robust helper that gracefully resolves on successful attempt or rejects with the final error after max retries.",
    evaluationCriteria: ["Promises", "Async/Await", "Error handling", "Timing"],
  },
  html: {
    skillId: "html",
    skillName: "HTML",
    title: "Build an accessible checkout summary modal",
    task: "Code semantic HTML5 markup for an order summary modal dialog with accessible ARIA landmarks.",
    concepts: ["Semantic HTML", "ARIA Landmarks", "Modal Dialog", "Accessibility"],
    starterCode: `<dialog id="checkout-modal" aria-labelledby="modal-title" role="dialog">
  <header>
    <h2 id="modal-title">Order Summary</h2>
  </header>
  <main>
    <ul aria-label="Selected cart items">
      <li>Item 1 - $49.00</li>
    </ul>
  </main>
  <footer>
    <button type="button" aria-label="Confirm purchase">Confirm</button>
  </footer>
</dialog>`,
    requirements: [
      "Use the HTML5 <dialog> element or proper role='dialog'",
      "Provide accessible heading tags and aria-labelledby references",
      "Include keyboard-focusable actions and form elements with explicit labels",
    ],
    expectedOutput: "Standards-compliant semantic markup that passes automated accessibility validation.",
    evaluationCriteria: ["Semantic HTML", "ARIA Landmarks", "Modal Dialog", "Accessibility"],
  },
  css: {
    skillId: "css",
    skillName: "CSS",
    title: "Implement a fluid responsive pricing table",
    task: "Create a modern 3-tier pricing card layout using CSS Grid and Flexbox that transitions cleanly across screen sizes.",
    concepts: ["CSS Grid", "Flexbox", "Media Queries", "Card Layout"],
    starterCode: `/* ─── 1. Grid Container (CSS Grid for column placement) ─── */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

/* ─── 2. Pricing Card (Flexbox for equal heights & vertical flow) ─── */
.pricing-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 16px;
  padding: 1.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border: 2px solid #0d9488;
  position: relative;
}

/* ─── 3. Card Internal Elements ─── */
.pricing-card .card-header {
  margin-bottom: 1.25rem;
}

.pricing-card .plan-price {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0.5rem 0;
}

.pricing-card .features {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  flex-grow: 1; /* Pushes button to bottom */
}

.pricing-card .features li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #475569;
  border-bottom: 1px solid #f1f5f9;
}

.pricing-card .plan-btn {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  background: #0f172a;
  color: #ffffff;
  border: none;
  margin-top: 1rem;
}

.pricing-card.featured .plan-btn {
  background: #0d9488;
}`,
    htmlTemplate: `<div class="pricing-grid">
  <div class="pricing-card">
    <div class="card-header">
      <span class="text-xs uppercase font-bold text-slate-500">Starter</span>
      <h3 class="text-lg font-bold text-slate-900 mt-0.5">Basic Tier</h3>
      <div class="plan-price">$19<span class="text-sm font-normal text-slate-500">/mo</span></div>
    </div>
    <ul class="features">
      <li>✓ Up to 5 team members</li>
      <li>✓ 10 GB cloud workspace</li>
      <li>✓ Standard analytics</li>
    </ul>
    <button class="plan-btn">Choose Basic</button>
  </div>

  <div class="pricing-card featured">
    <div class="card-header">
      <span class="text-xs uppercase font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Most Popular</span>
      <h3 class="text-lg font-bold text-slate-900 mt-1">Professional</h3>
      <div class="plan-price">$49<span class="text-sm font-normal text-slate-500">/mo</span></div>
    </div>
    <ul class="features">
      <li>✓ Unlimited team members</li>
      <li>✓ 100 GB cloud workspace</li>
      <li>✓ Real-time telemetry</li>
      <li>✓ 24/7 Priority support</li>
    </ul>
    <button class="plan-btn">Choose Pro</button>
  </div>

  <div class="pricing-card">
    <div class="card-header">
      <span class="text-xs uppercase font-bold text-slate-500">Enterprise</span>
      <h3 class="text-lg font-bold text-slate-900 mt-0.5">Scale Tier</h3>
      <div class="plan-price">$99<span class="text-sm font-normal text-slate-500">/mo</span></div>
    </div>
    <ul class="features">
      <li>✓ Dedicated account manager</li>
      <li>✓ Custom SLA & enterprise SSO</li>
      <li>✓ Unlimited audit retention</li>
    </ul>
    <button class="plan-btn">Contact Sales</button>
  </div>
</div>`,
    requirements: [
      "Use CSS Grid for column placement",
      "Use Flexbox inside cards for equal heights",
      "Ensure responsiveness without horizontal scroll",
    ],
    expectedOutput: "A fluid responsive 3-column pricing grid.",
    evaluationCriteria: ["CSS Grid", "Flexbox", "Media Queries", "Card Layout"],
  },
  git: {
    skillId: "git",
    skillName: "Git",
    title: "Document a clean git feature-branch release workflow",
    task: "Write a standard Git workflow procedure covering branch naming, conventional commits, rebasing on main, and pull request hygiene.",
    concepts: ["Branching", "Interactive Rebase", "Pull Requests", "Commit Hygiene"],
    starterCode: `# 1. Create feature branch
git checkout -b feat/user-auth main

# 2. Work & commit using conventional style
git add .
git commit -m "feat(auth): add JWT token refresh endpoint"

# 3. Rebase on main before opening PR
git fetch origin main
git rebase origin/main
git push -u origin feat/user-auth`,
    requirements: ["Explain conventional commit syntax", "Describe rebase procedure", "Outline PR merge strategy"],
    expectedOutput: "A clear step-by-step procedure for production teams.",
    evaluationCriteria: ["Branching", "Interactive Rebase", "Pull Requests", "Commit Hygiene"],
  },
};

export function getTaskForSkill(skillId) {
  return taskBank[skillId] || taskBank.react;
}
