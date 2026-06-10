import { useState, useRef, useEffect } from "react";
import { API_URLS } from "../apiConfig";

const MOCK_REPORTS = [
  { id: "r1", name: "Full Compliance Audit - Q2 2025", date: "2025-06-01", score: 74, framework: "Both", violations: 14, status: "completed" },
  { id: "r2", name: "GDPR Focus Audit - HR Module", date: "2025-05-15", score: 81, framework: "GDPR", violations: 8, status: "completed" },
  { id: "r3", name: "DPDP Act Gap Analysis - Launch Prep", date: "2025-04-30", score: 55, framework: "DPDP", violations: 22, status: "completed" },
  { id: "r4", name: "Third-Party Processor Review", date: "2025-04-10", score: 68, framework: "Both", violations: 11, status: "completed" },
];

const INITIAL_MESSAGES = [
  { role: "assistant", content: "Hello! I'm your Privacy Compliance AI Assistant. I can help you understand GDPR and India's DPDP Act 2023, answer questions about your audit results, and provide guidance on remediation steps. What would you like to know?" }
];

const QUICK_QUESTIONS = [
  "What is the penalty for a GDPR data breach?",
  "Do I need a DPO under DPDP Act?",
  "What is the difference between GDPR Art. 6 and DPDP §4?",
  "How do I handle a Subject Access Request?",
  "What are DPDP Act significant data fiduciaries?",
];

export default function ReportsPage({ auditResults, addNotification }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg = { role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are an expert privacy compliance consultant specializing in GDPR (EU General Data Protection Regulation) and India's Digital Personal Data Protection (DPDP) Act 2023. 

You provide clear, accurate, actionable guidance on privacy compliance. Your answers are concise but comprehensive. You cite specific articles/sections when relevant.

${auditResults ? `Context: The user's organization has these audit results: Overall score ${auditResults.overall_score}/100, ${auditResults.violations?.length || 0} violations found. Risk level: ${auditResults.risk_level}.` : ""}

Always be helpful and specific. Reference actual regulation articles and sections.`;

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch(API_URLS.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          conversation_history: history,
          audit_context: auditResults
        })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I couldn't connect to the AI service right now. Please check your API configuration and try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format, data) => {
    const targetData = data || auditResults;
    if (!targetData) {
      addNotification("No audit results found to export", "error");
      return;
    }

    try {
      addNotification(`Preparing ${format.toUpperCase()} export...`, "info");
      const response = await fetch(API_URLS.export(format), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetData)
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `privacy_audit_${format}.${format === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      addNotification(`${format.toUpperCase()} exported successfully!`, "success");
    } catch (err) {
      console.error(err);
      addNotification("Failed to export report", "error");
    }
  };

  const scoreColor = (s) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2 className="page-title">Reports & AI Assistant</h2>
        <p className="page-sub">Audit history, exports, and your AI-powered compliance consultant</p>
      </div>

      <div className="tabs">
        {[{ id: "history", label: "Audit History" }, { id: "chat", label: "AI Compliance Assistant" }].map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "history" && (
        <div className="history-view">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="section-title" style={{ margin: 0 }}>Audit Reports ({MOCK_REPORTS.length})</div>
              <button className="btn btn-primary" style={{ fontSize: 12 }} 
                onClick={() => auditResults ? handleExport("pdf") : addNotification("No active audit to export", "info")}>
                ⬇ Export Current (PDF)
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MOCK_REPORTS.map(r => (
                <div key={r.id} className="report-item">
                  <div className="report-score" style={{ color: scoreColor(r.score) }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>{r.score}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>/100</span>
                  </div>
                  <div className="report-body">
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{r.name}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date}</span>
                      <span className={`badge ${r.framework === "GDPR" ? "badge-blue" : r.framework === "DPDP" ? "badge-green" : "badge-purple"}`}>{r.framework}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.violations} violations</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }}
                      onClick={() => handleExport("pdf")}>
                      ⬇ PDF
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }}
                      onClick={() => handleExport("csv")}>
                      ⬇ CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {auditResults && (
            <div className="card">
              <div className="section-title">Latest Audit Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "Overall Score", value: `${auditResults.overall_score}/100`, color: scoreColor(auditResults.overall_score) },
                  { label: "Violations Found", value: auditResults.violations?.length || 0, color: "#ef4444" },
                  { label: "Risk Level", value: auditResults.risk_level, color: "#f59e0b" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: 16, background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div className="chat-view">
          <div className="card chat-card">
            <div className="chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="ai-avatar">
                  <svg width="20" height="20" viewBox="0 0 28 28">
                    <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0ea5e9" strokeWidth="1.5"/>
                    <circle cx="14" cy="14" r="3" fill="#0ea5e9"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Privacy Compliance AI</div>
                  <div style={{ fontSize: 11, color: "var(--accent-green)" }}>● Online · Powered by Claude</div>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }}
                onClick={() => setMessages(INITIAL_MESSAGES)}>
                Clear Chat
              </button>
            </div>

            <div className="quick-questions">
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-display)" }}>QUICK QUESTIONS</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} className="quick-q-btn" onClick={() => sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`message message-${m.role}`}>
                  {m.role === "assistant" && (
                    <div className="msg-avatar ai-msg-avatar">AI</div>
                  )}
                  <div className={`msg-bubble ${m.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="msg-avatar user-msg-avatar">U</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message message-assistant">
                  <div className="msg-avatar ai-msg-avatar">AI</div>
                  <div className="msg-bubble ai-bubble typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask about GDPR, DPDP Act, compliance requirements..."
                style={{ flex: 1, padding: "12px 16px" }}
                disabled={loading}
              />
              <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reports-page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { margin-bottom: 4px; }
        .page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.03em; }
        .page-sub { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

        .tabs { display: flex; gap: 4; border-bottom: 1px solid var(--border); }

        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: -1px;
          font-family: var(--font-body);
        }

        .tab-btn.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }
        .tab-btn:hover:not(.active) { color: var(--text-secondary); }

        .report-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: border-color 0.2s;
        }

        .report-item:hover { border-color: var(--border-bright); }
        .report-score { min-width: 60px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .report-body { flex: 1; }

        .chat-card { display: flex; flex-direction: column; height: calc(100vh - 280px); min-height: 500px; padding: 0; overflow: hidden; }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .ai-avatar {
          width: 36px; height: 36px;
          background: rgba(14,165,233,0.1);
          border: 1px solid rgba(14,165,233,0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-questions {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .quick-q-btn {
          background: rgba(14,165,233,0.06);
          border: 1px solid rgba(14,165,233,0.2);
          color: var(--accent-blue);
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-body);
        }

        .quick-q-btn:hover { background: rgba(14,165,233,0.15); }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message { display: flex; gap: 10; align-items: flex-start; }
        .message-user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ai-msg-avatar { background: rgba(14,165,233,0.15); color: var(--accent-blue); border: 1px solid rgba(14,165,233,0.3); }
        .user-msg-avatar { background: rgba(139,92,246,0.15); color: var(--accent-purple); border: 1px solid rgba(139,92,246,0.3); }

        .msg-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.7;
        }

        .ai-bubble {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-top-left-radius: 4px;
        }

        .user-bubble {
          background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(14,165,233,0.1));
          border: 1px solid rgba(14,165,233,0.3);
          color: var(--text-primary);
          border-top-right-radius: 4px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 14px 16px;
        }

        .typing-indicator span {
          width: 6px; height: 6px;
          background: var(--accent-blue);
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .chat-input-area {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
