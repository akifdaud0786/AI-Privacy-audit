import { useState, useEffect } from "react";
import { API_URLS } from "../apiConfig";

const AUDIT_CATEGORIES = [
  { id: "data_collection", label: "Data Collection & Purpose", icon: "◈" },
  { id: "consent", label: "Consent Management", icon: "✓" },
  { id: "data_rights", label: "Data Subject Rights", icon: "⊕" },
  { id: "retention", label: "Data Retention & Deletion", icon: "⌫" },
  { id: "security", label: "Security Measures", icon: "⬡" },
  { id: "third_party", label: "Third-Party Processors", icon: "⇄" },
  { id: "breach", label: "Breach Notification", icon: "⚠" },
];

const SAMPLE_CONTEXT = `Company: TechFlow Solutions Pvt. Ltd.
Industry: SaaS / HR Technology
Users: ~50,000 registered users across India and EU
Data types: Name, email, phone, employment records, biometric data (attendance), salary information, health records for insurance
Processing activities: 
- User registration and authentication
- HR management (payroll, attendance, leave management)  
- Analytics and reporting for enterprise clients
- Email marketing campaigns
- Third-party integrations: AWS (cloud), Razorpay (payments), Mailchimp (email)
Current privacy infrastructure:
- Privacy policy last updated: 2022
- No designated Data Protection Officer (DPO)
- No formal data retention policy
- Cookie consent via basic popup (no granular controls)
- Breach response plan: informal/undocumented
- Data stored in AWS Mumbai and Frankfurt regions`;

export default function AuditPage({ setAuditResults, addNotification }) {
  const [step, setStep] = useState(1); // 1=config, 2=running, 3=results
  const [framework, setFramework] = useState("both");
  
  // Initialize from localStorage or fallback to SAMPLE_CONTEXT
  const [orgContext, setOrgContext] = useState(() => {
    return localStorage.getItem("savedOrgContext") || SAMPLE_CONTEXT;
  });

  const [selectedCategories, setSelectedCategories] = useState(AUDIT_CATEGORIES.map(c => c.id));
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [streamedText, setStreamedText] = useState("");

  // Save to localStorage whenever orgContext changes
  useEffect(() => {
    localStorage.setItem("savedOrgContext", orgContext);
  }, [orgContext]);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const runAudit = async () => {
    if (!orgContext.trim()) {
      addNotification("Please provide organization context", "error");
      return;
    }

    setStep(2);
    setProgress(0);
    setStreamedText("");

    const tasks = [
      "Initializing AI audit engine...",
      "Parsing organization context...",
      "Mapping data flows...",
      "Checking GDPR requirements...",
      "Analyzing DPDP Act 2023 compliance...",
      "Evaluating consent mechanisms...",
      "Assessing data subject rights...",
      "Reviewing security controls...",
      "Analyzing third-party processors...",
      "Generating risk matrix...",
      "Compiling remediation roadmap...",
      "Finalizing audit report...",
    ];

    for (let i = 0; i < tasks.length; i++) {
      setCurrentTask(tasks[i]);
      setProgress(Math.round(((i + 1) / tasks.length) * 90));
      await new Promise(r => setTimeout(r, 500));
    }

    const frameworkStr = framework === "gdpr" ? "GDPR only" : framework === "dpdp" ? "India's DPDP Act 2023 only" : "both GDPR and India's DPDP Act 2023";
    const prompt = `You are an expert privacy compliance auditor. Analyze the following organization and provide a DETAILED compliance audit for ${frameworkStr}.

ORGANIZATION CONTEXT:
${orgContext}

AUDIT CATEGORIES SELECTED: ${selectedCategories.join(", ")}

Provide a comprehensive audit in the following EXACT JSON structure:
{
  "overall_score": <number 0-100>,
  "gdpr_score": <number 0-100, or null if not applicable>,
  "dpdp_score": <number 0-100, or null if not applicable>,
  "executive_summary": "<2-3 sentence summary>",
  "risk_level": "<Critical|High|Medium|Low>",
  "violations": [
    {
      "id": "<unique id>",
      "title": "<violation title>",
      "description": "<detailed description>",
      "regulation": "<specific article/section>",
      "framework": "<GDPR|DPDP|Both>",
      "severity": "<critical|high|medium|low>",
      "category": "<category name>",
      "remediation": "<specific remediation steps>",
      "timeline": "<immediate|30days|90days|6months>"
    }
  ],
  "compliant_areas": [
    {
      "title": "<area>",
      "description": "<what is compliant>",
      "framework": "<GDPR|DPDP|Both>"
    }
  ],
  "remediation_roadmap": [
    {
      "phase": "<Phase 1 - Immediate Actions (0-30 days)|Phase 2 - Short Term (30-90 days)|Phase 3 - Long Term (90+ days)>",
      "actions": ["<action 1>", "<action 2>"]
    }
  ],
  "key_recommendations": ["<rec 1>", "<rec 2>", "<rec 3>", "<rec 4>", "<rec 5>"],
  "dpo_required": <true|false>,
  "estimated_fine_risk": "<estimated potential fine range in EUR for GDPR, INR for DPDP>"
}

Return ONLY valid JSON, no markdown fences.`;

    try {
      const response = await fetch(API_URLS.auditStream, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_context: orgContext,
          framework: framework,
          categories: selectedCategories
        })
      });

      let fullText = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.slice(6).trim();
            if (content === "[DONE]") break;
            try {
              const data = JSON.parse(content);
              if (data.text) {
                fullText += data.text;
                setStreamedText(fullText);
              }
            } catch {}
          }
        }
      }

      const clean = fullText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setProgress(100);
      setCurrentTask("Audit complete!");
      await new Promise(r => setTimeout(r, 600));
      setResults(parsed);
      setAuditResults(parsed);
      setStep(3);
      addNotification("AI Audit completed successfully!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Audit failed. Using demo results.", "error");
      // Fallback demo data
      const demo = {
        overall_score: 54,
        gdpr_score: 58,
        dpdp_score: 50,
        executive_summary: "TechFlow Solutions has significant compliance gaps across both GDPR and DPDP Act 2023 frameworks. The organization processes sensitive personal data including biometric and health records without adequate legal bases, missing a formal DPO, and has an outdated privacy policy. Immediate action is required to avoid regulatory penalties.",
        risk_level: "High",
        dpo_required: true,
        estimated_fine_risk: "GDPR: Up to €20M or 4% global turnover | DPDP: Up to ₹250 crore",
        violations: [
          { id: "v1", title: "No Data Protection Officer Appointed", description: "Processing biometric and health data (special categories) mandates a DPO under GDPR Art. 37. DPDP Act §13 requires a Grievance Officer.", regulation: "GDPR Art. 37 / DPDP §13", framework: "Both", severity: "critical", category: "Accountability", remediation: "Immediately appoint a qualified DPO. Register with relevant supervisory authorities. Publish DPO contact details in privacy notice.", timeline: "immediate" },
          { id: "v2", title: "Outdated Privacy Policy (2022)", description: "Privacy notice must reflect current processing activities. 2022 policy predates DPDP Act and misses several GDPR Art. 13/14 requirements.", regulation: "GDPR Art. 13-14 / DPDP §5", framework: "Both", severity: "critical", category: "Transparency", remediation: "Rewrite privacy notice covering all data types, legal bases, retention periods, and rights. Include specific DPDP Act 2023 disclosures.", timeline: "immediate" },
          { id: "v3", title: "Biometric Data Processed Without Explicit Consent", description: "Biometric data is special category under GDPR and sensitive personal data under DPDP. Requires explicit informed consent with granular controls.", regulation: "GDPR Art. 9 / DPDP §10", framework: "Both", severity: "critical", category: "Data Processing", remediation: "Obtain fresh explicit consent for biometric processing. Implement consent withdrawal mechanism. Offer non-biometric alternatives.", timeline: "immediate" },
          { id: "v4", title: "No Data Retention Schedule", description: "No documented retention periods for any data category. Data may be stored indefinitely violating storage limitation principles.", regulation: "GDPR Art. 5(1)(e) / DPDP §8(7)", framework: "Both", severity: "high", category: "Data Governance", remediation: "Define retention periods for each data category. Implement automated deletion workflows. Document and publish retention schedule.", timeline: "30days" },
          { id: "v5", title: "Cookie Consent Non-Compliant", description: "Basic popup without granular controls violates GDPR consent requirements. Pre-ticked boxes and bundled consent are prohibited.", regulation: "GDPR Art. 7 / ePrivacy Directive", framework: "GDPR", severity: "high", category: "Consent", remediation: "Implement a CMP (Consent Management Platform) with category-level granularity. No pre-ticked boxes. Easy withdrawal mechanism.", timeline: "30days" },
          { id: "v6", title: "Missing Data Processing Agreements with AWS, Razorpay, Mailchimp", description: "No evidence of signed DPAs with cloud/payment/marketing processors handling personal data.", regulation: "GDPR Art. 28 / DPDP §9", framework: "Both", severity: "high", category: "Vendor Management", remediation: "Execute DPAs with all processors. Review Standard Contractual Clauses for international transfers. Maintain processor register.", timeline: "30days" },
        ],
        compliant_areas: [
          { title: "Multi-region Data Storage", description: "Using AWS Mumbai for Indian data and Frankfurt for EU data shows awareness of data residency requirements.", framework: "Both" },
          { title: "Payment Processing via Regulated Provider", description: "Using Razorpay (RBI-regulated) for payment processing is appropriate.", framework: "DPDP" },
        ],
        remediation_roadmap: [
          { phase: "Phase 1 - Immediate Actions (0-30 days)", actions: ["Appoint DPO/Grievance Officer", "Update Privacy Notice", "Obtain explicit consent for biometric data", "Begin processor agreement reviews"] },
          { phase: "Phase 2 - Short Term (30-90 days)", actions: ["Implement Consent Management Platform", "Create data retention schedule", "Execute all DPAs", "Conduct staff privacy training", "Document all processing activities (ROPA)"] },
          { phase: "Phase 3 - Long Term (90+ days)", actions: ["Implement automated retention enforcement", "Conduct DPIA for high-risk processing", "Establish breach response procedures", "Annual compliance review cycle"] },
        ],
        key_recommendations: [
          "Appoint a qualified DPO and Grievance Officer immediately",
          "Commission a full Data Protection Impact Assessment (DPIA) for biometric processing",
          "Implement a Consent Management Platform with granular controls",
          "Establish a comprehensive Data Retention and Deletion Policy",
          "Create a formal Incident Response and Breach Notification procedure",
        ]
      };
      setProgress(100);
      setCurrentTask("Demo results loaded");
      await new Promise(r => setTimeout(r, 600));
      setResults(demo);
      setAuditResults(demo);
      setStep(3);
    }
  };

  const handleExport = async (format) => {
    try {
      addNotification(`Preparing ${format.toUpperCase()} export...`, "info");
      const response = await fetch(API_URLS.export(format), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results)
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

  const severityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#0ea5e9", low: "#10b981" };

  const ScoreRing = ({ score, color, label, size = 110 }) => {
    if (score === null) return null;
    const r = 42, c = 2 * Math.PI * r;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${(score / 100) * c} ${c - (score / 100) * c}`}
              strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color }}>{score}</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="audit-page">
      {step === 1 && (
        <div className="audit-config">
          <div className="page-header">
            <h2 className="page-title">AI Audit Engine</h2>
            <p className="page-sub">Configure and run a comprehensive privacy compliance audit powered by AI</p>
          </div>

          <div className="config-grid">
            <div className="config-main">
              <div className="card">
                <div className="section-title">Organization Context</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  Provide details about your organization, data processing activities, current privacy infrastructure, and any specific concerns.
                </p>
                <textarea
                  value={orgContext}
                  onChange={e => setOrgContext(e.target.value)}
                  placeholder="Describe your organization, data types, processing activities, current privacy measures..."
                  style={{ width: "100%", height: 280, padding: 14, resize: "vertical", lineHeight: 1.6 }}
                />
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  {orgContext.length} characters · More detail = better audit results
                </div>
              </div>

              <div className="card">
                <div className="section-title">Audit Categories</div>
                <div className="categories-grid">
                  {AUDIT_CATEGORIES.map(cat => (
                    <label key={cat.id} className={`cat-checkbox ${selectedCategories.includes(cat.id) ? "checked" : ""}`}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        style={{ display: "none" }}
                      />
                      <span className="cat-check-icon">{selectedCategories.includes(cat.id) ? "✓" : cat.icon}</span>
                      <span className="cat-check-label">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="config-sidebar">
              <div className="card">
                <div className="section-title">Compliance Framework</div>
                {[
                  { val: "gdpr", label: "GDPR (EU)", desc: "General Data Protection Regulation", color: "#0ea5e9" },
                  { val: "dpdp", label: "DPDP Act 2023", desc: "India's Digital Personal Data Protection Act", color: "#10b981" },
                  { val: "both", label: "Both Frameworks", desc: "Comprehensive dual-framework audit", color: "#8b5cf6" },
                ].map(f => (
                  <label key={f.val} className={`fw-option ${framework === f.val ? "selected" : ""}`}
                    style={{ borderColor: framework === f.val ? f.color : "var(--border)" }}>
                    <input type="radio" name="framework" value={f.val}
                      checked={framework === f.val} onChange={() => setFramework(f.val)}
                      style={{ display: "none" }} />
                    <div className="fw-radio" style={{ borderColor: framework === f.val ? f.color : "var(--border-bright)" }}>
                      {framework === f.val && <div style={{ width: 8, height: 8, background: f.color, borderRadius: "50%" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: framework === f.val ? f.color : "var(--text-primary)" }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="card">
                <div className="section-title">What AI Analyzes</div>
                {[
                  "Legal basis for all processing",
                  "Consent validity and mechanisms",
                  "Data subject rights implementation",
                  "Retention and deletion practices",
                  "Security and breach procedures",
                  "Third-party processor compliance",
                  "Documentation and accountability",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ color: "var(--accent-green)", fontSize: 12, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 15 }}
                onClick={runAudit}>
                ⟳ Run AI Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="audit-running">
          <div className="running-card">
            <div className="running-icon">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(14,165,233,0.2)" strokeWidth="3" />
                <circle cx="30" cy="30" r="28" fill="none" stroke="#0ea5e9" strokeWidth="3"
                  strokeDasharray={`${progress * 1.76} 176`} strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.5s ease" }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
                  style={{ fontFamily: "var(--font-display)", fontSize: 14, fill: "#0ea5e9", fontWeight: 700 }}>
                  {progress}%
                </text>
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)", margin: "20px 0 8px" }}>
              AI Audit In Progress
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
              Analyzing your organization against {framework === "both" ? "GDPR & DPDP Act" : framework.toUpperCase()}
            </p>

            <div className="running-task">
              <span className="task-dot" />
              {currentTask}
            </div>

            {streamedText && (
              <div className="stream-preview">
                <div className="section-title">AI Analysis Stream</div>
                <pre style={{ fontSize: 11, color: "var(--accent-cyan)", overflow: "hidden", maxHeight: 200, opacity: 0.7 }}>
                  {streamedText.slice(-800)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && results && (
        <div className="audit-results">
          <div className="results-header">
            <div>
              <div className="page-title">Audit Results</div>
              <p className="page-sub">AI-generated compliance analysis · {new Date().toLocaleDateString("en-IN")}</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => handleExport("pdf")}>⬇ Export PDF</button>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>⟳ New Audit</button>
              <span className={`badge ${results.risk_level === "Critical" || results.risk_level === "High" ? "badge-red" : "badge-amber"}`} style={{ fontSize: 13, padding: "8px 16px" }}>
                {results.risk_level} Risk
              </span>
            </div>
          </div>

          {/* Score Cards */}
          <div className="card scores-overview">
            <div className="scores-row" style={{ justifyContent: "flex-start", gap: 48 }}>
              <ScoreRing score={results.overall_score} color="#0ea5e9" label="OVERALL" />
              {results.gdpr_score !== null && <ScoreRing score={results.gdpr_score} color="#10b981" label="GDPR" />}
              {results.dpdp_score !== null && <ScoreRing score={results.dpdp_score} color="#f59e0b" label="DPDP ACT" />}
              <div style={{ flex: 1, paddingLeft: 32, borderLeft: "1px solid var(--border)" }}>
                <div className="section-title" style={{ marginBottom: 12 }}>Executive Summary</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
                  {results.executive_summary}
                </p>
                {results.dpo_required && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>
                    <span style={{ color: "#ef4444", fontSize: 16 }}>⚠</span>
                    <span style={{ fontSize: 12, color: "#fca5a5" }}>DPO/Grievance Officer appointment is MANDATORY for your organization</span>
                  </div>
                )}
                {results.estimated_fine_risk && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--accent-amber)" }}>⚠ Fine Exposure:</strong> {results.estimated_fine_risk}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="results-grid">
            {/* Violations */}
            <div className="card">
              <div className="card-header">
                <div className="section-title">Violations & Gaps ({results.violations.length})</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {results.violations.map(v => (
                  <div key={v.id} className="result-violation">
                    <div className="result-violation-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ width: 3, height: "100%", minHeight: 40, background: severityColor[v.severity], borderRadius: 2 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{v.title}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span className="tag">{v.category}</span>
                            <span className="tag" style={{ borderColor: "rgba(139,92,246,0.3)", color: "var(--accent-purple)" }}>{v.framework}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.regulation}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <span className="badge" style={{ background: `${severityColor[v.severity]}15`, color: severityColor[v.severity], border: `1px solid ${severityColor[v.severity]}40` }}>
                          {v.severity}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-display)" }}>
                          {v.timeline}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.6 }}>{v.description}</p>
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-green)", marginBottom: 4 }}>REMEDIATION</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{v.remediation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Compliant Areas */}
              {results.compliant_areas?.length > 0 && (
                <div className="card">
                  <div className="section-title">Compliant Areas ✓</div>
                  {results.compliant_areas.map((a, i) => (
                    <div key={i} style={{ marginBottom: 12, padding: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-green)", marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.description}</div>
                      <span className="badge badge-green" style={{ marginTop: 6 }}>{a.framework}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Roadmap */}
              <div className="card">
                <div className="section-title">Remediation Roadmap</div>
                {results.remediation_roadmap?.map((phase, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ["#ef4444", "#f59e0b", "#0ea5e9"][i], marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{i + 1}</span>
                      {phase.phase}
                    </div>
                    {phase.actions.map((action, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, paddingLeft: 26 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 12, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{action}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Key Recommendations */}
              <div className="card">
                <div className="section-title">Key Recommendations</div>
                {results.key_recommendations?.map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--accent-blue)", background: "rgba(14,165,233,0.1)", padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 1 }}>
                      0{i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audit-page { display: flex; flex-direction: column; gap: 24px; }
        .page-header { margin-bottom: 4px; }
        .page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.03em; }
        .page-sub { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

        .config-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .config-main, .config-sidebar { display: flex; flex-direction: column; gap: 20px; }

        .categories-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }

        .cat-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .cat-checkbox.checked { border-color: rgba(14,165,233,0.4); background: rgba(14,165,233,0.05); }
        .cat-checkbox:hover { border-color: var(--border-bright); }
        .cat-check-icon { font-size: 14px; width: 20px; text-align: center; }
        .cat-checkbox.checked .cat-check-icon { color: var(--accent-blue); }
        .cat-check-label { font-size: 12px; color: var(--text-secondary); }
        .cat-checkbox.checked .cat-check-label { color: var(--text-primary); }

        .fw-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .fw-radio {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .audit-running {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .running-card {
          text-align: center;
          max-width: 600px;
          width: 100%;
          padding: 48px;
          background: var(--bg-card);
          border: 1px solid var(--border-bright);
          border-radius: var(--radius);
        }

        .running-icon { display: flex; justify-content: center; }

        .running-task {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .task-dot {
          width: 8px; height: 8px;
          background: var(--accent-blue);
          border-radius: 50%;
          animation: pulse 1s infinite;
          flex-shrink: 0;
        }

        .stream-preview {
          text-align: left;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-top: 8px;
        }

        .audit-results { display: flex; flex-direction: column; gap: 20px; }
        .results-header { display: flex; align-items: center; justify-content: space-between; }
        .scores-overview { }
        .scores-row { display: flex; align-items: center; }

        .results-grid { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }

        .result-violation {
          padding: 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: border-color 0.2s;
        }

        .result-violation:hover { border-color: var(--border-bright); }
        .result-violation-header { display: flex; gap: 12px; align-items: flex-start; }
      `}</style>
    </div>
  );
}
