import { useState } from "react";

const SAMPLE_POLICY = `Privacy Policy — TechFlow Solutions Pvt. Ltd.
Last Updated: January 2022

1. Information We Collect
We collect information you provide when you use our services, including your name, email address, and usage data. We may also collect information from third-party services.

2. How We Use Your Information
We use your information to provide and improve our services, to communicate with you, and for marketing purposes. We may share your information with our partners and service providers.

3. Data Sharing
We may share your personal information with third parties for business purposes. We require these parties to keep your information confidential.

4. Security
We implement security measures to protect your information. However, no security measures are completely secure.

5. Your Rights
You may have certain rights regarding your personal information depending on your location. Contact us to exercise these rights.

6. Contact Us
Email: privacy@techflow.com`;

export default function PolicyAnalyzer({ addNotification }) {
  const [policyText, setPolicyText] = useState(SAMPLE_POLICY);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzePolicy = async () => {
    if (!policyText.trim()) {
      addNotification("Please paste a privacy policy to analyze", "error");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    const prompt = `You are a privacy law expert specializing in GDPR and India's DPDP Act 2023. Analyze the following privacy policy and provide a detailed gap analysis.

PRIVACY POLICY TEXT:
${policyText}

Analyze against GDPR (Articles 12-14, 17, 20, 25, 28, 32, 33, 35) and DPDP Act 2023 (Sections 5-16).

Return ONLY valid JSON (no markdown fences):
{
  "overall_rating": "<Poor|Fair|Good|Excellent>",
  "readability_score": <number 0-10>,
  "gdpr_coverage": <number 0-100>,
  "dpdp_coverage": <number 0-100>,
  "summary": "<2-3 sentence summary of the policy quality>",
  "missing_elements": [
    {
      "element": "<element name>",
      "required_by": "<GDPR Art X / DPDP §Y>",
      "severity": "<critical|high|medium|low>",
      "suggestion": "<what should be added>"
    }
  ],
  "vague_clauses": [
    {
      "quote": "<problematic clause from the policy, max 20 words>",
      "issue": "<why this is problematic>",
      "fix": "<how to improve it>"
    }
  ],
  "good_practices": ["<what is done well>"],
  "rewrite_suggestions": [
    {
      "section": "<section name>",
      "issue": "<what's wrong>",
      "rewrite": "<suggested improved text>"
    }
  ]
}`;

    try {
      const response = await fetch("/api/policy/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_text: policyText
        })
      });
      const parsed = await response.json();
      setAnalysis(parsed);
      addNotification("Policy analysis complete!", "success");
    } catch (err) {
      // fallback
      const demo = {
        overall_rating: "Poor",
        readability_score: 5,
        gdpr_coverage: 28,
        dpdp_coverage: 15,
        summary: "This privacy policy is severely deficient and does not meet basic GDPR or DPDP Act 2023 requirements. It lacks legal bases for processing, specific retention periods, and detailed rights information. The language is vague and would not pass regulatory scrutiny.",
        missing_elements: [
          { element: "Legal Basis for Processing", required_by: "GDPR Art. 6 / DPDP §4", severity: "critical", suggestion: "List the specific legal basis (consent, legitimate interests, contract, legal obligation) for each processing activity." },
          { element: "Data Retention Periods", required_by: "GDPR Art. 13(2)(a) / DPDP §8(7)", severity: "critical", suggestion: "Specify exact retention periods for each category of personal data collected." },
          { element: "Grievance Officer Contact", required_by: "DPDP §13", severity: "critical", suggestion: "Designate and publish contact details of a Grievance Officer for Indian data principals." },
          { element: "Right to Data Portability", required_by: "GDPR Art. 20", severity: "high", suggestion: "Include explicit mention of the right to receive personal data in a machine-readable format." },
          { element: "Right to Erasure Details", required_by: "GDPR Art. 17 / DPDP §11", severity: "high", suggestion: "Clearly explain when and how data subjects can request erasure and any exceptions." },
          { element: "Cookie and Tracking Details", required_by: "GDPR Art. 13 / ePrivacy", severity: "medium", suggestion: "Add a dedicated section on cookie types, purposes, and how to manage preferences." },
        ],
        vague_clauses: [
          { quote: "We may share your information with our partners", issue: "Extremely vague — doesn't identify who 'partners' are or for what purpose.", fix: "List specific categories of recipients with purposes and applicable safeguards." },
          { quote: "We use your information to provide and improve our services", issue: "No specific purposes listed; 'improve our services' is too broad and may not constitute valid legal basis.", fix: "List each processing purpose with corresponding legal basis (e.g., 'We process your email to send transaction receipts under contract performance – Art. 6(1)(b) GDPR')." },
          { quote: "You may have certain rights regarding your personal information depending on your location", issue: "Conditional and non-committal. GDPR and DPDP rights are mandatory, not discretionary.", fix: "List all applicable rights clearly: access, rectification, erasure, portability, objection, restriction, and complaint rights with how to exercise each." },
        ],
        good_practices: [
          "Provides a privacy contact email address",
          "Mentions data security measures",
        ],
        rewrite_suggestions: [
          {
            section: "How We Use Your Information",
            issue: "No legal bases, vague purposes",
            rewrite: "We process your personal data for the following purposes: (1) Account Management: to create and manage your account [Legal basis: Contract – GDPR Art. 6(1)(b)]; (2) Service Delivery: to provide HR management features you've subscribed to [Legal basis: Contract]; (3) Marketing Communications: to send product updates with your consent [Legal basis: Consent – GDPR Art. 6(1)(a)]; (4) Legal Compliance: to meet our regulatory obligations [Legal basis: Legal obligation – GDPR Art. 6(1)(c)]."
          },
          {
            section: "Your Rights",
            issue: "Vague and conditional",
            rewrite: "Under GDPR and India's DPDP Act 2023, you have the right to: access your personal data; correct inaccurate data; request erasure; object to processing; request restriction; data portability (GDPR); withdraw consent at any time; lodge a complaint with your supervisory authority. To exercise any right, contact privacy@techflow.com. We will respond within 30 days (GDPR) / 30 days (DPDP Act)."
          }
        ]
      };
      setAnalysis(demo);
      addNotification("Analysis complete (demo mode)", "info");
    } finally {
      setAnalyzing(false);
    }
  };

  const severityColor = { critical: "#ef4444", high: "#f59e0b", medium: "#0ea5e9", low: "#10b981" };
  const ratingColor = { Poor: "#ef4444", Fair: "#f59e0b", Good: "#0ea5e9", Excellent: "#10b981" };

  return (
    <div className="policy-page">
      <div className="page-header">
        <h2 className="page-title">Privacy Policy Analyzer</h2>
        <p className="page-sub">Paste your privacy policy and AI will identify gaps, vague clauses, and provide rewrite suggestions</p>
      </div>

      <div className="policy-grid">
        <div className="policy-input-area">
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>Privacy Policy Text</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }}
                  onClick={() => setPolicyText(SAMPLE_POLICY)}>
                  Load Sample
                </button>
                <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }}
                  onClick={() => setPolicyText("")}>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={policyText}
              onChange={e => setPolicyText(e.target.value)}
              placeholder="Paste your privacy policy text here..."
              style={{ flex: 1, minHeight: 400, padding: 14, resize: "none", lineHeight: 1.7, fontSize: 13 }}
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{policyText.split(" ").length} words</span>
              <button className="btn btn-primary" onClick={analyzePolicy} disabled={analyzing}
                style={{ opacity: analyzing ? 0.7 : 1 }}>
                {analyzing ? "⟳ Analyzing..." : "⊞ Analyze with AI"}
              </button>
            </div>
          </div>
        </div>

        <div className="analysis-results">
          {!analysis && !analyzing && (
            <div className="card empty-state">
              <div style={{ fontSize: 48, marginBottom: 16 }}>⊞</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Paste a policy and click Analyze
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                AI will check for GDPR & DPDP Act compliance gaps, vague language, and missing sections
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card empty-state">
              <div className="analyze-spinner" />
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 16 }}>
                AI is analyzing your policy...
              </div>
            </div>
          )}

          {analysis && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Overview */}
              <div className="card">
                <div className="section-title">Analysis Overview</div>
                <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: ratingColor[analysis.overall_rating], fontFamily: "var(--font-display)" }}>
                          {analysis.overall_rating}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>OVERALL RATING</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981", fontFamily: "var(--font-display)" }}>
                          {analysis.gdpr_coverage}%
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>GDPR COVERAGE</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: 12, background: "var(--bg-secondary)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b", fontFamily: "var(--font-display)" }}>
                          {analysis.dpdp_coverage}%
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>DPDP COVERAGE</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{analysis.summary}</p>
                  </div>
                </div>

                {analysis.good_practices?.length > 0 && (
                  <div style={{ padding: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-green)", marginBottom: 6 }}>WHAT'S GOOD</div>
                    {analysis.good_practices.map((p, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, display: "flex", gap: 6 }}>
                        <span style={{ color: "var(--accent-green)" }}>✓</span> {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Elements */}
              <div className="card">
                <div className="section-title">Missing Required Elements</div>
                {analysis.missing_elements?.map((el, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, borderLeft: `3px solid ${severityColor[el.severity]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{el.element}</span>
                      <span className="badge" style={{ background: `${severityColor[el.severity]}15`, color: severityColor[el.severity], border: `1px solid ${severityColor[el.severity]}40` }}>
                        {el.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--accent-purple)", marginBottom: 6, fontFamily: "var(--font-display)" }}>{el.required_by}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{el.suggestion}</div>
                  </div>
                ))}
              </div>

              {/* Vague Clauses */}
              <div className="card">
                <div className="section-title">Problematic Clauses</div>
                {analysis.vague_clauses?.map((vc, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: 12, background: "var(--bg-secondary)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6 }}>
                    <div style={{ fontStyle: "italic", fontSize: 12, color: "var(--accent-amber)", marginBottom: 6, padding: "6px 10px", background: "rgba(245,158,11,0.05)", borderRadius: 4 }}>
                      "{vc.quote}"
                    </div>
                    <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 6 }}>⚠ {vc.issue}</div>
                    <div style={{ fontSize: 12, color: "var(--accent-green)" }}>✓ {vc.fix}</div>
                  </div>
                ))}
              </div>

              {/* Rewrite Suggestions */}
              {analysis.rewrite_suggestions?.length > 0 && (
                <div className="card">
                  <div className="section-title">AI Rewrite Suggestions</div>
                  {analysis.rewrite_suggestions.map((rw, i) => (
                    <div key={i} style={{ marginBottom: 16, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Section: {rw.section}</div>
                      <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>Issue: {rw.issue}</div>
                      <div style={{ padding: 12, background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-blue)", marginBottom: 6, fontFamily: "var(--font-display)" }}>SUGGESTED REWRITE</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>{rw.rewrite}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .policy-page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { margin-bottom: 4px; }
        .page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.03em; }
        .page-sub { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }
        .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start; }
        .policy-input-area { display: flex; flex-direction: column; height: 100%; }
        .analysis-results { }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; color: var(--text-muted); }
        .analyze-spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
