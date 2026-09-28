// Simplified, beginner & intermediate friendly phased roadmaps for each target career.
// Plain-English milestones, practical guidance, and real-world project deliverables.

export const careerRoadmaps = {
  fullstack: {
    careerId: "fullstack",
    title: "Full-Stack Developer",
    subtitle: "Learn to build complete web applications from visual frontend to backend servers and databases.",
    tagline: "Build apps people can use: from what users see and click on screen, to the server and database that stores their data.",
    badge: "Beginner Friendly",
    colorTheme: "teal",
    accentGradient: "from-teal-600 via-teal-700 to-emerald-800",
    glowColor: "rgba(47, 132, 120, 0.15)",
    bannerBg: "bg-gradient-to-br from-teal-50 via-white to-amber-50/40",
    borderAccent: "border-teal-200",
    pillBadge: "bg-teal-50 text-teal-800 border-teal-200",
    duration: "24 Weeks",
    weeklyEffort: "10–12 hrs/week",
    difficulty: "Beginner to Intermediate",
    prerequisites: "Zero coding experience required — starts with web basics",
    targetReadiness: "85%",
    overview:
      "A friendly, step-by-step roadmap for beginners and intermediate learners. You will start with basic web page building and gradually learn to create full apps with user accounts, databases, and live deployment.",
    highlights: [
      { label: "Core Skills", value: "7 Practical Skills" },
      { label: "Learning Stages", value: "4 Simple Phases" },
      { label: "Hands-on Projects", value: "4 Portfolio Apps" },
      { label: "Prerequisites", value: "None (Starts from zero)" },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Web Basics: HTML, CSS & Git",
        duration: "Weeks 1–5",
        level: "Level 1 • Beginner",
        levelBadge: "Beginner",
        summary:
          "Start your journey by learning how web pages are built. You'll structure pages with HTML, make them look great on mobile and desktop with CSS/Tailwind, and save your work using Git.",
        skills: [
          {
            skillId: "html",
            name: "HTML",
            targetScore: 80,
            category: "frontend",
            simpleExplanation: "The skeleton of any website (headings, text, buttons, links, and forms).",
          },
          {
            skillId: "css",
            name: "CSS",
            targetScore: 80,
            category: "frontend",
            simpleExplanation: "Makes your site look good (colors, spacing, mobile responsiveness, and layout).",
          },
          {
            skillId: "git",
            name: "Git",
            targetScore: 65,
            category: "tools",
            simpleExplanation: "A time machine for your code that saves versions and lets you work safely.",
          },
        ],
        keyTopics: [
          "Building web pages with HTML tags: headings, paragraphs, images, links & forms",
          "Styling with CSS: colors, fonts, margins, padding, and Flexbox for easy alignment",
          "Making layouts responsive so they look great on both phones and laptops",
          "Utility styling made fast and simple with Tailwind CSS",
          "Saving your code history with Git and uploading to GitHub",
        ],
        milestoneProject: {
          title: "Personal Portfolio & Interactive Portal",
          type: "Beginner Project",
          description:
            "Create your own personal website that showcases your background, learning journey, and links to your upcoming projects.",
          deliverables: [
            "Clean, responsive web page that looks great on mobile and desktop",
            "Working contact form with proper inputs",
            "Published online to GitHub Pages for free",
          ],
        },
      },
      {
        phaseNumber: 2,
        phaseTitle: "Interactive Code: JavaScript & React",
        duration: "Weeks 6–12",
        level: "Level 2 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "Make your web pages interactive! Learn JavaScript so buttons do things when clicked, data can be fetched from APIs, and components can be reused cleanly using React.",
        skills: [
          {
            skillId: "javascript",
            name: "JavaScript",
            targetScore: 85,
            category: "language",
            simpleExplanation: "The brain of the browser: lets you calculate things, react to clicks, and fetch live data.",
          },
          {
            skillId: "react",
            name: "React",
            targetScore: 80,
            category: "frontend",
            simpleExplanation: "A popular tool for building fast, modern interactive apps out of reusable pieces.",
          },
        ],
        keyTopics: [
          "JavaScript basics: variables, if/else statements, loops, functions, and arrays",
          "Working with objects and lists of data (mapping, filtering, finding)",
          "Fetching live data from free web APIs (like weather or movie databases)",
          "React fundamentals: components, props (passing data), and useState (remembering data)",
          "Handling user inputs, search filters, and smooth button clicks",
        ],
        milestoneProject: {
          title: "Interactive Task & Habit Tracker App",
          type: "Intermediate Project",
          description:
            "Build an interactive web app where users can add tasks, filter by category, mark items complete, and have their progress saved automatically.",
          deliverables: [
            "Reusable React components for tasks, categories, and progress bars",
            "Data saved automatically in browser localStorage so it stays upon refresh",
            "Instant search and status filtering (All, Active, Completed)",
          ],
        },
      },
      {
        phaseNumber: 3,
        phaseTitle: "Backend & Databases: Node.js & SQL",
        duration: "Weeks 13–18",
        level: "Level 3 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "Now look behind the scenes. Learn how servers listen to web requests, store information in databases using SQL, and securely log users in with passwords.",
        skills: [
          {
            skillId: "nodejs",
            name: "Node.js",
            targetScore: 75,
            category: "backend",
            simpleExplanation: "Lets you run JavaScript on the computer/server to create APIs and process requests.",
          },
          {
            skillId: "sql",
            name: "SQL",
            targetScore: 70,
            category: "data",
            simpleExplanation: "The standard language used to talk to databases and find or save customer records.",
          },
        ],
        keyTopics: [
          "What is an API? Creating simple endpoints with Node.js and Express",
          "Understanding JSON: how frontends and backends send messages to each other",
          "Databases 101: creating tables, storing users, products, and comments",
          "Writing SQL queries: SELECT, INSERT, UPDATE, DELETE, and connecting tables with JOIN",
          "User login: encrypting passwords safely so accounts stay secure",
        ],
        milestoneProject: {
          title: "Mini Store Backend & User Accounts API",
          type: "Backend Project",
          description:
            "Build a server with routes for user signup/login, product browsing, and placing orders saved in a real SQL database.",
          deliverables: [
            "Working API endpoints that return clean JSON data",
            "SQL database with tables for Users, Products, and Orders",
            "Tested and documented with Postman or a simple web test page",
          ],
        },
      },
      {
        phaseNumber: 4,
        phaseTitle: "Putting It All Together: Full-Stack Capstone",
        duration: "Weeks 19–24",
        level: "Level 4 • Project Ready",
        levelBadge: "Capstone",
        summary:
          "Connect your React frontend with your Node.js backend and database. Deploy the finished app live to the internet so anyone in the world can open and try it.",
        skills: [
          {
            skillId: "react",
            name: "React",
            targetScore: 80,
            category: "frontend",
            simpleExplanation: "Connecting your interactive UI with your real live server.",
          },
          {
            skillId: "nodejs",
            name: "Node.js",
            targetScore: 75,
            category: "backend",
            simpleExplanation: "Handling incoming client requests and sending back live data.",
          },
          {
            skillId: "sql",
            name: "SQL",
            targetScore: 70,
            category: "data",
            simpleExplanation: "Managing your application's permanent data securely.",
          },
          {
            skillId: "git",
            name: "Git",
            targetScore: 65,
            category: "tools",
            simpleExplanation: "Publishing code to deployment hosts like Render, Vercel, or Netlify.",
          },
        ],
        keyTopics: [
          "Full-stack workflow: connecting React frontend fetch calls to your Node server",
          "Managing user login sessions so users stay logged in across page reloads",
          "Deploying your frontend and backend to free hosting providers (e.g. Vercel, Render)",
          "Fixing common errors: CORS permissions, environment variables, and loading states",
          "Polishing your code for your resume and portfolio",
        ],
        milestoneProject: {
          title: "Full-Stack Project Collaboration App",
          type: "Capstone Project",
          description:
            "A complete web application where users can create accounts, start projects, leave comments, and see live updates.",
          deliverables: [
            "Live website URL you can put on your resume",
            "Full React frontend connected to a live Node.js and SQL database backend",
            "Clean GitHub repository with a clear README and setup instructions",
          ],
        },
      },
    ],
  },

  aiml: {
    careerId: "aiml",
    title: "AI / ML Engineer",
    subtitle: "Learn how computers learn from data, make predictions, and power intelligent tools.",
    tagline: "Teach computers to recognize patterns, predict outcomes, and automate decisions using data.",
    badge: "Fast Growing",
    colorTheme: "amber",
    accentGradient: "from-amber-600 via-amber-700 to-orange-800",
    glowColor: "rgba(232, 149, 42, 0.15)",
    bannerBg: "bg-gradient-to-br from-amber-50 via-white to-teal-50/40",
    borderAccent: "border-amber-300",
    pillBadge: "bg-amber-50 text-amber-900 border-amber-200",
    duration: "26 Weeks",
    weeklyEffort: "12–14 hrs/week",
    difficulty: "Beginner to Intermediate",
    prerequisites: "Basic high school math (algebra) and eagerness to learn Python",
    targetReadiness: "80%",
    overview:
      "Designed to demystify artificial intelligence. You'll start with friendly Python programming, learn how numbers and data train models, and build smart systems step-by-step.",
    highlights: [
      { label: "Core Skills", value: "6 Practical Skills" },
      { label: "Learning Stages", value: "4 Simple Phases" },
      { label: "Hands-on Projects", value: "4 Smart AI Systems" },
      { label: "Prerequisites", value: "High school math & curiosity" },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Python Basics & Math Intuition",
        duration: "Weeks 1–6",
        level: "Level 1 • Beginner",
        levelBadge: "Beginner",
        summary:
          "Start with Python, the friendliest and most popular language in AI. Build intuitive understanding of the core math (like slopes and grids of numbers) without boring theory.",
        skills: [
          {
            skillId: "python",
            name: "Python",
            targetScore: 85,
            category: "language",
            simpleExplanation: "The readable programming language used everywhere in data science and AI.",
          },
          {
            skillId: "math",
            name: "Mathematics",
            targetScore: 75,
            category: "data",
            simpleExplanation: "Basic math concepts: lists of numbers (vectors) and how models improve step-by-step.",
          },
        ],
        keyTopics: [
          "Python fundamentals: variables, lists, dictionaries, loops, and functions",
          "Working with numbers using the NumPy library (fast math on lists)",
          "Intuition for vectors and grids: thinking about data as points on a graph",
          "Understanding how an algorithm learns by nudging numbers toward lower error",
          "Writing clean, readable scripts and small automated calculators",
        ],
        milestoneProject: {
          title: "Smart Number Predictor & Vector Calculator",
          type: "Beginner Project",
          description:
            "Build a Python program that takes real numbers (like house sizes) and calculates predictions using simple math without complex libraries.",
          deliverables: [
            "Clean Python script with comments explaining how the prediction works",
            "Clear terminal output showing calculations step-by-step",
            "A test with sample data showing accurate predictions",
          ],
        },
      },
      {
        phaseNumber: 2,
        phaseTitle: "Working with Data: Pandas & SQL",
        duration: "Weeks 7–12",
        level: "Level 2 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "Real-world data is messy! Learn how to clean spreadsheets, fill in missing values, pull records from databases with SQL, and prepare clean tables for AI models.",
        skills: [
          {
            skillId: "sql",
            name: "SQL",
            targetScore: 65,
            category: "data",
            simpleExplanation: "Querying tables to find and extract the exact information your model needs.",
          },
          {
            skillId: "dataproc",
            name: "Data Processing",
            targetScore: 70,
            category: "data",
            simpleExplanation: "Cleaning messy data, fixing missing numbers, and organizing tables for modeling.",
          },
        ],
        keyTopics: [
          "Loading and exploring CSVs and datasets using Python Pandas",
          "Fixing missing values and removing duplicate rows",
          "Pulling subsets of data with SQL: filtering, sorting, and joining tables",
          "Turning text labels (like 'small', 'medium', 'large') into numbers models understand",
          "Splitting data into a training set (to learn from) and a test set (to test on)",
        ],
        milestoneProject: {
          title: "Clean Data Pipeline for Real-World Records",
          type: "Data Project",
          description:
            "Take a messy dataset with missing values and bad formatting, clean it automatically with Python, and output a clean table ready for ML.",
          deliverables: [
            "Reusable Python script that cleans data automatically",
            "Summary report showing how many errors and missing rows were fixed",
            "Clean export file ready to be loaded by machine learning models",
          ],
        },
      },
      {
        phaseNumber: 3,
        phaseTitle: "Machine Learning: Training Smart Models",
        duration: "Weeks 13–19",
        level: "Level 3 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "Train your first machine learning models using Scikit-Learn! Teach models to classify items (like spam vs normal email) or predict quantities (like prices).",
        skills: [
          {
            skillId: "ml",
            name: "Machine Learning",
            targetScore: 80,
            category: "data",
            simpleExplanation: "Using algorithms to spot patterns in past data and predict future outcomes.",
          },
          {
            skillId: "python",
            name: "Python",
            targetScore: 85,
            category: "language",
            simpleExplanation: "Writing the code that trains models and evaluates their accuracy.",
          },
        ],
        keyTopics: [
          "Classification vs Regression: categorizing items vs predicting numerical amounts",
          "Popular algorithms made simple: Decision Trees, Random Forests, and Linear Models",
          "Checking if your model is good: Accuracy, Precision, and Recall explained simply",
          "Preventing the model from 'memorizing' data (overfitting)",
          "Tuning model settings to get the highest possible test score",
        ],
        milestoneProject: {
          title: "Customer Prediction & Classification Engine",
          type: "ML Project",
          description:
            "Train an ML model that looks at customer behavior and accurately predicts whether someone is likely to renew their membership or cancel.",
          deliverables: [
            "Trained model with over 80% test accuracy",
            "Explanation of which factors (like frequency of visits) matter most",
            "Easy-to-use function where you input customer details and get a prediction",
          ],
        },
      },
      {
        phaseNumber: 4,
        phaseTitle: "Neural Networks & Modern AI Capstone",
        duration: "Weeks 20–26",
        level: "Level 4 • Project Ready",
        levelBadge: "Capstone",
        summary:
          "Explore deep learning and neural networks using PyTorch. Learn how modern AI (like ChatGPT and image recognition) works and build an intelligent assistant.",
        skills: [
          {
            skillId: "dl",
            name: "Deep Learning",
            targetScore: 70,
            category: "data",
            simpleExplanation: "Multi-layer networks inspired by the brain that learn complex patterns like text and images.",
          },
          {
            skillId: "ml",
            name: "Machine Learning",
            targetScore: 80,
            category: "data",
            simpleExplanation: "Evaluating and fine-tuning predictions to minimize mistakes.",
          },
          {
            skillId: "python",
            name: "Python",
            targetScore: 85,
            category: "language",
            simpleExplanation: "Connecting your trained AI model to a working interactive demo.",
          },
        ],
        keyTopics: [
          "Neural network basics: inputs, weights, layers, and how loss decreases during training",
          "Introduction to PyTorch: building a simple neural network step-by-step",
          "How text AI works: word embeddings and language models in plain English",
          "Retrieval-Augmented Generation (RAG): letting an AI read your custom documents to answer questions",
          "Turning your AI into a simple web demo you can share with friends and recruiters",
        ],
        milestoneProject: {
          title: "Custom Document AI Question-Answering Assistant",
          type: "Capstone Project",
          description:
            "Build an interactive assistant that reads a collection of notes or PDFs and accurately answers questions based on that content.",
          deliverables: [
            "Working Python assistant that answers questions from documents",
            "Web interface or notebook demo where anyone can ask questions",
            "Documented portfolio piece with code on GitHub",
          ],
        },
      },
    ],
  },

  datascience: {
    careerId: "datascience",
    title: "Data Scientist",
    subtitle: "Learn to analyze numbers, find hidden insights, and create visual stories that help businesses make decisions.",
    tagline: "Turn messy information into clear charts, answers, and strategic decisions that solve real problems.",
    badge: "Great for Analysts",
    colorTheme: "teal",
    accentGradient: "from-cyan-700 via-teal-800 to-slate-900",
    glowColor: "rgba(15, 118, 110, 0.15)",
    bannerBg: "bg-gradient-to-br from-cyan-50 via-white to-amber-50/30",
    borderAccent: "border-cyan-200",
    pillBadge: "bg-cyan-50 text-cyan-800 border-cyan-200",
    duration: "22 Weeks",
    weeklyEffort: "10–12 hrs/week",
    difficulty: "Beginner to Intermediate",
    prerequisites: "Comfortable with spreadsheets or basic math; zero coding required",
    targetReadiness: "80%",
    overview:
      "A practical track tailored for curious minds. You'll learn to ask smart questions from data, uncover trends with Python and SQL, and present your findings in compelling visual dashboards.",
    highlights: [
      { label: "Core Skills", value: "6 Practical Skills" },
      { label: "Learning Stages", value: "4 Simple Phases" },
      { label: "Hands-on Projects", value: "4 Real Case Studies" },
      { label: "Prerequisites", value: "Basic spreadsheet curiosity" },
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseTitle: "Python for Data & Everyday Statistics",
        duration: "Weeks 1–5",
        level: "Level 1 • Beginner",
        levelBadge: "Beginner",
        summary:
          "Learn practical Python basics alongside everyday statistics. Understand averages, spreads, and how to verify if a pattern is real or just random luck.",
        skills: [
          {
            skillId: "python",
            name: "Python",
            targetScore: 80,
            category: "language",
            simpleExplanation: "Your calculator and tool to load, slice, and filter datasets easily.",
          },
          {
            skillId: "statistics",
            name: "Statistics",
            targetScore: 80,
            category: "data",
            simpleExplanation: "Tools to summarize numbers: averages, ranges, and probability.",
          },
        ],
        keyTopics: [
          "Python basics for analysts: variables, lists, dictionaries, and simple calculations",
          "Understanding averages (Mean vs Median) and when each one is best to use",
          "Understanding variation: standard deviation and bell curves in simple terms",
          "Formulating simple hypotheses (e.g. 'Did change A really improve sales?')",
          "Confidence intervals: communicating uncertainty honestly",
        ],
        milestoneProject: {
          title: "Real-World Data Discovery & Statistical Report",
          type: "Beginner Project",
          description:
            "Analyze a real dataset (like student test scores or movie ratings) to find key patterns, summarize statistics, and explain findings in plain language.",
          deliverables: [
            "Clean Python notebook showing calculations and charts",
            "One-page plain-English summary of what the data shows",
            "Clear answers to 3 interesting questions about the dataset",
          ],
        },
      },
      {
        phaseNumber: 2,
        phaseTitle: "Data Extraction: SQL & Data Wrangling",
        duration: "Weeks 6–10",
        level: "Level 2 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "Databases power every business. Learn how to write SQL queries to pull data from large company tables, group totals, and clean up messy records in Pandas.",
        skills: [
          {
            skillId: "sql",
            name: "SQL",
            targetScore: 75,
            category: "data",
            simpleExplanation: "The must-have skill to pull rows and calculate totals from business databases.",
          },
          {
            skillId: "dataanalysis",
            name: "Data Analysis",
            targetScore: 80,
            category: "data",
            simpleExplanation: "Inspecting, cleaning, and transforming data to answer business questions.",
          },
        ],
        keyTopics: [
          "SQL basics: SELECT, WHERE, ORDER BY, and LIMIT",
          "Combining information from multiple tables using INNER and LEFT JOINs",
          "Summarizing metrics: COUNT, SUM, AVG, and GROUP BY",
          "Cleaning dates, handling null values, and renaming columns in Pandas",
          "User retention: calculating how many users come back month after month",
        ],
        milestoneProject: {
          title: "Business Customer & Sales Analysis Query Suite",
          type: "Data Project",
          description:
            "Write SQL queries against an e-commerce database to identify top-spending customers, best-selling categories, and monthly revenue trends.",
          deliverables: [
            "Set of clean, commented SQL queries answering core business questions",
            "Monthly revenue and customer count summary table",
            "Documented insights on which products sell best together",
          ],
        },
      },
      {
        phaseNumber: 3,
        phaseTitle: "Visual Dashboards & Clear Storytelling",
        duration: "Weeks 11–16",
        level: "Level 3 • Intermediate",
        levelBadge: "Intermediate",
        summary:
          "A good chart is worth a thousand numbers. Learn how to pick the right chart, avoid visual clutter, and build interactive dashboards that impress managers.",
        skills: [
          {
            skillId: "dataviz",
            name: "Data Visualization",
            targetScore: 70,
            category: "data",
            simpleExplanation: "Creating clear, honest, and beautiful charts that make trends jump off the screen.",
          },
          {
            skillId: "dataanalysis",
            name: "Data Analysis",
            targetScore: 80,
            category: "data",
            simpleExplanation: "Synthesizing findings into 3 key takeaways for decision makers.",
          },
        ],
        keyTopics: [
          "Choosing the right chart: bar charts for categories, line charts for time, scatter for relationships",
          "Creating clean visualizations using Seaborn and Matplotlib in Python",
          "Building interactive charts with Plotly (hover tooltips, zoom, and filters)",
          "Data storytelling: how to organize a presentation so leaders take action",
          "Avoiding deceptive charts (like truncated axes or confusing pie charts)",
        ],
        milestoneProject: {
          title: "Interactive Executive Trends Dashboard",
          type: "Visual Dashboard",
          description:
            "Build an interactive web dashboard where managers can click filters, examine key metrics, and see visual trends over time.",
          deliverables: [
            "Interactive dashboard with filters and hover cards",
            "3 clear recommendations based on the visual trends",
            "Slide deck or shareable web link suitable for presentations",
          ],
        },
      },
      {
        phaseNumber: 4,
        phaseTitle: "Predictive Models & Real Case Study Capstone",
        duration: "Weeks 17–22",
        level: "Level 4 • Project Ready",
        levelBadge: "Capstone",
        summary:
          "Combine your data, statistics, and modeling skills into a portfolio-defining capstone. Build a predictive model and explain its business value clearly.",
        skills: [
          {
            skillId: "ml",
            name: "Machine Learning",
            targetScore: 70,
            category: "data",
            simpleExplanation: "Training algorithms to forecast numbers and categorize outcomes.",
          },
          {
            skillId: "statistics",
            name: "Statistics",
            targetScore: 80,
            category: "data",
            simpleExplanation: "A/B testing and verifying whether model improvements are real.",
          },
          {
            skillId: "python",
            name: "Python",
            targetScore: 80,
            category: "language",
            simpleExplanation: "Tying your analysis and prediction model together in a clean project.",
          },
        ],
        keyTopics: [
          "Predicting business outcomes (like customer churn or house prices) with models",
          "A/B Testing basics: how tech companies test new features scientifically",
          "Explaining 'Why': identifying which features influenced the prediction most",
          "Communicating technical results simply to non-technical stakeholders",
          "Packaging your project into a compelling portfolio case study",
        ],
        milestoneProject: {
          title: "Customer Churn Prediction & Business Action Plan",
          type: "Capstone Project",
          description:
            "A full data science case study that analyzes customer churn, trains a model to flag at-risk accounts, and calculates how much revenue can be saved.",
          deliverables: [
            "Complete data analysis notebook with clear markdown explanations",
            "Trained prediction model identifying top risk factors",
            "Executive summary with actionable business steps to retain customers",
          ],
        },
      },
    ],
  },
};

export const getCareerRoadmap = (careerId) => {
  return careerRoadmaps[careerId] || careerRoadmaps.fullstack;
};

export const getAllCareerRoadmaps = () => Object.values(careerRoadmaps);
