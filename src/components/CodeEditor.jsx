import { useState, useRef } from "react";

// ─── Judge0 CE (Community Edition) – free, no API key needed ───────────────
const JUDGE0_FREE = "https://ce.judge0.com";

const LANGUAGES = [
  {
    id: "python",
    label: "Python 3",
    icon: "🐍",
    judge0Id: 71,
    color: "#3b82f6",
    starter: (title) =>
      `# Python 3 Solution\n# Problem: ${title}\n\ndef solve(n):\n    # Write your solution here\n    pass\n\n# Read input\nn = int(input())\nprint(solve(n))\n`,
  },
  {
    id: "c",
    label: "C",
    icon: "⚙️",
    judge0Id: 50,
    color: "#a855f7",
    starter: (title) =>
      `/* C Solution – Problem: ${title} */\n#include <stdio.h>\n\nint solve(int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", solve(n));\n    return 0;\n}\n`,
  },
  {
    id: "java",
    label: "Java",
    icon: "☕",
    judge0Id: 62,
    color: "#f97316",
    starter: (title) =>
      `// Java Solution – Problem: ${title}\nimport java.util.Scanner;\n\npublic class Main {\n    static int solve(int n) {\n        // Write your solution here\n        return 0;\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(solve(n));\n    }\n}\n`,
  },
];

async function runOnJudge0(languageId, sourceCode, stdin) {
  const headers = { "Content-Type": "application/json" };
  const submitRes = await fetch(
    `${JUDGE0_FREE}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ language_id: languageId, source_code: sourceCode, stdin: stdin ?? "" }),
    }
  );
  if (!submitRes.ok) {
    const txt = await submitRes.text().catch(() => "");
    throw new Error(`Submission failed (${submitRes.status}): ${txt.slice(0, 120)}`);
  }
  const { token } = await submitRes.json();
  if (!token) throw new Error("No submission token received.");

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const pollRes = await fetch(
      `${JUDGE0_FREE}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,compile_output,time,memory`,
      { headers }
    );
    if (!pollRes.ok) continue;
    const data = await pollRes.json();
    if (data.status?.id >= 3) return data;
  }
  throw new Error("Execution timed out after 24 seconds.");
}

function OutputBlock({ label, value, color, isError = false }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ display:"block", fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:1, marginBottom:4, fontFamily:"Inter,sans-serif" }}>
        {label}
      </span>
      <pre style={{ background: isError?"#1c1006":"#090e17", border:`1px solid ${isError?"#78350f":"#1e293b"}`, borderRadius:8, padding:"8px 12px", color, fontSize:12, margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight:120, overflowY:"auto", fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
        {value || "(empty)"}
      </pre>
    </div>
  );
}

export default function CodeEditor({ title="Coding Challenge", description="", testCases=[], hint="", onResult, onSubmit, submitting=false }) {
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [codes, setCodes] = useState(() => {
    const init = {};
    LANGUAGES.forEach((l) => (init[l.id] = l.starter(title)));
    return init;
  });
  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [activeTab, setActiveTab] = useState("editor");
  const textareaRef = useRef(null);
  const lineNumRef = useRef(null);

  const code = codes[activeLang.id];
  const setCode = (val) => setCodes((prev) => ({ ...prev, [activeLang.id]: val }));
  const lineCount = (code.match(/\n/g) || []).length + 1;
  const LINE_H = 21;

  const handleScroll = () => {
    if (lineNumRef.current && textareaRef.current)
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + "  " + code.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
  };

  const handleRun = async () => {
    const tc = testCases?.[0];
    const stdin = tc ? String(tc.input) : "";
    const expected = tc ? String(tc.expected).trim() : null;
    setRunning(true);
    setRunOutput(null);
    setActiveTab("output");
    try {
      const res = await runOnJudge0(activeLang.judge0Id, code, stdin);
      const stdout = (res.stdout || "").trim();
      const stderr = (res.stderr || res.compile_output || "").trim();
      const statusId = res.status?.id;
      const statusName = res.status?.description || "Unknown";
      const passed = statusId === 3 && expected !== null ? stdout === expected : false;
      const output = { statusId, statusName, stdout, stderr, time: res.time, memory: res.memory, passed, expected, stdin };
      setRunOutput(output);
      onResult?.(passed, stdout);
    } catch (err) {
      setRunOutput({ statusId: -1, statusName: "Network Error", stderr: err.message, stdout: "", passed: false, expected, stdin });
      onResult?.(false, "");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ fontFamily:"Inter,sans-serif" }}>
      {/* Problem */}
      <div style={{ marginBottom:14 }}>
        <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 5px", fontFamily:"Inter,sans-serif" }}>{title}</h3>
        <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, margin:0 }}>{description}</p>
      </div>

      {/* Sample Test Case */}
      {testCases.length > 0 && (
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, padding:"10px 14px", marginBottom:14, fontSize:12 }}>
          <span style={{ fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:4 }}>Sample Test Case</span>
          <code style={{ display:"block", color:"#1e293b", fontFamily:"monospace" }}>Input: {testCases[0].input}</code>
          <code style={{ display:"block", color:"#0f766e", fontFamily:"monospace", marginTop:2 }}>Expected Output: {testCases[0].expected}</code>
        </div>
      )}

      {/* Language + Tab Bar */}
      <div style={{ display:"flex", background:"#0d1117", borderRadius:"12px 12px 0 0", padding:"10px 12px 0", borderBottom:"1px solid #1e293b", alignItems:"flex-end" }}>
        {LANGUAGES.map((lang) => {
          const isActive = lang.id === activeLang.id;
          return (
            <button key={lang.id} onClick={() => { setActiveLang(lang); setRunOutput(null); }} style={{ background:isActive?"#1e293b":"transparent", border:isActive?`1px solid ${lang.color}`:"1px solid transparent", borderBottom:isActive?"1px solid #1e293b":"1px solid transparent", borderRadius:"8px 8px 0 0", color:isActive?lang.color:"#64748b", padding:"6px 14px", fontSize:12, fontWeight:isActive?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", fontFamily:"Inter,sans-serif", marginRight:3 }}>
              <span>{lang.icon}</span><span>{lang.label}</span>
            </button>
          );
        })}
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {["editor","output"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:activeTab===tab?"#0f172a":"transparent", border:"none", color:activeTab===tab?"#94a3b8":"#475569", padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer", borderRadius:6, textTransform:"uppercase", letterSpacing:0.5, fontFamily:"Inter,sans-serif" }}>
              {tab==="output" && runOutput ? (<span style={{ color:runOutput.passed?"#34d399":"#f87171" }}>{runOutput.passed?"✓ ":"✗ "}Output</span>) : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {activeTab === "editor" && (
        <div style={{ display:"flex", background:"#0d1117", borderRadius:"0 0 12px 12px", border:"1px solid #1e293b", borderTop:"none", overflow:"hidden", minHeight:280 }}>
          <div ref={lineNumRef} style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:12, lineHeight:`${LINE_H}px`, color:"#374151", paddingTop:14, paddingBottom:14, paddingLeft:12, paddingRight:8, userSelect:"none", textAlign:"right", minWidth:42, background:"#090e17", borderRight:"1px solid #1e293b", overflowY:"hidden", flexShrink:0 }}>
            {Array.from({ length: lineCount }, (_, i) => (<div key={i} style={{ height:LINE_H }}>{i+1}</div>))}
          </div>
          <textarea ref={textareaRef} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={handleKeyDown} onScroll={handleScroll} spellCheck={false} style={{ flex:1, background:"transparent", color:"#e2e8f0", fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:12, lineHeight:`${LINE_H}px`, padding:"14px 16px", border:"none", outline:"none", resize:"none", minHeight:280, whiteSpace:"pre", overflowX:"auto", tabSize:2 }} placeholder="Write your code here..." />
        </div>
      )}

      {/* Output */}
      {activeTab === "output" && (
        <div style={{ background:"#0d1117", borderRadius:"0 0 12px 12px", border:"1px solid #1e293b", borderTop:"none", minHeight:280, padding:16, fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:12 }}>
          {!runOutput && !running && (<div style={{ color:"#475569", textAlign:"center", marginTop:80, fontFamily:"Inter,sans-serif" }}>▶ Press <strong>Run Code</strong> to compile &amp; test your solution</div>)}
          {running && (
            <div style={{ color:"#60a5fa", textAlign:"center", marginTop:80, fontFamily:"Inter,sans-serif" }}>
              <div style={{ width:32, height:32, border:"3px solid #1e3a5f", borderTop:"3px solid #60a5fa", borderRadius:"50%", margin:"0 auto 12px", animation:"ce_spin 0.9s linear infinite" }} />
              <style>{`@keyframes ce_spin { to { transform:rotate(360deg); } }`}</style>
              Compiling &amp; running on Judge0 server...
            </div>
          )}
          {runOutput && !running && (
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:runOutput.passed?"#052e16":runOutput.statusId===3?"#450a0a":"#1c1917", border:`1px solid ${runOutput.passed?"#166534":runOutput.statusId===3?"#991b1b":"#44403c"}`, borderRadius:8, padding:"4px 12px", marginBottom:12, fontFamily:"Inter,sans-serif" }}>
                <span style={{ fontSize:16 }}>{runOutput.passed?"✅":runOutput.statusId===3?"❌":"⚠️"}</span>
                <span style={{ color:runOutput.passed?"#4ade80":runOutput.statusId===3?"#f87171":"#a8a29e", fontWeight:700, fontSize:12 }}>
                  {runOutput.passed?"Test Passed!":runOutput.statusId===3?"Wrong Answer":runOutput.statusName}
                </span>
                {runOutput.time && (<span style={{ color:"#64748b", fontSize:11, marginLeft:8 }}>{runOutput.time}s · {runOutput.memory} KB</span>)}
              </div>
              {runOutput.stdin !== undefined && <OutputBlock label="Input" value={runOutput.stdin} color="#94a3b8" />}
              {runOutput.stdout && <OutputBlock label="Your Output" value={runOutput.stdout} color="#e2e8f0" />}
              {runOutput.expected !== null && <OutputBlock label="Expected Output" value={runOutput.expected} color={runOutput.passed?"#4ade80":"#f87171"} />}
              {runOutput.stderr && <OutputBlock label="Error / Compile Output" value={runOutput.stderr} color="#fbbf24" isError />}
              {!runOutput.passed && hint && (<div style={{ marginTop:12, padding:"8px 12px", background:"#1c1917", border:"1px solid #44403c", borderRadius:8, color:"#a8a29e", fontSize:11, fontFamily:"Inter,sans-serif" }}>💡 <strong>Hint:</strong> {hint}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, gap:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={handleRun} disabled={running||submitting} style={{ background:running?"#1e293b":"linear-gradient(135deg,#0f766e,#0d9488)", border:"none", borderRadius:8, color:"white", padding:"9px 18px", fontSize:13, fontWeight:700, cursor:running?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:running?"none":"0 2px 8px rgba(13,148,136,0.35)", transition:"all 0.2s", fontFamily:"Inter,sans-serif" }}>
            {running ? (<><span style={{ opacity:0.7 }}>⏳</span><span>Running...</span></>) : (<><span>▶</span><span>Run Code</span></>)}
          </button>
          {runOutput && !running && (<span style={{ fontSize:12, fontWeight:600, color:runOutput.passed?"#4ade80":"#f87171", fontFamily:"Inter,sans-serif" }}>{runOutput.passed?"✓ Test Passed":"✗ Test Failed"}</span>)}
        </div>
        <button onClick={onSubmit} disabled={submitting||running} style={{ background:submitting||running?"#1e293b":"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:8, color:"white", padding:"9px 22px", fontSize:13, fontWeight:700, cursor:submitting||running?"not-allowed":"pointer", boxShadow:submitting||running?"none":"0 2px 8px rgba(124,58,237,0.35)", transition:"all 0.2s", fontFamily:"Inter,sans-serif" }}>
          {submitting ? "Calculating Results..." : "Submit Complete Quiz →"}
        </button>
      </div>
    </div>
  );
}
