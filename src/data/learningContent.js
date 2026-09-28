// Lesson content per skillId, keyed by skill/topic id.
// A real backend would generate/serve this per-student via /api/learning/:topicId.
export const learningTopics = {
  javascript: {
    skillId: "javascript",
    title: "Async JavaScript & Promises",
    explanation:
      "Asynchronous JavaScript lets your code initiate long-running operations—such as network requests or disk reads—without blocking the main UI thread. Understanding the event loop, Promises, and async/await is essential for modern web engineering.",
    objectives: [
      "Understand the difference between synchronous execution and the JavaScript event loop",
      "Chain Promises and handle rejected states with catch blocks",
      "Write clean, readable asynchronous logic using async/await and try/catch",
    ],
    example: `async function loadUserData(userId) {
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to load user:", err);
    throw err;
  }
}`,
    practice:
      "Write a function called fetchWithTimeout that races a fetch request against a 5-second timeout Promise and throws a descriptive error if the server does not respond in time.",
    resources: {
      websites: [
        { title: "MDN: async/await", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises", description: "Official, thorough guide with live examples" },
        { title: "JavaScript.info: Promises & async/await", url: "https://javascript.info/async", description: "Step-by-step deep dive with exercises" },
        { title: "Eloquent JavaScript – Async", url: "https://eloquentjavascript.net/11_async.html", description: "Free book chapter with challenges" },
      ],
      youtube: [
        { title: "JavaScript Promises In 10 Minutes", channel: "Web Dev Simplified", url: "https://www.youtube.com/watch?v=DHvZLI7Db8E", duration: "10 min" },
        { title: "Async JS Crash Course — Callbacks, Promises, Async/Await", channel: "Traversy Media", url: "https://www.youtube.com/watch?v=PoRJizFvM7s", duration: "25 min" },
      ],
    },
  },
  react: {
    skillId: "react",
    title: "React State Management & Component Lifecycle",
    explanation:
      "State represents the mutable values that determine how a component behaves and renders over time. When state changes, React recalculates the component's virtual DOM tree and updates only the necessary DOM elements efficiently.",
    objectives: [
      "Use the useState hook to manage primitive and object component states",
      "Use useEffect to synchronize with external systems, APIs, and subscriptions",
      "Optimize re-renders using useMemo, useCallback, and React.memo where appropriate",
    ],
    example: `import { useState, useEffect } from 'react';

export function UserStatus({ userId }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const sub = subscribeToUser(userId, (status) => setOnline(status.isOnline));
    return () => sub.unsubscribe();
  }, [userId]);

  return <span className={online ? "text-teal-600" : "text-gray-400"}>{online ? "Online" : "Away"}</span>;
}`,
    practice:
      "Build a custom hook called useDebounce(value, delayMs) that delays updating an output state until the user stops typing into an input field.",
    resources: {
      websites: [
        { title: "React Official Docs — State & Lifecycle", url: "https://react.dev/learn/state-a-components-memory", description: "The best starting point — interactive diagrams" },
        { title: "Kent C. Dodds: useEffect vs useLayoutEffect", url: "https://kentcdodds.com/blog/useeffect-vs-uselayouteffect", description: "Practical breakdown of hook timing" },
        { title: "React DevTools Guide", url: "https://react.dev/learn/react-developer-tools", description: "Learn to profile & debug re-renders" },
      ],
      youtube: [
        { title: "React Hooks Explained in 1 Hour", channel: "Codevolution", url: "https://www.youtube.com/watch?v=O6P86uwfdR0", duration: "60 min" },
        { title: "Every React Hook Explained", channel: "Web Dev Simplified", url: "https://www.youtube.com/watch?v=LlvBzyy-558", duration: "30 min" },
      ],
    },
  },
  nodejs: {
    skillId: "nodejs",
    title: "Node.js Server Runtime & Express APIs",
    explanation:
      "Node.js runs Google Chrome's V8 JavaScript engine outside the browser, using an event-driven, non-blocking I/O model that makes it lightweight and ideal for data-intensive real-time APIs.",
    objectives: [
      "Master the CommonJS and ESM module systems in Node.js",
      "Create modular RESTful routes with Express routers and custom middleware",
      "Implement robust error handling and structured JSON response envelopes",
    ],
    example: `import express from 'express';
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
    practice:
      "Create an Express route middleware that validates incoming JSON request bodies against an expected schema and returns a 400 Bad Request with details if validation fails.",
    resources: {
      websites: [
        { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs", description: "Full API reference & guides" },
        { title: "Express.js Guide", url: "https://expressjs.com/en/guide/routing.html", description: "Routing, middleware, and error handling" },
        { title: "nodemon – Auto-restart on file change", url: "https://nodemon.io/", description: "Essential dev-time tool" },
      ],
      youtube: [
        { title: "Node.js & Express — Full Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", duration: "8 hr" },
        { title: "REST API with Node.js & Express", channel: "Traversy Media", url: "https://www.youtube.com/watch?v=l8WPWK9mS5M", duration: "45 min" },
      ],
    },
  },
  html: {
    skillId: "html",
    title: "Semantic HTML5 & Web Accessibility",
    explanation:
      "Semantic HTML gives structural meaning to web elements rather than merely styling their visual appearance. This provides huge benefits for screen readers, search engine indexers, and mobile browser rendering.",
    objectives: [
      "Select proper semantic landmark tags (main, nav, article, section, aside) instead of unsemantic div soup",
      "Implement accessible form inputs with explicit labels, error aria attributes, and fieldsets",
      "Ensure proper document outline with a single h1 and hierarchical heading levels",
    ],
    example: `<main id="main-content">
  <article aria-labelledby="post-heading">
    <h1 id="post-heading">Accessible Web Architecture</h1>
    <p>Semantic markup empowers all users regardless of their browsing modality.</p>
  </article>
</main>`,
    practice:
      "Refactor a legacy sign-up card built entirely with nested divs and spans into an accessible HTML5 form with proper labels, required indicators, and submit button semantics.",
    resources: {
      websites: [
        { title: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", description: "Complete reference for all HTML elements" },
        { title: "web.dev — Learn HTML", url: "https://web.dev/learn/html", description: "Google's structured HTML course" },
        { title: "WAVE Accessibility Tool", url: "https://wave.webaim.org/", description: "Test any page for accessibility issues" },
      ],
      youtube: [
        { title: "HTML Full Course — Build a Website Tutorial", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=pQN-pnXPaVg", duration: "2 hr" },
        { title: "HTML Semantic Elements Explained", channel: "Kevin Powell", url: "https://www.youtube.com/watch?v=kGW8Al_cga4", duration: "15 min" },
      ],
    },
  },
  css: {
    skillId: "css",
    title: "Modern CSS Layouts & Responsive Systems",
    explanation:
      "Modern CSS provides powerful native layout primitives including CSS Flexbox and CSS Grid, combined with CSS custom properties (variables) and media queries to create fluid, responsive, high-performance interfaces across all devices.",
    objectives: [
      "Harness CSS Flexbox for 1-dimensional distribution and alignment",
      "Master CSS Grid for complex 2-dimensional layouts and template areas",
      "Implement mobile-first responsive breakpoints and fluid typography with clamp()",
    ],
    example: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}`,
    practice:
      "Create a responsive card grid that transitions from a single column on mobile screens to a 2-column layout on tablets and a 4-column layout on desktops using CSS Grid.",
    resources: {
      websites: [
        { title: "CSS-Tricks: A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", description: "The definitive visual Flexbox reference" },
        { title: "CSS-Tricks: A Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/", description: "The definitive visual Grid reference" },
        { title: "web.dev — Learn CSS", url: "https://web.dev/learn/css", description: "Google's free structured CSS curriculum" },
      ],
      youtube: [
        { title: "CSS Grid & Flexbox for Responsive Layouts", channel: "Kevin Powell", url: "https://www.youtube.com/watch?v=qm0IfG1GyZU", duration: "50 min" },
        { title: "CSS Grid Tutorial — Full Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=t6CBKf8K_Ac", duration: "3.5 hr" },
      ],
    },
  },
  git: {
    skillId: "git",
    title: "Git Version Control & Collaborative Workflows",
    explanation:
      "Git is the distributed version control standard for software engineering. It tracks discrete file changes across history, allowing developers to create isolated feature branches, review pull requests, and safely merge code into production.",
    objectives: [
      "Understand Git's three-tree architecture: Working Directory, Staging Index, and Git Repository",
      "Create, rebase, and merge feature branches without losing commit history",
      "Resolve merge conflicts cleanly and craft atomic, meaningful commit messages",
    ],
    example: `# Create and switch to a feature branch
git checkout -b feature/auth-flow
git add src/auth/
git commit -m "feat(auth): add JWT validation middleware"
git push origin feature/auth-flow`,
    practice:
      "Simulate a merge conflict between two branches modifying the same line in a config file, and resolve the conflict cleanly while preserving changes from both features.",
    resources: {
      websites: [
        { title: "Pro Git Book (free)", url: "https://git-scm.com/book/en/v2", description: "The complete authoritative Git reference" },
        { title: "Oh My Git! Interactive Game", url: "https://ohmygit.org/", description: "Learn Git through a visual game" },
        { title: "Conventional Commits Spec", url: "https://www.conventionalcommits.org/", description: "Industry-standard commit message format" },
      ],
      youtube: [
        { title: "Git and GitHub for Beginners — Crash Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", duration: "1 hr" },
        { title: "13 Advanced (but useful) Git Techniques", channel: "Fireship", url: "https://www.youtube.com/watch?v=ecK3EnyGD8o", duration: "8 min" },
      ],
    },
  },
  sql: {
    skillId: "sql",
    title: "Relational SQL & Query Optimization",
    explanation:
      "Structured Query Language (SQL) is the universal language for querying and manipulating data stored in relational databases. Mastering joins, aggregations, window functions, and indexing is essential for both web engineering and data science.",
    objectives: [
      "Execute multi-table relational joins (INNER, LEFT, FULL OUTER)",
      "Aggregate metrics with GROUP BY, HAVING, and summary functions (SUM, AVG, COUNT)",
      "Utilize analytical window functions (ROW_NUMBER, RANK, LEAD, LAG) for cohort and time-series analysis",
    ],
    example: `SELECT 
  c.category_name,
  COUNT(o.id) AS total_orders,
  ROUND(SUM(o.amount)::numeric, 2) AS total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.category_name
ORDER BY total_revenue DESC;`,
    practice:
      "Write a SQL query using window functions that ranks customers by their lifetime spending within each geographic region.",
    resources: {
      websites: [
        { title: "SQLZoo — Interactive SQL Tutorial", url: "https://sqlzoo.net/wiki/SQL_Tutorial", description: "Browser-based SQL playground with challenges" },
        { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", description: "Real-world analytics SQL with datasets" },
        { title: "Use The Index, Luke!", url: "https://use-the-index-luke.com/", description: "Deep dive into SQL indexing & performance" },
      ],
      youtube: [
        { title: "SQL Tutorial — Full Database Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", duration: "4.5 hr" },
        { title: "SQL Window Functions Explained", channel: "Luke Barousse", url: "https://www.youtube.com/watch?v=j6GqDeNKEpg", duration: "30 min" },
      ],
    },
  },
  python: {
    skillId: "python",
    title: "Python for Data Science & Engineering",
    explanation:
      "Python is the dominant language for data analytics, machine learning, and AI due to its elegant syntax, expressive standard library, and vast ecosystem including NumPy, Pandas, and PyTorch.",
    objectives: [
      "Master idiomatic Python: list and dictionary comprehensions, generators, and decorators",
      "Leverage NumPy for vectorized, multidimensional array operations and linear algebra",
      "Write defensive, clean code utilizing type hinting and context managers",
    ],
    example: `import numpy as np

def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
  """Computes cosine similarity between two normalized vectors."""
  dot_product = np.dot(vec_a, vec_b)
  norm_a = np.linalg.norm(vec_a)
  norm_b = np.linalg.norm(vec_b)
  return float(dot_product / (norm_a * norm_b))`,
    practice:
      "Write a Python function using list comprehensions and dictionary grouping that takes a list of raw transaction dicts and returns a summary of total spend grouped by user ID.",
    resources: {
      websites: [
        { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", description: "Start here for solid fundamentals" },
        { title: "Real Python — Tutorials", url: "https://realpython.com/", description: "In-depth articles with worked examples" },
        { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/user_guide/index.html", description: "Comprehensive data manipulation reference" },
      ],
      youtube: [
        { title: "Python for Beginners — Full Course", channel: "Programming with Mosh", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", duration: "6 hr" },
        { title: "Python Data Science Handbook", channel: "Data School", url: "https://www.youtube.com/watch?v=vmEHCJofslg", duration: "35 min" },
      ],
    },
  },
  math: {
    skillId: "math",
    title: "Mathematics for Machine Learning",
    explanation:
      "Machine learning models are mathematical optimization problems under the hood. Fluency in linear algebra, multivariable calculus, and probability enables you to understand and tune modern AI architectures.",
    objectives: [
      "Understand matrix multiplication, determinants, rank, and eigenvalue decompositions",
      "Compute partial derivatives and gradients using the multivariate chain rule",
      "Apply probability concepts: expected value, variance, Bayes' rule, and probability densities",
    ],
    example: `# Gradient Descent parameter update rule:
# W_new = W_old - (learning_rate * gradient_W)
def gradient_step(weights, gradient, lr=0.01):
  return weights - (lr * gradient)`,
    practice:
      "Derive the partial derivative of Mean Squared Error (MSE) loss with respect to weight W and bias b for a single-variable linear model.",
    resources: {
      websites: [
        { title: "3Blue1Brown — Essence of Linear Algebra", url: "https://www.3blue1brown.com/topics/linear-algebra", description: "Best visual introduction to linear algebra" },
        { title: "Khan Academy — Multivariable Calculus", url: "https://www.khanacademy.org/math/multivariable-calculus", description: "Free structured calculus curriculum" },
        { title: "Mathematics for Machine Learning (textbook)", url: "https://mml-book.github.io/", description: "Free PDF book — theory with ML context" },
      ],
      youtube: [
        { title: "Essence of Linear Algebra (Playlist)", channel: "3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", duration: "Series" },
        { title: "Neural Networks from Scratch (Math)", channel: "Andrej Karpathy", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", duration: "2.5 hr" },
      ],
    },
  },
  ml: {
    skillId: "ml",
    title: "Machine Learning Foundations & Algorithms",
    explanation:
      "Machine learning algorithms identify patterns from empirical training data to make predictions on unseen observations without being explicitly programmed with rule trees.",
    objectives: [
      "Formulate supervised problems as regression or classification tasks",
      "Balance the bias-variance tradeoff and mitigate overfitting through cross-validation and regularization",
      "Evaluate models using accuracy, precision, recall, F1 score, and ROC-AUC curves",
    ],
    example: `from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, max_depth=6)
model.fit(X_train, y_train)
preds = model.predict(X_test)
print(classification_report(y_test, preds))`,
    practice:
      "Given an imbalanced dataset where 98% of examples are negative and 2% are positive, explain why accuracy is a flawed metric and describe which metrics you would use instead.",
    resources: {
      websites: [
        { title: "Scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", description: "Essential ML library docs & examples" },
        { title: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", description: "Free course with TensorFlow examples" },
        { title: "Papers With Code", url: "https://paperswithcode.com/", description: "Latest ML research with runnable code" },
      ],
      youtube: [
        { title: "Machine Learning for Everybody — Full Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg", duration: "3.5 hr" },
        { title: "StatQuest — ML Playlist", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF", duration: "Series" },
      ],
    },
  },
  dl: {
    skillId: "dl",
    title: "Deep Learning & Neural Network Architectures",
    explanation:
      "Deep learning uses multi-layered artificial neural networks to learn hierarchical representations from high-dimensional data such as images, audio, natural language, and embeddings.",
    objectives: [
      "Understand forward propagation, activation functions (ReLU, GELU, Softmax), and backpropagation",
      "Build deep neural network models with PyTorch tensors, modules, and optimizers",
      "Understand attention mechanisms and the self-attention layer in Transformer models",
    ],
    example: `import torch
import torch.nn as nn

class SimpleMLP(nn.Module):
  def __init__(self, in_features, hidden_dim, out_classes):
    super().__init__()
    self.network = nn.Sequential(
      nn.Linear(in_features, hidden_dim),
      nn.ReLU(),
      nn.Dropout(0.2),
      nn.Linear(hidden_dim, out_classes)
    )

  def forward(self, x):
    return self.network(x)`,
    practice:
      "Write a custom PyTorch training loop that computes CrossEntropyLoss, performs zero_grad(), loss.backward(), and optimizer.step() over 5 epochs.",
    resources: {
      websites: [
        { title: "Fast.ai — Practical Deep Learning", url: "https://course.fast.ai/", description: "Top-down, practical deep learning course" },
        { title: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", description: "Official PyTorch guides with notebooks" },
        { title: "The Annotated Transformer", url: "https://nlp.seas.harvard.edu/annotated-transformer/", description: "Line-by-line walkthrough of the Transformer paper" },
      ],
      youtube: [
        { title: "Neural Networks: Zero to Hero", channel: "Andrej Karpathy", url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", duration: "Series" },
        { title: "Deep Learning Fundamentals", channel: "3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", duration: "Series" },
      ],
    },
  },
  dataproc: {
    skillId: "dataproc",
    title: "Data Processing & Feature Pipelines",
    explanation:
      "Data preprocessing transforms raw, noisy, incomplete real-world datasets into standardized numerical matrices suitable for statistical modeling and machine learning.",
    objectives: [
      "Diagnose and impute missing values using mean, median, or iterative imputation techniques",
      "Scale numerical features using StandardScaler and RobustScaler to preserve variance",
      "Encode categorical variables with one-hot, ordinal, and target encoding safely without target leakage",
    ],
    example: `from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder

preprocessor = ColumnTransformer(transformers=[
  ('num', StandardScaler(), ['age', 'income', 'credit_score']),
  ('cat', OneHotEncoder(handle_unknown='ignore'), ['occupation', 'country'])
])`,
    practice:
      "Construct a preprocessing pipeline in Python that scales numerical features, encodes categories, and replaces outliers beyond 3 standard deviations with boundary values.",
    resources: {
      websites: [
        { title: "Scikit-learn Preprocessing Guide", url: "https://scikit-learn.org/stable/modules/preprocessing.html", description: "All standard preprocessing transformers" },
        { title: "Kaggle Learn — Feature Engineering", url: "https://www.kaggle.com/learn/feature-engineering", description: "Hands-on notebooks with datasets" },
        { title: "Feature Store for ML — Feast Docs", url: "https://docs.feast.dev/", description: "Production feature pipeline architecture" },
      ],
      youtube: [
        { title: "Feature Engineering for Machine Learning", channel: "Krish Naik", url: "https://www.youtube.com/watch?v=6WDFfaYtN6s", duration: "45 min" },
        { title: "Data Cleaning with Pandas", channel: "Data School", url: "https://www.youtube.com/watch?v=iYie42M1ZyU", duration: "30 min" },
      ],
    },
  },
  statistics: {
    skillId: "statistics",
    title: "Inferential Statistics & Hypothesis Testing",
    explanation:
      "Statistics provides mathematical methods for quantifying uncertainty, testing hypotheses, and drawing confident conclusions about populations from limited sample data.",
    objectives: [
      "Formulate null and alternative hypotheses and determine appropriate test statistics (t-test, ANOVA, Chi-Square)",
      "Interpret p-values, significance levels (alpha), and statistical power correctly",
      "Construct and interpret 95% confidence intervals for population means and proportions",
    ],
    example: `from scipy import stats

group_control = [23.4, 25.1, 22.8, 24.5, 23.9]
group_variant = [26.2, 27.8, 25.9, 26.5, 27.1]

t_stat, p_val = stats.ttest_ind(group_control, group_variant)
print(f"t-statistic: {t_stat:.3f}, p-value: {p_val:.4f}")
if p_val < 0.05:
  print("Statistically significant difference detected (reject H0)")`,
    practice:
      "Design an A/B test plan for an e-commerce checkout page: state the primary metric, define H0 and H1, and explain how you would detect and avoid peeking bias.",
    resources: {
      websites: [
        { title: "StatTrek — Statistics Tutorial", url: "https://stattrek.com/tutorials/statistics-tutorial", description: "Clear explanations of inferential stats" },
        { title: "Seeing Theory — Visual Stats", url: "https://seeing-theory.brown.edu/", description: "Beautiful interactive probability & statistics" },
        { title: "Evan Miller's A/B Testing Tools", url: "https://www.evanmiller.org/ab-testing/", description: "Practical A/B test calculators & guides" },
      ],
      youtube: [
        { title: "Statistics — A Full University Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=xxpc-HPKN28", duration: "8 hr" },
        { title: "Hypothesis Testing Explained", channel: "StatQuest with Josh Starmer", url: "https://www.youtube.com/watch?v=0oc49DyA3hU", duration: "20 min" },
      ],
    },
  },
  dataanalysis: {
    skillId: "dataanalysis",
    title: "Exploratory Data Analysis & Business Insights",
    explanation:
      "Exploratory Data Analysis (EDA) is the practice of investigating datasets to understand their underlying structure, detect anomalies, test hypotheses, and verify assumptions using summary statistics and graphical representations.",
    objectives: [
      "Perform systematic univariate and bivariate distributions analysis",
      "Identify patterns, correlations, and causal indicators across variables",
      "Translate quantitative findings into strategic, actionable business recommendations",
    ],
    example: `import pandas as pd

df = pd.read_csv('user_activity.csv')
print("Missing values per column:\\n", df.isnull().sum())
print("\\nDescriptive statistics:\\n", df.describe())
correlation_matrix = df.corr(numeric_only=True)
print("\\nCorrelations with retention:\\n", correlation_matrix['retained'].sort_values(ascending=False))`,
    practice:
      "Given a dataset of user churn, conduct an exploratory analysis identifying the top three behavioral indicators that separate churned users from active retained users.",
    resources: {
      websites: [
        { title: "Kaggle Learn — Pandas", url: "https://www.kaggle.com/learn/pandas", description: "Hands-on Pandas with real datasets" },
        { title: "Towards Data Science — EDA Guide", url: "https://towardsdatascience.com/exploratory-data-analysis-8fc1cb20fd15", description: "Practitioner walkthrough with charts" },
        { title: "Our World in Data", url: "https://ourworldindata.org/", description: "Real-world data storytelling examples" },
      ],
      youtube: [
        { title: "Exploratory Data Analysis with Python & Pandas", channel: "Keith Galli", url: "https://www.youtube.com/watch?v=vmEHCJofslg", duration: "2 hr" },
        { title: "Data Analysis with Python — Full Course", channel: "freeCodeCamp", url: "https://www.youtube.com/watch?v=r-uOLxNrNk8", duration: "4 hr" },
      ],
    },
  },
  dataviz: {
    skillId: "dataviz",
    title: "Data Visualization & Executive Dashboards",
    explanation:
      "Data visualization turns quantitative metrics into visual representations. Effective visualization follows perceptual psychology principles to communicate insights with clarity and impact.",
    objectives: [
      "Select the right chart type for your data relationship (trends, proportions, distributions, relationships)",
      "Apply effective color palettes, visual hierarchies, and clear typography without clutter",
      "Build interactive dashboards with filtering, tooltips, and drill-down capabilities using Plotly",
    ],
    example: `import plotly.express as px

fig = px.scatter(
  df, x='marketing_spend', y='revenue',
  color='region', size='roi', hover_name='campaign_name',
  title='Campaign Revenue vs Marketing Spend by Region'
)
fig.update_layout(template='plotly_white')
fig.show()`,
    practice:
      "Create a multi-panel visual dashboard displaying monthly recurring revenue (MRR) growth, customer acquisition cost (CAC) trends, and cohort retention rates.",
    resources: {
      websites: [
        { title: "Plotly Python Documentation", url: "https://plotly.com/python/", description: "Interactive charts with Python examples" },
        { title: "Data Visualization Society", url: "https://www.datavisualizationsociety.org/", description: "Best practices, articles, and community" },
        { title: "Datawrapper — Chart Tools", url: "https://www.datawrapper.de/", description: "Build charts without code, learn design principles" },
      ],
      youtube: [
        { title: "Data Visualization with Python & Plotly", channel: "Charming Data", url: "https://www.youtube.com/watch?v=_b2KXL0wHQg", duration: "1 hr" },
        { title: "How to Think Visually", channel: "Mark Manson", url: "https://www.youtube.com/watch?v=R-sVnmmw6WY", duration: "15 min" },
      ],
    },
  },
};

export const getTopicBySkill = (skillId) => learningTopics[skillId] || null;
