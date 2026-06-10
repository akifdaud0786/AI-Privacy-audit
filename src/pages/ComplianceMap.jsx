import { useState } from "react";

const COMPLIANCE_MATRIX = [
  {
    category: "Lawful Basis for Processing",
    gdpr: { ref: "Art. 6", bases: ["Consent", "Contract", "Legal Obligation", "Vital Interests", "Public Task", "Legitimate Interests"], status: "mature" },
    dpdp: { ref: "§4", bases: ["Consent (primary)", "Legitimate Uses (state, employment, public interest, legal proceedings, medical emergency)"], status: "simpler" },
    gap: "DPDP has fewer lawful bases; 'legitimate interests' replaced by specific 'legitimate uses'. Evaluate each processing activity against both.",
  },
  {
    category: "Consent Requirements",
    gdpr: { ref: "Art. 7", bases: ["Freely given", "Specific", "Informed", "Unambiguous affirmative action", "Withdrawable at any time", "Not bundled", "Not pre-ticked"], status: "mature" },
    dpdp: { ref: "§6", bases: ["Free, specific, informed, unconditional, unambiguous", "Given through clear affirmative action", "Verifiable request format", "Withdraw anytime (same ease as giving)"], status: "comparable" },
    gap: "DPDP consent requirements closely mirror GDPR. Key difference: DPDP requires consent in multiple Indian languages on request.",
  },
  {
    category: "Data Principal / Subject Rights",
    gdpr: { ref: "Art. 15–22", bases: ["Access", "Rectification", "Erasure ('Right to be Forgotten')", "Restriction", "Portability", "Object", "Not subject to automated decisions"], status: "mature" },
    dpdp: { ref: "§11–13", bases: ["Access (summary of processing)", "Correction, completion, updating", "Erasure", "Grievance Redressal", "Nominate another person"], status: "comparable" },
    gap: "GDPR includes data portability and rights around automated decision-making; DPDP lacks these but adds nomination right. Organizations serving both must provide full GDPR rights set.",
  },
  {
    category: "Data Retention",
    gdpr: { ref: "Art. 5(1)(e)", bases: ["Storage limitation principle", "Not kept longer than necessary for purpose", "Can retain longer for archiving/research with safeguards"], status: "mature" },
    dpdp: { ref: "§8(7)", bases: ["Erase when purpose served or consent withdrawn", "Government may prescribe specific retention periods"], status: "comparable" },
    gap: "Both require purpose-linked retention. GDPR is more established with case law; DPDP rules are still emerging. Implement retention schedules aligned to GDPR's stricter standards.",
  },
  {
    category: "Data Fiduciary / Controller Obligations",
    gdpr: { ref: "Art. 24–26", bases: ["Appoint DPO if required", "Maintain ROPA (Records of Processing Activities)", "Data Protection by Design & Default", "Joint controller agreements"], status: "mature" },
    dpdp: { ref: "§8–10", bases: ["Completeness, accuracy, consistency of data", "Implement security safeguards", "Notify breaches", "Erase data when purpose served"], status: "developing" },
    gap: "GDPR has more extensive accountability documentation requirements (ROPA, DPIA). DPDP focuses more on operational obligations. Maintain GDPR-level documentation even for India operations.",
  },
  {
    category: "Data Protection Officer / Grievance Officer",
    gdpr: { ref: "Art. 37–39", bases: ["Mandatory for public bodies", "Mandatory for large-scale processing of special data", "Independent, expert in data protection law", "Must be published and reachable"], status: "mature" },
    dpdp: { ref: "§13", bases: ["Grievance Officer mandatory for all significant data fiduciaries", "Must acknowledge within 48 hours", "Resolve within prescribed period"], status: "developing" },
    gap: "GDPR DPO has more defined responsibilities; DPDP Grievance Officer primarily handles data principal complaints. Organizations need both roles if operating across EU and India.",
  },
  {
    category: "Breach Notification",
    gdpr: { ref: "Art. 33–34", bases: ["72-hour notification to supervisory authority", "Notification to individuals if high risk", "Document all breaches", "Must include specific information"], status: "mature" },
    dpdp: { ref: "§8(6)", bases: ["Notify Data Protection Board (DPB) and affected persons", "Timeline not yet specified — awaiting rules", "Must include nature, scale, impact"], status: "developing" },
    gap: "GDPR has strict 72-hour timeline; DPDP timeline pending regulations. Build processes to meet GDPR's 72-hour standard to ensure DPDP compliance when rules finalize.",
  },
  {
    category: "Special / Sensitive Data Categories",
    gdpr: { ref: "Art. 9–10", bases: ["Health, biometric, genetic, race, religion, political views, sexual orientation, criminal records", "Processing prohibited unless specific exception applies", "Explicit consent or other Art. 9(2) basis required"], status: "mature" },
    dpdp: { ref: "Not yet defined in Act", bases: ["DPDP Act does not create a separate sensitive data category", "Rules may address — Concept Paper mentioned financial, health data", "Check sector-specific regulations (RBI, IRDAI, DISHA)"], status: "developing" },
    gap: "Critical gap: India has no unified sensitive data framework in DPDP yet. Health and biometric data processing must comply with GDPR standards and relevant Indian sector regulations.",
  },
  {
    category: "Penalties & Enforcement",
    gdpr: { ref: "Art. 83–84", bases: ["Up to €20M or 4% global annual turnover (higher applies)", "DPAs can investigate and sanction", "Criminal penalties possible in some member states"], status: "mature" },
    dpdp: { ref: "§33–34", bases: ["Up to ₹250 crore (~€28M) per breach", "Adjudication by Data Protection Board", "No criminal penalties (only civil fines)"], status: "developing" },
    gap: "DPDP maximum fine (₹250 crore) is comparable to GDPR. GDPR enforcement is more established; DPDP Board is being constituted. Both carry significant financial risk.",
  },
];

export default function ComplianceMap() {
  const [filter, setFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);

  const statusColor = {
    mature: "#10b981",
    comparable: "#0ea5e9",
    developing: "#f59e0b",
    simpler: "#8b5cf6",
  };

  const statusLabel = {
    mature: "Mature",
    comparable: "Comparable",
    developing: "Developing",
    simpler: "Simplified",
  };

  return (
    <div className="map-page">
      <div className="page-header">
        <h2 className="page-title">Compliance Map</h2>
        <p className="page-sub">Side-by-side comparison of GDPR and India's DPDP Act 2023 across all key requirements</p>
      </div>

      {/* Legend */}
      <div className="card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>STATUS LEGEND:</span>
          {Object.entries(statusColor).map(([key, color]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, background: color, borderRadius: 2, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{statusLabel[key]}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 10, background: "rgba(14,165,233,0.3)", borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>GDPR (EU)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 10, background: "rgba(16,185,129,0.3)", borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>DPDP Act (India)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="matrix-container">
        <div className="matrix-header">
          <div className="matrix-col-category">Requirement Category</div>
          <div className="matrix-col-gdpr">
            <span className="fw-header gdpr-header">GDPR (EU Regulation)</span>
          </div>
          <div className="matrix-col-dpdp">
            <span className="fw-header dpdp-header">DPDP Act 2023 (India)</span>
          </div>
          <div className="matrix-col-gap">Gap Analysis</div>
        </div>

        {COMPLIANCE_MATRIX.map((row, i) => (
          <div key={i} className={`matrix-row ${expandedRow === i ? "expanded" : ""}`}
            onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
            <div className="matrix-col-category">
              <div className="cat-name">{row.category}</div>
              <div className="expand-hint">{expandedRow === i ? "▲ collapse" : "▼ expand"}</div>
            </div>

            <div className="matrix-col-gdpr">
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <span className="ref-badge gdpr-ref">{row.gdpr.ref}</span>
                <span className="status-pill" style={{ background: `${statusColor[row.gdpr.status]}15`, color: statusColor[row.gdpr.status], border: `1px solid ${statusColor[row.gdpr.status]}30` }}>
                  {statusLabel[row.gdpr.status]}
                </span>
              </div>
              {expandedRow === i && row.gdpr.bases.map((b, j) => (
                <div key={j} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "#0ea5e9", fontSize: 10, marginTop: 2 }}>◆</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
              {expandedRow !== i && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.gdpr.bases.length} requirements</div>}
            </div>

            <div className="matrix-col-dpdp">
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <span className="ref-badge dpdp-ref">{row.dpdp.ref}</span>
                <span className="status-pill" style={{ background: `${statusColor[row.dpdp.status]}15`, color: statusColor[row.dpdp.status], border: `1px solid ${statusColor[row.dpdp.status]}30` }}>
                  {statusLabel[row.dpdp.status]}
                </span>
              </div>
              {expandedRow === i && row.dpdp.bases.map((b, j) => (
                <div key={j} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: "#10b981", fontSize: 10, marginTop: 2 }}>◆</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
              {expandedRow !== i && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.dpdp.bases.length} requirements</div>}
            </div>

            <div className="matrix-col-gap">
              {expandedRow === i ? (
                <div style={{ padding: "10px 12px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {row.gap}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {row.gap.slice(0, 80)}...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick reference cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="section-title">GDPR Key Deadlines</div>
          {[
            { event: "Breach Notification", deadline: "72 hours", urgency: "critical" },
            { event: "DSR Response", deadline: "1 month (extendable to 3)", urgency: "high" },
            { event: "DPIA Completion", deadline: "Before processing begins", urgency: "high" },
            { event: "DPO Registration", deadline: "Immediate if required", urgency: "critical" },
          ].map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.event}</span>
              <span className="badge" style={{ background: d.urgency === "critical" ? "rgba(239,68,68,0.15)" : "rgba(14,165,233,0.15)", color: d.urgency === "critical" ? "#ef4444" : "#0ea5e9", border: `1px solid ${d.urgency === "critical" ? "rgba(239,68,68,0.3)" : "rgba(14,165,233,0.3)"}` }}>
                {d.deadline}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">DPDP Act Key Timelines</div>
          {[
            { event: "Breach Notification", deadline: "To be notified in rules", urgency: "developing" },
            { event: "Grievance Resolution", deadline: "Within prescribed period", urgency: "developing" },
            { event: "Grievance Acknowledgement", deadline: "48 hours", urgency: "high" },
            { event: "Grievance Officer Appointment", deadline: "Before commencing processing", urgency: "critical" },
          ].map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{d.event}</span>
              <span className="badge" style={{ background: d.urgency === "critical" ? "rgba(239,68,68,0.15)" : d.urgency === "developing" ? "rgba(245,158,11,0.15)" : "rgba(14,165,233,0.15)", color: d.urgency === "critical" ? "#ef4444" : d.urgency === "developing" ? "#f59e0b" : "#0ea5e9", border: "1px solid transparent" }}>
                {d.deadline}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .map-page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { margin-bottom: 4px; }
        .page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.03em; }
        .page-sub { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

        .matrix-container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .matrix-header {
          display: grid;
          grid-template-columns: 200px 1fr 1fr 220px;
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--border-bright);
          padding: 12px 0;
        }

        .matrix-header > div {
          padding: 8px 16px;
          font-size: 10px;
          font-family: var(--font-display);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .fw-header {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          font-family: var(--font-display);
          letter-spacing: 0.08em;
        }

        .gdpr-header { background: rgba(14,165,233,0.15); color: var(--accent-blue); border: 1px solid rgba(14,165,233,0.3); }
        .dpdp-header { background: rgba(16,185,129,0.15); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.3); }

        .matrix-row {
          display: grid;
          grid-template-columns: 200px 1fr 1fr 220px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s;
        }

        .matrix-row:hover { background: rgba(255,255,255,0.02); }
        .matrix-row.expanded { background: rgba(14,165,233,0.03); }
        .matrix-row:last-child { border-bottom: none; }

        .matrix-row > div {
          padding: 14px 16px;
          border-right: 1px solid var(--border);
        }

        .matrix-col-gap { border-right: none !important; }

        .cat-name { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.4; margin-bottom: 4px; }
        .expand-hint { font-size: 10px; color: var(--text-muted); font-family: var(--font-display); }

        .ref-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-family: var(--font-display);
          font-weight: 700;
        }

        .gdpr-ref { background: rgba(14,165,233,0.1); color: var(--accent-blue); border: 1px solid rgba(14,165,233,0.2); }
        .dpdp-ref { background: rgba(16,185,129,0.1); color: var(--accent-green); border: 1px solid rgba(16,185,129,0.2); }

        .status-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
