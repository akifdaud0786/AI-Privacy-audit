export default function Sidebar({ currentPage, setCurrentPage, open }) {
  const navItems = [
    { id: "dashboard", icon: "⬡", label: "Dashboard", desc: "Overview" },
    { id: "audit", icon: "⟳", label: "AI Audit Engine", desc: "Run compliance scan" },
    { id: "policy", icon: "⊞", label: "Policy Analyzer", desc: "Analyze privacy docs" },
    { id: "map", icon: "◉", label: "Compliance Map", desc: "GDPR & DPDP matrix" },
    { id: "reports", icon: "≡", label: "Reports", desc: "History & exports" },
  ];

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#0ea5e9" strokeWidth="1.5"/>
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="rgba(14,165,233,0.15)" stroke="#06b6d4" strokeWidth="1"/>
            <circle cx="14" cy="14" r="3" fill="#0ea5e9"/>
          </svg>
        </div>
        <div>
          <div className="logo-text">PrivacyAudit</div>
          <div className="logo-sub">AI Compliance System</div>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-text">
              <span className="nav-label">{item.label}</span>
              <span className="nav-desc">{item.desc}</span>
            </div>
            {currentPage === item.id && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-section-label">Compliance Frameworks</div>
        <div className="framework-badges">
          <span className="fw-badge gdpr">GDPR</span>
          <span className="fw-badge dpdp">DPDP Act</span>
        </div>
        <div className="sidebar-version">AI-Powered</div>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transform: translateX(0);
          transition: transform 0.3s ease;
          overflow: hidden;
        }

        .sidebar.closed { transform: translateX(-100%); }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: rgba(14,165,233,0.08);
          border-radius: 10px;
          border: 1px solid rgba(14,165,233,0.2);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.05em;
        }

        .logo-sub {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
          letter-spacing: 0.05em;
        }

        .sidebar-section-label {
          font-family: var(--font-display);
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 16px 20px 8px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 10px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          position: relative;
        }

        .nav-item:hover { background: rgba(14,165,233,0.06); color: var(--text-primary); }
        .nav-item.active {
          background: rgba(14,165,233,0.12);
          color: var(--accent-blue);
          border: 1px solid rgba(14,165,233,0.2);
        }

        .nav-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .nav-text { display: flex; flex-direction: column; flex: 1; }

        .nav-label {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
        }

        .nav-desc {
          font-size: 10px;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .nav-item.active .nav-desc { color: rgba(14,165,233,0.6); }

        .nav-active-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-blue);
          border-radius: 50%;
          box-shadow: var(--glow-blue);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
        }

        .framework-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .fw-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .fw-badge.gdpr { background: rgba(14,165,233,0.15); color: var(--accent-blue); border: 1px solid rgba(14,165,233,0.3); }
        .fw-badge.dpdp { background: rgba(16,185,129,0.15); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.3); }

        .sidebar-version {
          font-size: 10px;
          color: var(--text-muted);
          font-family: var(--font-display);
          margin-top: 8px;
        }
      `}</style>
    </aside>
  );
}
