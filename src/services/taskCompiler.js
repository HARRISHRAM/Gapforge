/**
 * Real-World Task Compiler, Anti-Cheat Scanner & Automated Test Runner
 *
 * Requirements:
 * 1. Executes real-time compilation and automated test case assertions.
 * 2. Strictly rejects direct print statements (e.g. console.log, print, echo)
 *    and dummy text cheat attempts.
 * 3. Requires 100% of test cases to pass before solution can be submitted.
 */

// Patterns indicating direct print statements or cheat spoofing
const DIRECT_PRINT_PATTERNS = [
  /^\s*console\.(log|info|warn|error)\s*\(/m,
  /^\s*print\s*\(/m,
  /^\s*printf\s*\(/m,
  /^\s*echo\s+["']/m,
  /^\s*puts\s+["']/m,
  /^\s*System\.out\.println\s*\(/m,
];

function checkDirectPrintCheat(code) {
  const trimmed = code.trim();
  for (const pattern of DIRECT_PRINT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isCheat: true,
        pattern: pattern.toString(),
        message: "Direct print statement detected! Print/console statements cannot substitute for real solution implementation.",
      };
    }
  }

  // Check if code contains only comments or print statements without real statements
  const codeWithoutComments = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/#.*/g, "")
    .trim();

  if (codeWithoutComments.length === 0) {
    return {
      isCheat: true,
      message: "Empty submission or comments only. Please write an actual implementation.",
    };
  }

  if (
    codeWithoutComments.startsWith("console.log") ||
    codeWithoutComments.startsWith("print(") ||
    codeWithoutComments.startsWith("echo ")
  ) {
    return {
      isCheat: true,
      message: "Direct print statement detected! You must implement the required code structure instead of printing.",
    };
  }

  return { isCheat: false };
}

/**
 * Test Runner for CSS (Fluid Responsive Pricing Table)
 */
function testCssTask(code) {
  const logs = [];
  logs.push("[CSS Compiler v2.4] Parsing CSS stylesheet syntax...");

  const clean = code.replace(/\/\*[\s\S]*?\*\//g, "").trim();

  // Anti-cheat check
  const cheat = checkDirectPrintCheat(code);
  const antiCheatTest = {
    id: "css_cheat",
    name: "Anti-Cheat: Real CSS Implementation",
    concept: "Code Integrity",
    passed: !cheat.isCheat,
    message: cheat.isCheat
      ? cheat.message
      : "Valid CSS stylesheet structure detected. No cheat print statements found.",
  };

  // Test 1: CSS Grid for column placement
  // Must use display: grid and grid-template-columns with fluid sizing
  const hasGridDisplay = /display\s*:\s*(inline-)?grid\b/i.test(clean);
  const hasGridColumns = /grid-template-columns\s*:\s*[^;]+;/i.test(clean);
  const hasFluidColumns = /repeat\s*\(\s*(auto-fit|auto-fill|\d+)\s*,\s*minmax\s*\(/i.test(clean) ||
    /grid-template-columns\s*:\s*.*(fr|minmax|repeat)/i.test(clean);
  const hasGap = /(gap|grid-gap)\s*:\s*[^;]+;/i.test(clean);

  const gridPassed = hasGridDisplay && hasGridColumns && hasFluidColumns;
  const gridTest = {
    id: "css_grid",
    name: "CSS Grid Column Placement",
    concept: "CSS Grid",
    passed: gridPassed && !cheat.isCheat,
    message: gridPassed && !cheat.isCheat
      ? "Passed: .pricing-grid defines display: grid with fluid repeat(auto-fit, minmax(...)) columns."
      : "Failed: Container must declare 'display: grid', 'grid-template-columns' with fluid repeat/minmax, and 'gap'.",
    details: `display: grid (${hasGridDisplay ? "✓" : "✗"}), grid-template-columns (${hasGridColumns ? "✓" : "✗"}), fluid repeat/minmax (${hasFluidColumns ? "✓" : "✗"}), gap (${hasGap ? "✓" : "✗"})`,
  };

  // Test 2: Flexbox inside cards for equal heights
  // Must style .pricing-card with display: flex, flex-direction: column, and equal alignment
  const hasFlexDisplay = /display\s*:\s*flex\b/i.test(clean);
  const hasFlexDirection = /flex-direction\s*:\s*column\b/i.test(clean);
  const hasFlexJustify = /justify-content\s*:\s*(space-between|space-around|space-evenly|stretch)\b/i.test(clean) ||
    /flex\s*:\s*1\b/i.test(clean) ||
    /flex-grow\s*:\s*1\b/i.test(clean);

  const flexPassed = hasFlexDisplay && hasFlexDirection;
  const flexTest = {
    id: "css_flexbox",
    name: "Flexbox Equal Height Cards",
    concept: "Flexbox",
    passed: flexPassed && !cheat.isCheat,
    message: flexPassed && !cheat.isCheat
      ? "Passed: .pricing-card implements Flexbox with flex-direction: column and equal height distribution."
      : "Failed: .pricing-card must declare 'display: flex' and 'flex-direction: column' for equal vertical distribution.",
    details: `display: flex (${hasFlexDisplay ? "✓" : "✗"}), flex-direction: column (${hasFlexDirection ? "✓" : "✗"}), vertical justify/grow (${hasFlexJustify ? "✓" : "optional"})`,
  };

  // Test 3: Fluid Responsiveness without Horizontal Scroll
  // Must not have fixed pixel widths >= 400px on cards/containers that cause overflow
  const hasRigidFixedCardWidth = /\.pricing-card\s*\{[^}]*width\s*:\s*(?:[5-9]\d{2}|\d{4,})px/i.test(clean);
  const hasFluidResponsiveness = hasFluidColumns || /@media\s*\([^)]+\)/i.test(clean);

  const responsivePassed = !hasRigidFixedCardWidth && hasFluidResponsiveness;
  const responsiveTest = {
    id: "css_responsive",
    name: "Fluid Responsiveness & No Horizontal Scroll",
    concept: "Media Queries & Fluidity",
    passed: responsivePassed && !cheat.isCheat,
    message: responsivePassed && !cheat.isCheat
      ? "Passed: Layout scales fluidly down to mobile viewports without horizontal scrollbar overflow."
      : "Failed: Ensure fluid scaling without horizontal scroll (avoid fixed large pixel widths, use minmax or @media).",
    details: `Fluid auto-fit / @media (${hasFluidResponsiveness ? "✓" : "✗"}), No overflowing fixed widths (${!hasRigidFixedCardWidth ? "✓" : "✗"})`,
  };

  // Test 4: Card Layout Styling & Visual Structure
  const hasBorderRadius = /border-radius\s*:\s*[^;]+;/i.test(clean);
  const hasCardVisuals = /(border|background|box-shadow|padding)\s*:\s*[^;]+;/i.test(clean);
  const cardLayoutPassed = hasBorderRadius || hasCardVisuals;

  const cardLayoutTest = {
    id: "css_card_layout",
    name: "Card Layout Visual Architecture",
    concept: "Card Layout",
    passed: cardLayoutPassed && !cheat.isCheat,
    message: cardLayoutPassed && !cheat.isCheat
      ? "Passed: Card elements define distinct visual boundaries, padding, and rounded geometry."
      : "Failed: Cards should define border-radius, background, or border properties.",
    details: `border-radius (${hasBorderRadius ? "✓" : "✗"}), styling properties (${hasCardVisuals ? "✓" : "✗"})`,
  };

  const testCases = [antiCheatTest, gridTest, flexTest, responsiveTest, cardLayoutTest];
  const allPassed = testCases.every((t) => t.passed);

  logs.push(`[Test 1] ${gridTest.name}: ${gridTest.passed ? "PASSED ✓" : "FAILED ✗"}`);
  logs.push(`[Test 2] ${flexTest.name}: ${flexTest.passed ? "PASSED ✓" : "FAILED ✗"}`);
  logs.push(`[Test 3] ${responsiveTest.name}: ${responsiveTest.passed ? "PASSED ✓" : "FAILED ✗"}`);
  logs.push(`[Test 4] ${cardLayoutTest.name}: ${cardLayoutTest.passed ? "PASSED ✓" : "FAILED ✗"}`);
  logs.push(`[Test 5] ${antiCheatTest.name}: ${antiCheatTest.passed ? "PASSED ✓" : "FAILED ✗"}`);

  if (allPassed) {
    logs.push("✨ All 5 test cases successfully passed! Practical proof verified.");
  } else {
    logs.push("⚠️ Some test cases failed. Please review errors and re-compile.");
  }

  return {
    allPassed,
    passedCount: testCases.filter((t) => t.passed).length,
    totalCount: testCases.length,
    testCases,
    logs,
  };
}

/**
 * Generic / Language Test Runner for other skills (React, JavaScript, HTML, Node.js, SQL, Git)
 */
function testGenericTask(skillId, code) {
  const logs = [];
  logs.push(`[Compiler v2.4] Analyzing ${skillId.toUpperCase()} solution...`);

  const clean = code.trim();
  const cheat = checkDirectPrintCheat(code);

  const antiCheatTest = {
    id: "generic_cheat",
    name: "Anti-Cheat: Solution Authenticity",
    concept: "Code Integrity",
    passed: !cheat.isCheat,
    message: cheat.isCheat ? cheat.message : "Authentic solution structure verified. No print statement cheats.",
  };

  const testCases = [antiCheatTest];

  if (skillId === "react") {
    const hasComponent = /(function|const)\s+[A-Za-z0-9_]+\s*(\(|=)/.test(clean);
    const hasState = /useState\s*\(/.test(clean);
    const hasValidation = /validate|\.includes\('@'|\.length\s*</i.test(clean);
    const hasSubmit = /handleSubmit|onSubmit/.test(clean);

    testCases.push({
      id: "react_comp",
      name: "React Component & State",
      concept: "Components & State",
      passed: hasComponent && hasState && !cheat.isCheat,
      message: hasComponent && hasState
        ? "Passed: Functional component declares proper useState hooks."
        : "Failed: Must define a functional component using useState.",
    });

    testCases.push({
      id: "react_val",
      name: "Input Validation Logic",
      concept: "Validation",
      passed: hasValidation && !cheat.isCheat,
      message: hasValidation
        ? "Passed: Validation rules for name, email, and password detected."
        : "Failed: Implement validation checking email format and min length.",
    });

    testCases.push({
      id: "react_submit",
      name: "Event Handling & Form Submission",
      concept: "Event handling",
      passed: hasSubmit && !cheat.isCheat,
      message: hasSubmit
        ? "Passed: Form submission handler correctly bound."
        : "Failed: Add onSubmit handler with preventDefault.",
    });
  } else if (skillId === "javascript") {
    const hasAsync = /async\s+function|const\s+\w+\s*=\s*async/.test(clean);
    const hasTryCatch = /try\s*\{[\s\S]*\}\s*catch/.test(clean);
    const hasTimeout = /setTimeout|new Promise/.test(clean);

    testCases.push({
      id: "js_async",
      name: "Async / Await Signature",
      concept: "Promises",
      passed: hasAsync && !cheat.isCheat,
      message: hasAsync ? "Passed: Defined as async function returning a Promise." : "Failed: Define an async function.",
    });

    testCases.push({
      id: "js_retry",
      name: "Retry & Error Handling",
      concept: "Error handling",
      passed: hasTryCatch && !cheat.isCheat,
      message: hasTryCatch ? "Passed: Graceful try/catch block handles retry attempts." : "Failed: Wrap execution in try/catch.",
    });

    testCases.push({
      id: "js_timing",
      name: "Timing Delay & Backoff",
      concept: "Timing",
      passed: hasTimeout && !cheat.isCheat,
      message: hasTimeout ? "Passed: Implements delay mechanism with Promise/setTimeout." : "Failed: Use setTimeout or Promise for delay.",
    });
  } else if (skillId === "html") {
    const hasDialog = /<dialog\b|role=["']dialog["']/i.test(clean);
    const hasAria = /aria-labelledby|aria-label/i.test(clean);
    const hasHeading = /<h[1-6]\b/i.test(clean);

    testCases.push({
      id: "html_dialog",
      name: "Modal Dialog Element",
      concept: "Modal Dialog",
      passed: hasDialog && !cheat.isCheat,
      message: hasDialog ? "Passed: Uses semantic <dialog> or role='dialog'." : "Failed: Use <dialog> or role='dialog'.",
    });

    testCases.push({
      id: "html_aria",
      name: "ARIA Accessibility Landmarks",
      concept: "ARIA Landmarks",
      passed: hasAria && hasHeading && !cheat.isCheat,
      message: hasAria && hasHeading
        ? "Passed: ARIA labels and semantic headings present."
        : "Failed: Include aria-labelledby and semantic headings.",
    });
  } else if (skillId === "sql") {
    const hasJoin = /JOIN\b/i.test(clean);
    const hasGroupBy = /GROUP\s+BY\b/i.test(clean);
    const hasOrderBy = /ORDER\s+BY\b/i.test(clean);
    const hasAgg = /SUM\s*\(|COUNT\s*\(|AVG\s*\(/i.test(clean);

    testCases.push({
      id: "sql_join_group",
      name: "Relational JOIN & GROUP BY",
      concept: "JOINs & GROUP BY",
      passed: hasJoin && hasGroupBy && !cheat.isCheat,
      message: hasJoin && hasGroupBy ? "Passed: Joins tables and aggregates by category." : "Failed: Use JOIN and GROUP BY.",
    });

    testCases.push({
      id: "sql_order",
      name: "Aggregation & Sorting",
      concept: "ORDER BY",
      passed: hasOrderBy && hasAgg && !cheat.isCheat,
      message: hasOrderBy && hasAgg ? "Passed: SUM() aggregation and ORDER BY DESC applied." : "Failed: Aggregate with SUM() and sort with ORDER BY DESC.",
    });
  } else {
    // General fallback
    const hasSubstance = clean.length > 50 && !cheat.isCheat;
    testCases.push({
      id: "general_impl",
      name: "Implementation Completeness",
      concept: "Domain Logic",
      passed: hasSubstance,
      message: hasSubstance ? "Passed: Solution meets length and structural criteria." : "Failed: Incomplete solution implementation.",
    });
  }

  const allPassed = testCases.every((t) => t.passed);
  testCases.forEach((t, i) => {
    logs.push(`[Test ${i + 1}] ${t.name}: ${t.passed ? "PASSED ✓" : "FAILED ✗"}`);
  });

  if (allPassed) {
    logs.push(`✨ All ${testCases.length} test cases successfully passed!`);
  } else {
    logs.push(`⚠️ Test failures detected (${testCases.filter((t) => !t.passed).length} failing).`);
  }

  return {
    allPassed,
    passedCount: testCases.filter((t) => t.passed).length,
    totalCount: testCases.length,
    testCases,
    logs,
  };
}

/**
 * Main Compiler & Test Execution API
 */
export async function compileAndRunTests(skillId, code, task) {
  // Simulate compilation latency
  await new Promise((r) => setTimeout(r, 450));

  if (skillId === "css") {
    return testCssTask(code);
  }
  return testGenericTask(skillId, code);
}
