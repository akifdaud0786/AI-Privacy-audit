export default function Header({ currentPage, toggleSidebar, notifications }) {
  const pageNames = {
    dashboard: "Dashboard",
    audit: "AI Audit Engine",
    policy: "Policy Analyzer",
    map: "Compliance Map",
    reports: "Reports & Exports",
  };

  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <span /><span /><span />
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-root">PrivacyAudit</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-page">{pageNames[currentPage] || currentPage}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-time">{now}</div>

        <div className="header-status">
          <span className="status-dot" />
          <span className="status-text">AI Engine Active</span>
        </div>

        <div className="header-notif">
          <span className="notif-count">{notifications.length}</span>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>

        <div className="header-avatar">
          <span>A</span>
        </div>
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0; right: 0; left: 0;
          height: var(--header-h);
          background: rgba(8,15,30,0.95);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 50;
          margin-left: var(--sidebar-w);
          transition: margin-left 0.3s ease;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .menu-btn:hover { background: var(--bg-card); }

        .menu-btn span {
          display: block;
          width: 18px;
          height: 2px;
          background: var(--text-secondary);
          border-radius: 2px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .breadcrumb-root {
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 12px;
        }

        .breadcrumb-sep { color: var(--text-muted); font-size: 16px; }

        .breadcrumb-page {
          color: var(--text-primary);
          font-weight: 600;
        }

        .header-time {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-display);
          letter-spacing: 0.04em;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          padding: 4px 12px;
          border-radius: 999px;
        }

        .status-dot {
          width: 7px; height: 7px;
          background: var(--accent-green);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--accent-green);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text { font-size: 11px; color: var(--accent-green); font-weight: 600; letter-spacing: 0.04em; }

        .header-notif {
          position: relative;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .header-notif:hover { background: var(--bg-card); color: var(--text-primary); }

        .notif-count {
          position: absolute;
          top: 2px; right: 2px;
          width: 14px; height: 14px;
          background: var(--accent-blue);
          border-radius: 50%;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .header-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
}
