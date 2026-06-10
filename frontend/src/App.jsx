import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import AuditPage from "./pages/AuditPage";
import ReportsPage from "./pages/ReportsPage";
import PolicyAnalyzer from "./pages/PolicyAnalyzer";
import ComplianceMap from "./pages/ComplianceMap";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const PAGES = {
  dashboard: Dashboard,
  audit: AuditPage,
  reports: ReportsPage,
  policy: PolicyAnalyzer,
  map: ComplianceMap,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [auditResults, setAuditResults] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (msg, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  };

  const PageComponent = PAGES[currentPage] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} open={sidebarOpen} />
      <div className={`main-area ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Header
          currentPage={currentPage}
          toggleSidebar={() => setSidebarOpen((o) => !o)}
          notifications={notifications}
        />
        <main className="page-content">
          <PageComponent
            auditResults={auditResults}
            setAuditResults={setAuditResults}
            addNotification={addNotification}
            setCurrentPage={setCurrentPage}
          />
        </main>
      </div>

      <div className="notifications-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification notification-${n.type}`}>
            <span className="notif-icon">
              {n.type === "success" ? "✓" : n.type === "error" ? "✕" : "ℹ"}
            </span>
            {n.msg}
          </div>
        ))}
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg-primary: #050b14;
          --bg-secondary: #080f1e;
          --bg-card: #0d1829;
          --bg-card-hover: #111f35;
          --border: #1a2e4a;
          --border-bright: #1e3a5f;
          --accent-blue: #0ea5e9;
          --accent-cyan: #06b6d4;
          --accent-green: #10b981;
          --accent-amber: #f59e0b;
          --accent-red: #ef4444;
          --accent-purple: #8b5cf6;
          --text-primary: #e2eaf4;
          --text-secondary: #7a9bb8;
          --text-muted: #3d5a7a;
          --glow-blue: 0 0 20px rgba(14,165,233,0.3);
          --glow-green: 0 0 20px rgba(16,185,129,0.3);
          --glow-red: 0 0 20px rgba(239,68,68,0.3);
          --sidebar-w: 260px;
          --header-h: 64px;
          --font-display: 'Space Mono', monospace;
          --font-body: 'DM Sans', sans-serif;
          --radius: 12px;
          --radius-sm: 8px;
        }

        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        body {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-body);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .app-shell {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        .main-area {
          flex: 1;
          margin-left: 0;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-area.sidebar-open {
          margin-left: var(--sidebar-w);
        }

        .page-content {
          flex: 1;
          padding: 28px;
          margin-top: var(--header-h);
          overflow-y: auto;
        }

        .notifications-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notification {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(20px);
          animation: slideIn 0.3s ease;
          min-width: 280px;
          border: 1px solid;
        }

        .notification-info { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.4); color: #7dd3fc; }
        .notification-success { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
        .notification-error { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
        .notification-warning { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); color: #fcd34d; }

        .notif-icon { font-size: 16px; font-weight: 700; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Shared component styles */
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .card:hover { border-color: var(--border-bright); }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-family: var(--font-body);
          letter-spacing: 0.02em;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          box-shadow: 0 0 16px rgba(14,165,233,0.3);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 24px rgba(14,165,233,0.5); }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-bright);
          color: var(--text-secondary);
        }
        .btn-secondary:hover { border-color: var(--accent-blue); color: var(--accent-blue); }

        .btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .badge-green { background: rgba(16,185,129,0.15); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.3); }
        .badge-red { background: rgba(239,68,68,0.15); color: var(--accent-red); border: 1px solid rgba(239,68,68,0.3); }
        .badge-amber { background: rgba(245,158,11,0.15); color: var(--accent-amber); border: 1px solid rgba(245,158,11,0.3); }
        .badge-blue { background: rgba(14,165,233,0.15); color: var(--accent-blue); border: 1px solid rgba(14,165,233,0.3); }
        .badge-purple { background: rgba(139,92,246,0.15); color: var(--accent-purple); border: 1px solid rgba(139,92,246,0.3); }

        .section-title {
          font-family: var(--font-display);
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .score-ring {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .score-ring svg { transform: rotate(-90deg); }

        .score-ring-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-ring-text .score-num {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }

        .score-ring-text .score-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }

        .progress-bar {
          height: 6px;
          background: var(--border);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 1s ease;
        }

        .tag {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(14,165,233,0.1);
          border: 1px solid rgba(14,165,233,0.2);
          border-radius: 4px;
          font-size: 11px;
          color: var(--accent-blue);
          font-family: var(--font-display);
        }

        textarea, input, select {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        textarea:focus, input:focus, select:focus {
          border-color: var(--accent-blue);
        }

        textarea::placeholder, input::placeholder { color: var(--text-muted); }

        .shimmer {
          background: linear-gradient(90deg, var(--bg-card) 0%, var(--bg-card-hover) 50%, var(--bg-card) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-primary); }
        ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent-blue); }
      `}</style>
    </div>
  );
}
