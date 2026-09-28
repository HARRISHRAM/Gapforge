import { useState, useEffect } from "react";
import Button from "./Button";
import { compileAndRunTests } from "../services/taskCompiler";

export default function TaskCompilerRunner({
  skillId,
  task,
  code,
  onChangeCode,
  onResetCode,
  onCompileResults,
  isEvaluating,
}) {
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview' | 'html'
  const [previewViewport, setPreviewViewport] = useState("desktop"); // 'mobile' | 'tablet' | 'desktop'
  const [compiling, setCompiling] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  const handleRunCompiler = async () => {
    setCompiling(true);
    try {
      const res = await compileAndRunTests(skillId, code, task);
      setTestResults(res);
      setHasRunOnce(true);
      if (onCompileResults) {
        onCompileResults(res);
      }
    } catch (err) {
      console.error("Compilation error:", err);
    } finally {
      setCompiling(false);
    }
  };

  // Run automatically on first mount or reset
  useEffect(() => {
    handleRunCompiler();
  }, [skillId]);

  const viewportWidthClass = {
    mobile: "max-w-[375px] mx-auto border-x-2 border-slate-300 shadow-lg",
    tablet: "max-w-[640px] mx-auto border-x-2 border-slate-300 shadow-md",
    desktop: "w-full",
  }[previewViewport];

  return (
    <div className="border border-line rounded-2xl bg-white shadow-xs overflow-hidden">
      {/* Compiler Header Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-teal-400 uppercase">
            Interactive Compiler & Test Suite
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {skillId.toUpperCase()}
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === "editor"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✏️ {skillId === "css" ? "CSS Code" : "Solution Code"}
          </button>

          {task.htmlTemplate && (
            <button
              type="button"
              onClick={() => setActiveTab("html")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "html"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📄 HTML Markup
            </button>
          )}

          {skillId === "css" && (
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👁️ Live Preview
            </button>
          )}
        </div>
      </div>

      {/* Editor or Preview Pane */}
      <div className="relative">
        {activeTab === "editor" && (
          <div className="relative bg-slate-950">
            {/* Action Bar inside editor */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono">
                {code.split("\n").length} lines · {code.length} characters
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onResetCode}
                  className="hover:text-amber-300 text-slate-400 transition-colors font-medium"
                >
                  ↺ Reset Starter Code
                </button>
                <button
                  type="button"
                  onClick={handleRunCompiler}
                  disabled={compiling}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  {compiling ? (
                    <>
                      <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Compiling...
                    </>
                  ) : (
                    <>▶ Run & Test Code</>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => onChangeCode(e.target.value)}
              rows={14}
              placeholder="Enter your implementation here..."
              spellCheck="false"
              className="w-full bg-slate-950 text-emerald-300 font-mono text-xs sm:text-sm p-4 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y leading-relaxed"
            />
          </div>
        )}

        {activeTab === "html" && task.htmlTemplate && (
          <div className="bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono">HTML DOM Structure (Read-Only)</span>
              <span className="text-[11px] text-teal-400">Styled by your CSS above</span>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900/80 rounded-lg max-h-96">
              <code>{task.htmlTemplate}</code>
            </pre>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="bg-slate-100 p-4 min-h-[380px]">
            {/* Viewport bar */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Live Responsive Layout Preview
              </span>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    previewViewport === "mobile"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📱 Mobile (375px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("tablet")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    previewViewport === "tablet"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  💻 Tablet (640px)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    previewViewport === "desktop"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  🖥️ Full Width
                </button>
              </div>
            </div>

            {/* Injected style and HTML template inside scoped wrapper */}
            <div className={`transition-all duration-300 ${viewportWidthClass} bg-white rounded-xl p-4 border border-slate-200`}>
              <style dangerouslySetInnerHTML={{ __html: code }} />
              <div dangerouslySetInnerHTML={{ __html: task.htmlTemplate || `<div class="p-6 text-slate-500">Preview not available for this task type.</div>` }} />
            </div>
          </div>
        )}
      </div>

      {/* Automated Test Suite & Compiler Results Panel */}
      <div className="p-5 bg-slate-50 border-t border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-ink-950">
              Automated Test Suite Verification
            </span>
            {testResults && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  testResults.allPassed
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {testResults.allPassed
                  ? `✓ All ${testResults.totalCount} Test Cases Passed`
                  : `⚠️ ${testResults.passedCount} / ${testResults.totalCount} Passed (Action Required)`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRunCompiler}
            disabled={compiling}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>🔄 Re-compile & Re-run Tests</span>
          </button>
        </div>

        {/* Anti-cheat direct print alert */}
        {testResults?.testCases?.some((t) => t.id.includes("cheat") && !t.passed) && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
            <span className="text-base leading-none">🚫</span>
            <div>
              <p className="font-bold uppercase tracking-wider text-[11px] text-rose-800">
                Direct Print Statement / Cheat Attempt Detected
              </p>
              <p className="mt-0.5 leading-relaxed">
                Direct print statements (e.g. <code>console.log</code>, <code>print()</code>, dummy text) are strictly forbidden. You must write authentic CSS / code rules that satisfy the task requirements.
              </p>
            </div>
          </div>
        )}

        {/* Test Cases List */}
        <div className="space-y-2.5">
          {testResults?.testCases?.map((tc) => (
            <div
              key={tc.id}
              className={`p-3 rounded-xl border transition-colors ${
                tc.passed
                  ? "bg-white border-emerald-200"
                  : "bg-rose-50/70 border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      tc.passed ? "bg-emerald-600" : "bg-rose-600"
                    }`}
                  >
                    {tc.passed ? "✓" : "✗"}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-ink-900">
                    {tc.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {tc.concept}
                  </span>
                </div>

                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    tc.passed
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-rose-700 bg-rose-100"
                  }`}
                >
                  {tc.passed ? "PASSED" : "FAILED"}
                </span>
              </div>

              <p
                className={`mt-1.5 text-xs pl-7 leading-relaxed ${
                  tc.passed ? "text-emerald-800" : "text-rose-800 font-medium"
                }`}
              >
                {tc.message}
              </p>

              {tc.details && (
                <p className="mt-1 text-[11px] text-slate-500 pl-7 font-mono">
                  Diagnostics: {tc.details}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Terminal logs output toggle */}
        <details className="mt-4 pt-3 border-t border-slate-200 text-xs">
          <summary className="font-mono text-slate-600 hover:text-slate-900 cursor-pointer font-semibold select-none">
            ▸ View Compiler Console Output & Diagnostics ({testResults?.logs?.length || 0} lines)
          </summary>
          <div className="mt-2 p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-xl space-y-1 max-h-48 overflow-y-auto">
            {testResults?.logs?.map((l, i) => (
              <div
                key={i}
                className={
                  l.includes("PASSED") || l.includes("All 5")
                    ? "text-emerald-400"
                    : l.includes("FAILED") || l.includes("failed")
                    ? "text-rose-400"
                    : l.includes("Compiler")
                    ? "text-cyan-300"
                    : "text-slate-400"
                }
              >
                {l}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
