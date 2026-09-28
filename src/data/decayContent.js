// ─── Quick Recap / Cheat Sheet data for the Knowledge Decay "refresh" flow ───
// Each skill maps to a set of flashcard-style bullet points that act as
// bite-sized memory joggers. Shown when the decay engine detects
// that a user is rusty on a particular skill.

export const quickRecapCards = {
  html: {
    skillId: "html",
    title: "HTML Quick Recap",
    emoji: "🏗️",
    cards: [
      {
        id: "html_1",
        front: "What's the difference between <div> and semantic tags?",
        back: "<div> has no meaning — it's a generic container. Semantic tags like <main>, <nav>, <article>, <section> describe the PURPOSE of the content, helping screen readers, SEO crawlers, and developers.",
        category: "Semantics",
      },
      {
        id: "html_2",
        front: "What does <!DOCTYPE html> do?",
        back: "It tells the browser to render the page in standards mode (HTML5). Without it, browsers may fall into quirks mode, causing inconsistent rendering.",
        category: "Fundamentals",
      },
      {
        id: "html_3",
        front: "How do you make a form accessible?",
        back: "Use <label for='id'> linked to <input id='id'>. Add aria-required, aria-describedby for errors, and group related fields with <fieldset> + <legend>.",
        category: "Accessibility",
      },
      {
        id: "html_4",
        front: "What's the correct heading hierarchy?",
        back: "One <h1> per page (page title). Then <h2> for sections, <h3> for subsections, etc. Never skip levels (e.g., h1 → h3). Screen readers use headings to navigate.",
        category: "Structure",
      },
      {
        id: "html_5",
        front: "Block vs Inline elements?",
        back: "Block elements (<div>, <p>, <section>) take full width and start on a new line. Inline elements (<span>, <a>, <strong>) flow within text without breaking the line.",
        category: "Fundamentals",
      },
      {
        id: "html_6",
        front: "What are data attributes?",
        back: "Custom attributes prefixed with data- (e.g., data-user-id='123'). Access in JS via element.dataset.userId. Useful for storing metadata without extra markup.",
        category: "Advanced",
      },
    ],
  },
  css: {
    skillId: "css",
    title: "CSS Quick Recap",
    emoji: "🎨",
    cards: [
      {
        id: "css_1",
        front: "Flexbox: main axis vs cross axis?",
        back: "Main axis = direction items flow (row → horizontal, column → vertical). Cross axis = perpendicular to main axis. justify-content = main axis, align-items = cross axis.",
        category: "Layout",
      },
      {
        id: "css_2",
        front: "CSS Grid: auto-fit vs auto-fill?",
        back: "auto-fill creates as many tracks as possible, even empty ones. auto-fit collapses empty tracks to 0, letting existing items stretch to fill space.",
        category: "Layout",
      },
      {
        id: "css_3",
        front: "What is the CSS specificity order?",
        back: "!important > inline styles > #id > .class / :pseudo-class / [attr] > element / ::pseudo-element. Higher specificity wins. Equal specificity → last rule wins.",
        category: "Fundamentals",
      },
      {
        id: "css_4",
        front: "What does box-sizing: border-box do?",
        back: "Makes width/height include padding and border. Without it (content-box), padding/border are added OUTSIDE the width, making sizing unpredictable.",
        category: "Box Model",
      },
      {
        id: "css_5",
        front: "How does position: sticky work?",
        back: "Element scrolls normally until it reaches a threshold (e.g., top: 0), then sticks in place. It stays in the normal flow but becomes fixed relative to its scroll container.",
        category: "Positioning",
      },
    ],
  },
  javascript: {
    skillId: "javascript",
    title: "JavaScript Quick Recap",
    emoji: "⚡",
    cards: [
      {
        id: "js_1",
        front: "let vs const vs var?",
        back: "var: function-scoped, hoisted. let: block-scoped, not hoisted (TDZ). const: block-scoped, can't be reassigned (but objects/arrays inside CAN be mutated).",
        category: "Variables",
      },
      {
        id: "js_2",
        front: "What is a Promise?",
        back: "An object representing a future value. States: pending → fulfilled (resolved) or rejected. Chain with .then()/.catch(). async/await is syntactic sugar over Promises.",
        category: "Async",
      },
      {
        id: "js_3",
        front: "Arrow functions vs regular functions?",
        back: "Arrow functions: lexical 'this' (inherits from parent scope), no 'arguments' object, can't be used as constructors. Regular functions: own 'this' bound at call time.",
        category: "Functions",
      },
      {
        id: "js_4",
        front: "What is destructuring?",
        back: "Extract values from arrays/objects into variables. Array: const [a, b] = [1, 2]. Object: const { name, age } = person. Can set defaults: const { x = 10 } = obj.",
        category: "Syntax",
      },
      {
        id: "js_5",
        front: "map() vs forEach()?",
        back: "map() returns a NEW array with transformed elements. forEach() just iterates — returns undefined. Use map when you need the result; forEach for side effects only.",
        category: "Arrays",
      },
      {
        id: "js_6",
        front: "What is the event loop?",
        back: "JS is single-threaded. The event loop processes: 1) Call stack (sync code), 2) Microtask queue (Promises), 3) Macrotask queue (setTimeout, I/O). Microtasks run before macrotasks.",
        category: "Core",
      },
    ],
  },
  react: {
    skillId: "react",
    title: "React Quick Recap",
    emoji: "⚛️",
    cards: [
      {
        id: "react_1",
        front: "What is useState?",
        back: "A hook that adds state to functional components. Returns [value, setter]. Setter can take a new value OR a function (prev => newVal) for updates based on previous state.",
        category: "Hooks",
      },
      {
        id: "react_2",
        front: "What does useEffect do?",
        back: "Runs side effects after render. Dependency array controls when: [] = mount only, [dep] = when dep changes, no array = every render. Return a cleanup function for subscriptions.",
        category: "Hooks",
      },
      {
        id: "react_3",
        front: "Props vs State?",
        back: "Props: passed FROM parent, read-only in child. State: managed WITHIN a component, mutable via setter. When state changes, component re-renders.",
        category: "Core Concepts",
      },
      {
        id: "react_4",
        front: "Why do lists need keys?",
        back: "Keys help React identify which items changed, were added, or removed. Use stable, unique IDs — NOT array index (causes bugs when order changes). key={item.id}.",
        category: "Rendering",
      },
      {
        id: "react_5",
        front: "What is lifting state up?",
        back: "Move shared state to the closest common parent. Parent holds the state, passes it down as props, and passes setter functions to children that need to modify it.",
        category: "Patterns",
      },
    ],
  },
  nodejs: {
    skillId: "nodejs",
    title: "Node.js Quick Recap",
    emoji: "🟢",
    cards: [
      {
        id: "node_1",
        front: "What is Express middleware?",
        back: "Functions that execute during the request-response cycle. Format: (req, res, next). Call next() to pass to the next middleware. Used for auth, logging, body parsing, errors.",
        category: "Express",
      },
      {
        id: "node_2",
        front: "CommonJS vs ES Modules?",
        back: "CommonJS: require()/module.exports (synchronous, Node default). ESM: import/export (async, standard JS). Use ESM in Node with \"type\": \"module\" in package.json or .mjs extension.",
        category: "Modules",
      },
      {
        id: "node_3",
        front: "How does req.body work?",
        back: "Raw request body isn't parsed by default. Use middleware: app.use(express.json()) for JSON, app.use(express.urlencoded()) for form data. Then access req.body.fieldName.",
        category: "Express",
      },
      {
        id: "node_4",
        front: "What is process.env?",
        back: "Object containing environment variables. Use for secrets (DB passwords, API keys). Set via .env files with dotenv package: require('dotenv').config(). NEVER commit .env to git.",
        category: "Configuration",
      },
    ],
  },
  sql: {
    skillId: "sql",
    title: "SQL Quick Recap",
    emoji: "🗄️",
    cards: [
      {
        id: "sql_1",
        front: "INNER JOIN vs LEFT JOIN?",
        back: "INNER JOIN: returns only rows with matches in BOTH tables. LEFT JOIN: returns ALL rows from the left table + matching rows from right (NULL if no match).",
        category: "Joins",
      },
      {
        id: "sql_2",
        front: "GROUP BY + HAVING?",
        back: "GROUP BY: collapses rows by column values. HAVING: filters AFTER grouping (like WHERE but for aggregated data). Example: HAVING COUNT(*) > 5.",
        category: "Aggregations",
      },
      {
        id: "sql_3",
        front: "What is an index?",
        back: "A data structure (usually B-tree) that speeds up lookups on a column. Trade-off: faster reads, slower writes (index must be updated). Create on frequently-queried columns.",
        category: "Performance",
      },
      {
        id: "sql_4",
        front: "WHERE vs HAVING?",
        back: "WHERE: filters rows BEFORE grouping. HAVING: filters AFTER grouping. You can't use aggregate functions (SUM, COUNT) in WHERE — use HAVING instead.",
        category: "Filtering",
      },
    ],
  },
  git: {
    skillId: "git",
    title: "Git Quick Recap",
    emoji: "🔀",
    cards: [
      {
        id: "git_1",
        front: "git merge vs git rebase?",
        back: "Merge: creates a merge commit, preserves history. Rebase: rewrites history by placing your commits on top of the target branch — cleaner but changes commit hashes.",
        category: "Branching",
      },
      {
        id: "git_2",
        front: "What does git stash do?",
        back: "Temporarily saves uncommitted changes so you can switch branches. git stash to save, git stash pop to restore. Like a clipboard for work-in-progress code.",
        category: "Workflow",
      },
      {
        id: "git_3",
        front: "How to undo the last commit?",
        back: "git reset --soft HEAD~1: undo commit, keep changes staged. git reset --mixed HEAD~1: undo commit + unstage. git reset --hard HEAD~1: undo everything (DESTRUCTIVE).",
        category: "Recovery",
      },
    ],
  },
};

/**
 * Get quick recap cards for a specific skill.
 */
export const getRecapForSkill = (skillId) =>
  quickRecapCards[skillId?.toLowerCase()] || null;

/**
 * Generate diagnostic mini-quiz questions from quick recap cards.
 * Returns 5 questions derived from the cheat-sheet for a quick pulse check.
 */
export function generateDiagnosticQuiz(skillId) {
  const recap = quickRecapCards[skillId?.toLowerCase()];
  if (!recap) return null;

  // Convert recap cards into multiple-choice style questions
  const questions = recap.cards.slice(0, 5).map((card, idx) => ({
    id: `diag_${skillId}_${idx}`,
    question: card.front,
    correctAnswer: card.back,
    category: card.category,
    difficulty: idx < 2 ? 1 : idx < 4 ? 2 : 3, // Easy → Medium → Hard
  }));

  return {
    skillId,
    title: `${recap.title} — Quick Diagnostic`,
    emoji: recap.emoji,
    questionCount: questions.length,
    estimatedTime: "3 min",
    questions,
  };
}
