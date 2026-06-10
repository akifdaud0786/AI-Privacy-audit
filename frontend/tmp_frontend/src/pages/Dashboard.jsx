import { useState, useEffect } from "react";

const MOCK_STATS = [
  { label: "Overall Score", value: "74", unit: "/100", trend: "+8", color: "#0ea5e9", icon: "◉" },
  { label: "GDPR Compliance", value: "81", unit: "%", trend: "+5%", color: "#10b981", icon: "✓" },
  { label: "DPDP Act Score", value: "67", unit: "%", trend: "+12%", color: "#f59e0b", icon: "⊕" },
  { label: "Open Violations", value: "14", unit: "", trend: "-3", color: "#ef4444", icon: "⚠" },
];

const RISK_ITEMS = [
  { id: 1, title: "Data Retention Policy Missing", regulation: "GDPR Art. 5(e) / DPDP §8", severity: "critical", category: "Data Governance" },
  { id: 2, title: "No Grievance Officer Designated", regulation: "DPDP Act §13", severity: "critical", category: "Accountability" },
  { id: 3, title: "Third-party Data Processor Agreements Incomplete", regulation: "GDPR Art. 28 / DPDP §9", severity: "high", category: "Vendor Management" },
  { id: 4, title: "Cookie Consent Banner Non-Compliant", regulation: "GDPR Art. 7 & ePrivacy", severity: "high", category: "Consent" },
  { id: 5, title: "Privacy Notice Language Ambiguous", regulation: "DPDP Act §5 / GDPR Art. 13", severity: "medium", category: "Transparency" },
  { id: 6, title: "Data Subject Request Response Time Exceeds Limit", regulation: "GDPR Art. 12 / DPDP §11", severity: "medium", category: "Rights Fulfillment" },
];

const ACTIVITIES = [
  { time: "2h ago", action: "AI Audit completed", detail: "Marketing database scanned", type: "success" },
  { time: "5h ago", action: "Policy updated", detail: "Privacy Notice v3.2 uploaded", type: "info" },
  { time: "1d ago", action: "New violation detected", detail: "Data retention gap identified", type: "error" },
  { time: "2d ago", action: "DSR processed", detail: "Right to erasure request completed", type: "success" },
  { time: "3d ago", action: "Report exported", detail: "GDPR compliance PDF generated", type: "info" },
];

function ScoreRing({ score, color, size = 120 }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: size * 0.23, fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: size * 0.09, color: "var(--text-muted)", marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

export default function Dashboard({ setCurrentPage, addNotification, auditResults }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const severityColor = {
    critical: "#ef4444",
    high: "#f59e0b",
    medium: "#0ea5e9",
    low: "#10b981",
  };

  // Use actual data if available, otherwise fallback to mock data
  const overallScore = auditResults ? auditResults.overall_score : 74;
  const gdprScore = auditResults ? auditResults.gdpr_score : 81;
  const dpdpScore = auditResults ? auditResults.dpdp_score : 67;
  const violations = auditResults ? auditResults.violations : RISK_ITEMS;
  const numViolations = violations.length;

  const categoryScores = auditResults?.compliance_score_breakdown ? [
    { label: "Data Collection", gdpr: auditResults.compliance_score_breakdown.data_collection || 0, dpdp: auditResults.compliance_score_breakdown.data_collection || 0 },
    { label: "Consent Mgmt", gdpr: auditResults.compliance_score_breakdown.consent_management || 0, dpdp: auditResults.compliance_score_breakdown.consent_management || 0 },
    { label: "Data Subject Rights", gdpr: auditResults.compliance_score_breakdown.data_subject_rights || 0, dpdp: auditResults.compliance_score_breakdown.data_subject_rights || 0 },
    { label: "Security Measures", gdpr: auditResults.compliance_score_breakdown.security_measures || 0, dpdp: auditResults.compliance_score_breakdown.security_measures || 0 },
  ] : [
    { label: "Data Processing", gdpr: 85, dpdp: 70 },
    { label: "Consent Mgmt", gdpr: 72, dpdp: 55 },
    { label: "Data Subject Rights", gdpr: 90, dpdp: 78 },
    { label: "Security Controls", gdpr: 88, dpdp: 82 },
  ];

  const currentStats = [
    { label: "Overall Score", value: overallScore, unit: "/100", trend: auditResults ? "Current" : "+8", color: "#0ea5e9", icon: "◉" },
    { label: "GDPR Compliance", value: gdprScore || "N/A", unit: "%", trend: auditResults ? "Current" : "+5%", color: "#10b981", icon: "✓" },
    { label: "DPDP Act Score", value: dpdpScore || "N/A", unit: "%", trend: auditResults ? "Current" : "+12%", color: "#f59e0b", icon: "⊕" },
    { label: "Open Violations", value: numViolations, unit: "", trend: auditResults ? "Current" : "-3", color: "#ef4444", icon: "⚠" },
  ];

  return (
    <div className="dashboard">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">⟳ Last scan: {auditResults ? "Just now" : "2 hours ago"}</div>
          <h1 className="hero-title">Privacy Compliance Dashboard</h1>
          <p className="hero-sub">AI-powered audit covering <strong>GDPR</strong> (EU) and <strong>DPDP Act 2023</strong> (India)</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setCurrentPage("audit")}>
            ⟳ Run New Audit
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentPage("reports")}>
            ≡ View Reports
          </button>
        </div>
        <div className="hero-bg-pattern" />
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        {currentStats.map((s, i) => (
          <div key={i} className="stat-card card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>
              {s.value}<span className="stat-unit">{s.unit}</span>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend" style={{ color: s.trend === "Current" ? "var(--text-muted)" : s.trend.startsWith("+") ? "#10b981" : "#ef4444" }}>
              {s.trend === "Current" ? "Latest Run" : `${s.trend.startsWith("+") ? "↑" : "↓"} ${s.trend.replace(/[+-]/, "")} this month`}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Risk Violations */}
        <div className="card risk-card">
          <div className="card-header">
            <div>
              <div className="section-title">Active Violations</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Requires immediate attention</p>
            </div>
            <span className="badge badge-red">{violations.filter(r => r.severity === "critical").length} Critical</span>
          </div>

          <div className="violations-list">
            {violations.map((item, idx) => (
              <div key={item.id || idx} className="violation-item">
                <div className="violation-indicator" style={{ background: severityColor[item.severity] || severityColor.medium }} />
                <div className="violation-body">
                  <div className="violation-title">{item.title}</div>
                  <div className="violation-meta">
                    <span className="tag">{item.category}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.regulation}</span>
                  </div>
                </div>
                <span className="badge" style={{
                  background: `${severityColor[item.severity] || severityColor.medium}15`,
                  color: severityColor[item.severity] || severityColor.medium,
                  border: `1px solid ${severityColor[item.severity] || severityColor.medium}40`,
                  flexShrink: 0
                }}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Score Overview */}
          <div className="card score-card">
            <div className="section-title">Compliance Score</div>
            <div className="scores-row">
              <div className="score-item">
                <ScoreRing score={gdprScore || 0} color="#10b981" size={100} />
                <div className="score-fw">GDPR</div>
              </div>
              <div className="score-divider" />
              <div className="score-item">
                <ScoreRing score={dpdpScore || 0} color="#f59e0b" size={100} />
                <div className="score-fw">DPDP Act</div>
              </div>
              <div className="score-divider" />
              <div className="score-item">
                <ScoreRing score={overallScore || 0} color="#0ea5e9" size={100} />
                <div className="score-fw">Overall</div>
              </div>
            </div>

            <div className="category-bars">
              {categoryScores.map((c) => (
                <div key={c.label} className="cat-bar-row">
                  <div className="cat-bar-label">{c.label}</div>
                  <div className="cat-bar-bars">
                    <div className="cat-mini-bar">
                      <div style={{ width: `${c.gdpr}%`, height: 4, background: "#10b981", borderRadius: 2, boxShadow: "0 0 4px #10b981" }} />
                    </div>
                    <div className="cat-mini-bar">
                      <div style={{ width: `${c.dpdp}%`, height: 4, background: "#f59e0b", borderRadius: 2, boxShadow: "0 0 4px #f59e0b" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 60, textAlign: "right" }}>
                    {c.gdpr}% / {c.dpdp}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="section-title">Recent Activity</div>
            <div className="activity-list">
              {ACTIVITIES.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot activity-${a.type}`} />
                  <div className="activity-body">
                    <div className="activity-action">{a.action}</div>
                    <div className="activity-detail">{a.detail}</div>
                  </div>
                  <span className="activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { display: flex; flex-direction: column; gap: 24px; }

        .hero-banner {
          background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #081525 100%);
          border: 1px solid var(--border-bright);
          border-radius: var(--radius);
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .hero-content { position: relative; z-index: 1; }

        .hero-badge {
          display: inline-block;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          color: var(--accent-green);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-family: var(--font-display);
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.02em;
          margin-bottom: 8px;
        }

        .hero-sub { font-size: 14px; color: var(--text-secondary); }
        .hero-sub strong { color: var(--accent-blue); }

        .hero-actions {
          display: flex;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .hero-bg-pattern {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 40%;
          background: radial-gradient(ellipse at right, rgba(14,165,233,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stat-icon { font-size: 20px; margin-bottom: 4px; }
        .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; line-height: 1; }
        .stat-unit { font-size: 16px; }
        .stat-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
        .stat-trend { font-size: 11px; font-weight: 600; }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
        }

        .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }

        .violations-list { display: flex; flex-direction: column; gap: 10px; }

        .violation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }

        .violation-item:hover { border-color: var(--border-bright); }

        .violation-indicator {
          width: 3px;
          height: 40px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .violation-body { flex: 1; }
        .violation-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
        .violation-meta { display: flex; align-items: center; gap: 8px; }

        .right-col { display: flex; flex-direction: column; gap: 20px; }

        .score-card { }
        .scores-row { display: flex; align-items: center; justify-content: space-around; padding: 16px 0; }
        .score-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .score-fw { font-size: 12px; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.06em; font-family: var(--font-display); }
        .score-divider { width: 1px; height: 80px; background: var(--border); }

        .category-bars { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
        .cat-bar-row { display: flex; align-items: center; gap: 10px; }
        .cat-bar-label { font-size: 11px; color: var(--text-muted); width: 130px; flex-shrink: 0; }
        .cat-bar-bars { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .cat-mini-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }

        .activity-list { display: flex; flex-direction: column; gap: 12px; }
        .activity-item { display: flex; align-items: flex-start; gap: 10px; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .activity-success { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }
        .activity-info { background: var(--accent-blue); box-shadow: 0 0 6px var(--accent-blue); }
        .activity-error { background: var(--accent-red); box-shadow: 0 0 6px var(--accent-red); }
        .activity-body { flex: 1; }
        .activity-action { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .activity-detail { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .activity-time { font-size: 10px; color: var(--text-muted); white-space: nowrap; font-family: var(--font-display); }
      `}</style>
    </div>
  );
}
