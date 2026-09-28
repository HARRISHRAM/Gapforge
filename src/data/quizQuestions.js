// Comprehensive quiz bank per skillId with 10+ MCQ questions and 1 coding challenge per skill.
// Hidden no-repeat filtering and randomizer ensures fresh questions on every attempt.

export const quizBank = {
  javascript: [
    { id: "jq1", question: "What does 'async' before a function declaration do?", options: ["Makes it execute synchronously", "Makes it return a Promise", "Prevents errors from occurring", "Freezes execution"], correct: 1, difficulty: "easy" },
    { id: "jq2", question: "Which keyword pauses execution inside an async function until a Promise settles?", options: ["await", "defer", "pause", "yield"], correct: 0, difficulty: "easy" },
    { id: "jq3", question: "Which method parses a JSON string into a native JavaScript object?", options: ["JSON.stringify", "JSON.parse", "JSON.toObject", "JSON.decode"], correct: 1, difficulty: "easy" },
    { id: "jq4", question: "What does Array.prototype.filter() return?", options: ["A boolean indicator", "A new filtered array", "The modified original array", "The first matched element"], correct: 1, difficulty: "medium" },
    { id: "jq5", question: "How do you handle errors thrown inside an async/await function?", options: ["try / catch blocks", "onError callbacks only", "Window alert handlers", "return null"], correct: 0, difficulty: "medium" },
    { id: "jq6", question: "What is the result of typeof NaN in JavaScript?", options: ["undefined", "number", "NaN", "object"], correct: 1, difficulty: "medium" },
    { id: "jq7", question: "Which statement about JavaScript closures is correct?", options: ["Closures cannot access outer variables", "A function retains access to its lexical scope even when executed outside that scope", "Closures are only used for DOM manipulation", "Closures cause syntax errors in strict mode"], correct: 1, difficulty: "medium" },
    { id: "jq8", question: "What does Promise.all() do when one of the input promises rejects?", options: ["Waits for the rest to finish", "Immediately rejects with that reason", "Ignores the error and returns undefined", "Retries three times"], correct: 1, difficulty: "hard" },
    { id: "jq9", question: "Which array method reduces an array to a single accumulator value?", options: ["map", "reduce", "filter", "flat"], correct: 1, difficulty: "medium" },
    { id: "jq10", question: "What is the difference between '==' and '===' in JavaScript?", options: ["No difference", "'===' performs strict equality without type coercion", "'==' only compares strings", "'===' is deprecated"], correct: 1, difficulty: "easy" },
    { id: "jq11", question: "What is the Event Loop in JavaScript?", options: ["A for-loop that runs continuously", "A mechanism that coordinates the execution of tasks, microtasks, and rendering", "A DOM animation tool", "A multithreading CPU scheduler"], correct: 1, difficulty: "hard" },
    { id: "jq12", question: "How do you safely access deeply nested object properties without throwing if undefined?", options: ["Optional chaining (?.)", "Double question mark (??)", "Safe dot syntax ($.)", "Array indexing only"], correct: 0, difficulty: "medium" },
    { id: "jq13", question: "What does the Nullish Coalescing Operator (??) check for?", options: ["Falsy values (false, 0, '')", "Only null or undefined", "NaN values", "Empty arrays"], correct: 1, difficulty: "medium" },
    { id: "jq14", question: "What is a debounce function used for?", options: ["Speeding up network requests", "Delaying function execution until a quiet period after the last trigger", "Encrypting passwords", "Sorting arrays"], correct: 1, difficulty: "hard" },
    { id: "jq15", question: "Which scope does a 'let' or 'const' variable have?", options: ["Function scope only", "Block scope", "Global scope only", "Dynamic scope"], correct: 1, difficulty: "easy" },
  ],
  react: [
    { id: "rq1", question: "What hook lets you synchronize side effects after a component renders?", options: ["useState", "useEffect", "useRef", "useContext"], correct: 1, difficulty: "easy" },
    { id: "rq2", question: "What is passed into a React component to configure it from its parent?", options: ["State", "Props", "Refs", "Virtual DOM"], correct: 1, difficulty: "easy" },
    { id: "rq3", question: "What causes a React functional component to re-render?", options: ["State or prop updates", "Page scrolling", "Opening developer tools", "Declaring a const"], correct: 0, difficulty: "easy" },
    { id: "rq4", question: "Which array method is standard for rendering dynamic lists of JSX items?", options: ["forEach", "map", "filter only", "reduce"], correct: 1, difficulty: "easy" },
    { id: "rq5", question: "What is the primary role of the 'key' prop when rendering lists in React?", options: ["Styling elements", "Assisting React's reconciliation to track item identity across renders", "Encrypting data", "Handling routing"], correct: 1, difficulty: "medium" },
    { id: "rq6", question: "When should you use the useMemo hook?", options: ["For every calculation", "To memoize expensive computations between re-renders", "To trigger HTTP requests", "To replace useState"], correct: 1, difficulty: "medium" },
    { id: "rq7", question: "What does useCallback do?", options: ["Calls a function immediately", "Returns a memoized version of a callback function between renders", "Executes background workers", "Cleans up subscriptions"], correct: 1, difficulty: "medium" },
    { id: "rq8", question: "What is the purpose of useRef?", options: ["To persist mutable values across renders without causing re-renders", "To trigger visual page reloads", "To style components", "To fetch API data"], correct: 0, difficulty: "medium" },
    { id: "rq9", question: "What is React Context used for?", options: ["Routing URLs", "Sharing global data without prop drilling through intermediate components", "Compiling TypeScript", "Writing backend endpoints"], correct: 1, difficulty: "medium" },
    { id: "rq10", question: "What rule must be followed when calling React Hooks?", options: ["Call them inside loops", "Call them only at the top level of React functions", "Call them inside if statements", "Call them in ordinary helper files"], correct: 1, difficulty: "easy" },
    { id: "rq11", question: "What happens if you provide an empty dependency array [] to useEffect?", options: ["The effect runs on every render", "The effect runs once after initial mount and cleanup on unmount", "The effect never runs", "It throws a runtime error"], correct: 1, difficulty: "medium" },
    { id: "rq12", question: "How do you pass data from a child component to a parent component in React?", options: ["Via a callback function passed down as a prop", "Via localStorage only", "By mutating parent state directly", "Using document.getElementById"], correct: 0, difficulty: "medium" },
    { id: "rq13", question: "What is a custom hook in React?", options: ["A CSS utility function", "A JavaScript function whose name starts with 'use' and can call other hooks", "A lifecycle class method", "A Webpack plugin"], correct: 1, difficulty: "medium" },
    { id: "rq14", question: "What is React StrictMode designed for?", options: ["Enforcing CSS stylesheets", "Highlighting potential side-effect issues and deprecated APIs in development", "Encrypting production bundles", "Minifying images"], correct: 1, difficulty: "hard" },
  ],
  nodejs: [
    { id: "nq1", question: "Which CLI command installs a package into your Node.js project?", options: ["npm get", "npm install", "npm download", "npm fetch"], correct: 1, difficulty: "easy" },
    { id: "nq2", question: "What does 'require' or 'import' do in Node.js?", options: ["Deletes a module", "Imports module exports into the file", "Starts an HTTP server", "Runs a test suite"], correct: 1, difficulty: "easy" },
    { id: "nq3", question: "In Express.js, what is middleware?", options: ["A database connector only", "Functions that have access to request, response, and next() in the request cycle", "Frontend HTML templates", "Operating system drivers"], correct: 1, difficulty: "medium" },
    { id: "nq4", question: "What is package.json used for?", options: ["Visual styling", "Tracking project metadata, scripts, and dependencies", "Storing encrypted passwords", "Configuring DNS"], correct: 1, difficulty: "easy" },
    { id: "nq5", question: "Which HTTP status code signifies successful resource creation?", options: ["200 OK", "201 Created", "204 No Content", "301 Moved"], correct: 1, difficulty: "easy" },
    { id: "nq6", question: "How does Node.js handle I/O operations without blocking the thread?", options: ["Creating 100 OS threads per request", "Non-blocking event-driven architecture using libuv", "Synchronous waiting", "GPU acceleration"], correct: 1, difficulty: "hard" },
    { id: "nq7", question: "What is the purpose of CORS headers in Node.js APIs?", options: ["Formatting JSON strings", "Allowing or restricting browser requests from different origins", "Database caching", "SSL certification"], correct: 1, difficulty: "medium" },
    { id: "nq8", question: "How do you protect sensitive credentials like database passwords in Node.js?", options: ["Hardcode in source files", "Environment variables (e.g. process.env with dotenv)", "Commit them to public Git", "Store in client cookies"], correct: 1, difficulty: "easy" },
    { id: "nq9", question: "Which built-in Node module is used to interact with the file system?", options: ["fs", "path", "http", "stream"], correct: 0, difficulty: "easy" },
    { id: "nq10", question: "What does next(err) do inside Express middleware?", options: ["Terminates the server process", "Passes error handling to Express error-handling middleware", "Ignores the error", "Retries the route handler"], correct: 1, difficulty: "medium" },
    { id: "nq11", question: "What is JWT (JSON Web Token) commonly used for?", options: ["Stateless user authentication and authorization", "Storing video files", "SQL query formatting", "Compiling CSS"], correct: 0, difficulty: "medium" },
    { id: "nq12", question: "What is the difference between process.nextTick() and setImmediate()?", options: ["No difference", "process.nextTick() fires before the next event loop tick; setImmediate() on the check phase", "setImmediate runs synchronously", "nextTick is deprecated"], correct: 1, difficulty: "hard" },
  ],
  sql: [
    { id: "sq1", question: "Which SQL clause filters rows after an aggregation like GROUP BY?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], correct: 1, difficulty: "medium" },
    { id: "sq2", question: "Which JOIN returns all rows from the left table and matched rows from the right table?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"], correct: 1, difficulty: "easy" },
    { id: "sq3", question: "What is the primary benefit of creating an index on a frequently queried column?", options: ["Compresses disk space", "Significantly speeds up SELECT query lookup times", "Enforces foreign keys", "Encrypts column data"], correct: 1, difficulty: "medium" },
    { id: "sq4", question: "What SQL statement removes records from a table based on a condition?", options: ["REMOVE FROM", "DELETE FROM", "DROP TABLE", "TRUNCATE WHERE"], correct: 1, difficulty: "easy" },
    { id: "sq5", question: "What is an ACID property in relational databases?", options: ["Atomic, Consistent, Isolated, Durable", "Async, Cloud, Integrated, Distributed", "Action, Commit, Index, Data", "Automated, Cached, Indexed, Defined"], correct: 0, difficulty: "hard" },
    { id: "sq6", question: "Which constraint ensures that all values in a column are distinct?", options: ["NOT NULL", "UNIQUE", "CHECK", "DEFAULT"], correct: 1, difficulty: "easy" },
    { id: "sq7", question: "What does the SQL LIKE operator '%apple%' match?", options: ["Only strings starting with apple", "Any string containing 'apple' anywhere", "Only strings ending with apple", "Exact string 'apple'"], correct: 1, difficulty: "easy" },
    { id: "sq8", question: "What is the purpose of a database foreign key?", options: ["To connect to foreign web services", "To maintain referential integrity between two tables", "To speed up write operations", "To encrypt user IDs"], correct: 1, difficulty: "medium" },
    { id: "sq9", question: "Which window function assigns a rank to each row without skipping rank numbers for ties?", options: ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"], correct: 1, difficulty: "hard" },
    { id: "sq10", question: "What is SQL injection?", options: ["Injecting database drivers", "A security vulnerability where untrusted input manipulates query execution", "Automatic data backup", "Creating database migrations"], correct: 1, difficulty: "medium" },
    { id: "sq11", question: "Which statement transactions roll back uncommitted changes?", options: ["COMMIT", "ROLLBACK", "SAVEPOINT", "ABORT TABLE"], correct: 1, difficulty: "easy" },
    { id: "sq12", question: "What is database normalization?", options: ["Backing up data daily", "Structuring tables to reduce data redundancy and improve data integrity", "Converting SQL to JSON", "Deleting unused tables"], correct: 1, difficulty: "medium" },
  ],
  python: [
    { id: "pq1", question: "Which data structure in Python is ordered, mutable, and allows duplicates?", options: ["tuple", "list", "set", "dictionary keys"], correct: 1, difficulty: "easy" },
    { id: "pq2", question: "What is the output of [x * 2 for x in [1, 2, 3]]?", options: ["[1, 2, 3, 1, 2, 3]", "[2, 4, 6]", "[2, 2, 2]", "[4, 4, 4]"], correct: 1, difficulty: "easy" },
    { id: "pq3", question: "Which keyword is used to create a generator function in Python?", options: ["generate", "yield", "return", "next"], correct: 1, difficulty: "medium" },
    { id: "pq4", question: "What is the purpose of the 'with' statement when opening files in Python?", options: ["Increases CPU speed", "Automatically guarantees proper resource cleanup/closing even on error", "Enables multithreading", "Encrypts file contents"], correct: 1, difficulty: "medium" },
    { id: "pq5", question: "How do you create a virtual environment in modern Python?", options: ["python -m venv env", "pip install env", "python create-env", "npm init"], correct: 0, difficulty: "easy" },
    { id: "pq6", question: "What is the GIL (Global Interpreter Lock) in CPython?", options: ["A file system lock", "A mutex that allows only one native thread to execute Python bytecode at a time", "A network firewall", "A package manager feature"], correct: 1, difficulty: "hard" },
    { id: "pq7", question: "What does the *args syntax in a Python function definition allow?", options: ["Passing keyword arguments only", "Passing any number of positional arguments as a tuple", "Pointers in memory", "Multiplying return values"], correct: 1, difficulty: "medium" },
    { id: "pq8", question: "Which method is called when an instance of a class is created in Python?", options: ["__init__", "__new__", "__create__", "__start__"], correct: 0, difficulty: "easy" },
    { id: "pq9", question: "What does dict.get(key, default) do if the key does not exist?", options: ["Throws a KeyError", "Returns the specified default value without raising an error", "Deletes the dictionary", "Inserts the key with None"], correct: 1, difficulty: "easy" },
    { id: "pq10", question: "What is the time complexity of looking up a key in a Python dictionary on average?", options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"], correct: 1, difficulty: "medium" },
    { id: "pq11", question: "What is a decorator in Python?", options: ["A visual UI theme", "A function that takes another function as an argument and extends its behavior without modifying it", "A class destructor", "A syntax error handler"], correct: 1, difficulty: "hard" },
    { id: "pq12", question: "What does the 'is' keyword compare in Python?", options: ["Values for equality", "Memory identity / object references", "String length", "Types only"], correct: 1, difficulty: "medium" },
  ],
  ml: [
    { id: "mlq1", question: "What happens when a machine learning model overfits?", options: ["High training accuracy but poor generalization to unseen test data", "Poor performance on both training and test data", "Weights become exactly zero", "Dataset size increases"], correct: 0, difficulty: "easy" },
    { id: "mlq2", question: "Which metric is the harmonic mean of precision and recall?", options: ["Accuracy", "F1 Score", "ROC-AUC", "MAE"], correct: 1, difficulty: "medium" },
    { id: "mlq3", question: "Which algorithm is an ensemble of decision trees trained with bagging?", options: ["Linear Regression", "Random Forest", "Naive Bayes", "K-Means"], correct: 1, difficulty: "easy" },
    { id: "mlq4", question: "What is the primary purpose of K-Fold Cross Validation?", options: ["Speeding up training", "Evaluating model stability and performance across different dataset subsets", "Feature scaling", "Data visualization"], correct: 1, difficulty: "medium" },
    { id: "mlq5", question: "What is the goal of L2 Regularization (Ridge)?", options: ["Setting random weights to zero", "Penalizing large weight coefficients to prevent overfitting", "Converting classification to regression", "Removing missing values"], correct: 1, difficulty: "medium" },
    { id: "mlq6", question: "Which metric is appropriate for evaluating an imbalanced binary classification dataset?", options: ["Raw Accuracy", "PR-AUC (Precision-Recall Area) / F1 Score", "Mean Squared Error", "R-squared"], correct: 1, difficulty: "hard" },
    { id: "mlq7", question: "What is gradient descent used for in machine learning?", options: ["Cleaning raw text", "Iteratively minimizing the objective loss function by adjusting parameters", "Splitting train/test data", "Plotting decision boundaries"], correct: 1, difficulty: "medium" },
    { id: "mlq8", question: "What type of problem is customer churn prediction?", options: ["Supervised Binary Classification", "Unsupervised Clustering", "Reinforcement Learning", "Dimensionality Reduction"], correct: 0, difficulty: "easy" },
    { id: "mlq9", question: "What is data leakage?", options: ["Unauthorized database access", "When information from the target or test set inadvertently influences model training", "Corrupted CSV files", "Dropping rows"], correct: 1, difficulty: "hard" },
    { id: "mlq10", question: "What is the purpose of one-hot encoding?", options: ["Compressing images", "Converting categorical variables into binary indicator columns", "Standardizing numerical features", "Calculating correlation"], correct: 1, difficulty: "easy" },
    { id: "mlq11", question: "In K-Means clustering, what does 'K' represent?", options: ["The number of iterations", "The number of clusters to form", "The dataset size", "The learning rate"], correct: 1, difficulty: "easy" },
    { id: "mlq12", question: "What does ROC curve plot?", options: ["Precision vs Recall", "True Positive Rate vs False Positive Rate across thresholds", "Loss vs Epochs", "Variance vs Bias"], correct: 1, difficulty: "hard" },
  ],
};

// Coding challenges per skill — 1 interactive coding question shown at the end of every quiz
export const codingChallenges = {
  javascript: {
    id: "code_js_1",
    skillId: "javascript",
    title: "Array Filter & Transformer",
    description: "Write a function `filterActiveUsers(users)` that takes an array of user objects `{ id, name, active, score }` and returns an array of names of active users with score >= 70, sorted alphabetically.",
    starterCode: `function filterActiveUsers(users) {\n  // Your code here\n  return [];\n}`,
    testCases: [
      { input: "[{name:'Alice', active:true, score:80}, {name:'Bob', active:false, score:90}, {name:'Charlie', active:true, score:65}]", expected: "['Alice']" },
    ],
    hint: "Use .filter() to filter active and score >= 70, .map(u => u.name) to get names, and .sort().",
    sampleSolution: `function filterActiveUsers(users) {\n  return users\n    .filter(u => u.active && u.score >= 70)\n    .map(u => u.name)\n    .sort();\n}`,
  },
  react: {
    id: "code_react_1",
    skillId: "react",
    title: "Custom Hook: useToggle",
    description: "Write a React custom hook `useToggle(initialValue = false)` that returns a tuple `[value, toggle]` where calling `toggle()` flips the boolean state, or optionally accepts a boolean to set it explicitly.",
    starterCode: `function useToggle(initialValue = false) {\n  // Write your hook logic using useState\n  return [false, () => {}];\n}`,
    testCases: [
      { input: "useToggle(false); toggle()", expected: "[true, function]" },
    ],
    hint: "Use const [value, setValue] = useState(initialValue); and toggle = (val) => setValue(v => typeof val === 'boolean' ? val : !v);",
    sampleSolution: `function useToggle(initialValue = false) {\n  const [value, setValue] = React.useState(initialValue);\n  const toggle = React.useCallback((val) => {\n    setValue((current) => (typeof val === 'boolean' ? val : !current));\n  }, []);\n  return [value, toggle];\n}`,
  },
  nodejs: {
    id: "code_node_1",
    skillId: "nodejs",
    title: "Express Auth Middleware",
    description: "Write an Express middleware function `requireAuth(req, res, next)` that checks if `req.headers.authorization` starts with 'Bearer '. If present, call `next()`, otherwise return `res.status(401).json({ error: 'Unauthorized' })`.",
    starterCode: `function requireAuth(req, res, next) {\n  // Validate Authorization header\n}`,
    testCases: [
      { input: "headers: { authorization: 'Bearer token123' }", expected: "Calls next()" },
      { input: "headers: {}", expected: "401 Unauthorized" },
    ],
    hint: "Check const auth = req.headers.authorization; if (auth && auth.startsWith('Bearer ')) return next();",
    sampleSolution: `function requireAuth(req, res, next) {\n  const auth = req.headers?.authorization;\n  if (auth && auth.startsWith('Bearer ')) {\n    return next();\n  }\n  return res.status(401).json({ error: 'Unauthorized' });\n}`,
  },
  sql: {
    id: "code_sql_1",
    skillId: "sql",
    title: "SQL Second Highest Salary",
    description: "Write a standard SQL query to select the second highest distinct salary from an `Employees` table with columns `(id, name, salary)`.",
    starterCode: `-- Write your SQL query below\nSELECT DISTINCT salary\nFROM Employees\n...`,
    testCases: [
      { input: "Employees table with salaries: [1000, 2000, 3000]", expected: "2000" },
    ],
    hint: "Use ORDER BY salary DESC LIMIT 1 OFFSET 1 or DENSE_RANK().",
    sampleSolution: `SELECT DISTINCT salary\nFROM Employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;`,
  },
  python: {
    id: "code_py_1",
    skillId: "python",
    title: "Find Duplicate Elements",
    description: "Write a Python function `find_duplicates(nums)` that takes a list of integers and returns a sorted list of all numbers that appear more than once.",
    starterCode: `def find_duplicates(nums):\n    # Return sorted list of duplicates\n    pass`,
    testCases: [
      { input: "[1, 2, 3, 2, 4, 5, 1]", expected: "[1, 2]" },
    ],
    hint: "Use collections.Counter or a seen set and duplicates set.",
    sampleSolution: `def find_duplicates(nums):\n    seen = set()\n    dups = set()\n    for n in nums:\n        if n in seen:\n            dups.add(n)\n        seen.add(n)\n    return sorted(list(dups))`,
  },
  ml: {
    id: "code_ml_1",
    skillId: "ml",
    title: "Calculate Precision & Recall",
    description: "Write a function `compute_metrics(y_true, y_pred)` that calculates precision and recall given two arrays of binary 0/1 labels. Return an object `{ precision, recall }` rounded to 2 decimals.",
    starterCode: `function compute_metrics(y_true, y_pred) {\n  // Calculate TP, FP, FN\n  return { precision: 0, recall: 0 };\n}`,
    testCases: [
      { input: "y_true: [1, 0, 1, 1], y_pred: [1, 0, 0, 1]", expected: "{ precision: 1.00, recall: 0.67 }" },
    ],
    hint: "TP is where both are 1. FP is y_pred=1, y_true=0. FN is y_pred=0, y_true=1. Precision = TP / (TP + FP).",
    sampleSolution: `function compute_metrics(y_true, y_pred) {\n  let tp = 0, fp = 0, fn = 0;\n  for (let i = 0; i < y_true.length; i++) {\n    if (y_true[i] === 1 && y_pred[i] === 1) tp++;\n    if (y_true[i] === 0 && y_pred[i] === 1) fp++;\n    if (y_true[i] === 1 && y_pred[i] === 0) fn++;\n  }\n  const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(2)) : 0;\n  const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(2)) : 0;\n  return { precision, recall };\n}`,
  },
};

// Shuffles an array randomly using Fisher-Yates
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a quiz with exactly 10 MCQ questions and 1 coding challenge.
 * Implements hidden no-repeat filter: prioritizes questions not yet attempted by the student.
 * Shuffles questions so every attempt provides fresh questions!
 */
export function getQuizForSkill(skillId, attemptedQuestionIds = []) {
  const key = (skillId || "javascript").toLowerCase().trim();
  const pool = quizBank[key] || quizBank.javascript;

  // Hidden no-repeat filtering: separate unattempted vs attempted
  const unattempted = pool.filter((q) => !attemptedQuestionIds.includes(q.id));
  const attempted = pool.filter((q) => attemptedQuestionIds.includes(q.id));

  // Shuffle both sets for variety
  const shuffledUnattempted = shuffle(unattempted);
  const shuffledAttempted = shuffle(attempted);

  // Take unattempted first, fill remainder from attempted if needed
  let selected = [...shuffledUnattempted];
  if (selected.length < 10) {
    selected = [...selected, ...shuffledAttempted];
  }

  // If still less than 10, repeat pool questions with unique temporary keys
  while (selected.length < 10) {
    const nextQ = pool[selected.length % pool.length];
    selected.push({ ...nextQ, id: `${nextQ.id}_rev_${selected.length}` });
  }

  // Exactly 10 MCQ questions
  const finalTenMCQs = selected.slice(0, 10);

  // 1 interactive coding question
  const coding = codingChallenges[key] || codingChallenges.javascript;

  return {
    mcqs: finalTenMCQs,
    coding,
    skillId: key,
    totalQuestions: 11, // 10 MCQs + 1 coding
  };
}
