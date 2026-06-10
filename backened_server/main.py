"""
PrivacyAudit AI — Backend Server (Groq Edition)
FastAPI application providing REST API endpoints for the compliance audit system.
Handles Groq API calls server-side for ultra-fast inference.
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from groq import Groq
from fpdf import FPDF
import json
import os
import uuid
import io
import csv
from datetime import datetime

app = FastAPI(
    title="PrivacyAudit AI API",
    description="AI-powered GDPR & DPDP Act compliance audit system",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY is not set.")
client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.3-70b-versatile"

# In-memory store
audit_store = {}


# ─── Pydantic Models ────────────────────────────────────────────────────────────

class AuditRequest(BaseModel):
    org_context: str
    framework: Literal["gdpr", "dpdp", "both"] = "both"
    categories: List[str] = []


class PolicyAnalysisRequest(BaseModel):
    policy_text: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[dict] = []
    audit_context: Optional[dict] = None


# ─── Helper Functions ────────────────────────────────────────────────────────────

def build_audit_prompt(request: AuditRequest) -> str:
    framework_str = {"gdpr": "GDPR", "dpdp": "India's DPDP Act 2023", "both": "both GDPR and DPDP Act 2023"}[request.framework]
    return f"""You are a senior privacy compliance auditor. Perform a detailed audit for {framework_str}.

ORGANIZATION CONTEXT:
{request.org_context}

AUDIT SCOPE: {', '.join(request.categories) if request.categories else 'All categories'}

Provide a detailed audit in this exact JSON structure:
{{
  "overall_score": <0-100>,
  "gdpr_score": <0-100 or null>,
  "dpdp_score": <0-100 or null>,
  "executive_summary": "<summary>",
  "risk_level": "<Critical|High|Medium|Low>",
  "violations": [{{ "id": "<id>", "title": "<title>", "description": "<desc>", "regulation": "<ref>", "framework": "<GDPR|DPDP|Both>", "severity": "<critical|high|medium|low>", "category": "<cat>", "remediation": "<steps>", "timeline": "<30days|90days|etc>" }}],
  "compliant_areas": [{{ "title": "<title>", "description": "<desc>", "framework": "<GDPR|DPDP|Both>" }}],
  "remediation_roadmap": [{{ "phase": "Phase 1", "actions": ["<action>"] }}],
  "key_recommendations": ["<rec>"],
  "dpo_required": <true|false>,
  "estimated_fine_risk": "<fine text>",
  "compliance_score_breakdown": {{
    "data_collection": <0-100>,
    "consent_management": <0-100>,
    "data_subject_rights": <0-100>,
    "security_measures": <0-100>
  }}
}}

Return ONLY valid JSON."""

def build_policy_prompt(request: PolicyAnalysisRequest) -> str:
    return f"""Analyze this privacy policy for GDPR and DPDP gaps.
PRIVACY POLICY:
{request.policy_text}

Return ONLY valid JSON:
{{
  "overall_rating": "<Poor|Fair|Good|Excellent>",
  "readability_score": <1-10>,
  "gdpr_coverage": <0-100>,
  "dpdp_coverage": <0-100>,
  "summary": "<summary>",
  "missing_elements": [{{ "element": "<name>", "required_by": "<ref>", "severity": "<severity>", "suggestion": "<fix>" }}],
  "vague_clauses": [{{ "quote": "<text>", "issue": "<why>", "fix": "<how>" }}],
  "good_practices": ["<good>"],
  "rewrite_suggestions": [{{ "section": "<sec>", "issue": "<problem>", "rewrite": "<text>" }}]
}}"""


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "Groq Llama 3.3"}


@app.post("/api/audit/run")
async def run_audit(request: AuditRequest):
    try:
        prompt = build_audit_prompt(request)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audit/stream")
async def stream_audit(request: AuditRequest):
    async def generate():
        try:
            prompt = build_audit_prompt(request)
            stream = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                temperature=0.0
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'text': chunk.choices[0].delta.content})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            print(f"Stream Error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/policy/analyze")
async def analyze_policy(request: PolicyAnalysisRequest):
    try:
        prompt = build_policy_prompt(request)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def compliance_chat(request: ChatRequest):
    try:
        system = "You are a privacy expert for GDPR and DPDP Act. Be concise."
        if request.audit_context:
            system += f" Context: User score {request.audit_context.get('overall_score')}."

        messages = [{"role": "system", "content": system}]
        for m in request.conversation_history:
            messages.append({"role": m["role"], "content": m["content"]})
        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export/pdf")
async def export_pdf(audit_data: dict):
    try:
        pdf = FPDF()
        pdf.set_margins(15, 15, 15)
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "PrivacyAudit AI - Compliance Report", ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align="C")
        pdf.ln(10)

        def clean(txt):
            if not txt: return "N/A"
            txt = str(txt).replace("₹", "INR ").replace("€", "EUR ")
            # Split very long strings that might crash the PDF generator
            words = txt.split(" ")
            safe_words = [w if len(w) < 40 else w[:37] + "..." for w in words]
            return " ".join(safe_words).encode('latin-1', 'ignore').decode('latin-1')

        # Overview
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_x(15)
        pdf.cell(180, 10, "Executive Summary", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.set_x(15)
        pdf.multi_cell(180, 7, clean(audit_data.get("executive_summary")))
        pdf.ln(5)

        pdf.set_font("Helvetica", "B", 12)
        pdf.set_x(15)
        pdf.cell(180, 8, f"Overall Score: {audit_data.get('overall_score', 'N/A')}/100", ln=True)
        pdf.set_x(15)
        pdf.cell(180, 8, f"Risk Level: {clean(audit_data.get('risk_level'))}", ln=True)
        pdf.ln(5)

        # Violations
        violations = audit_data.get("violations", [])
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_x(15)
        pdf.cell(180, 10, f"Violations Found ({len(violations)})", ln=True)
        pdf.ln(2)
        
        for v in violations:
            pdf.set_font("Helvetica", "B", 11)
            title = f"[{str(v.get('severity', 'LOW')).upper()}] {v.get('title', 'Violation')}"
            pdf.set_x(15)
            pdf.multi_cell(180, 8, clean(title))
            
            pdf.set_font("Helvetica", "I", 9)
            meta = f"Regulation: {v.get('regulation', 'N/A')} | Category: {v.get('category', 'N/A')}"
            pdf.set_x(15)
            pdf.cell(180, 6, clean(meta), ln=True)
            
            pdf.set_font("Helvetica", "", 10)
            pdf.set_x(15)
            pdf.multi_cell(180, 6, clean(v.get("description", "")))
            
            pdf.set_text_color(16, 120, 80)
            rem_text = f"Remediation: {clean(v.get('remediation', ''))}"
            pdf.set_x(15)
            pdf.multi_cell(180, 6, rem_text)
            pdf.set_text_color(0, 0, 0)
            pdf.ln(6)

        pdf_bytes = bytes(pdf.output())
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf", 
            headers={"Content-Disposition": "attachment; filename=privacy_audit_report.pdf"}
        )
    except Exception as e:
        print(f"PDF Export Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export/csv")
async def export_csv(audit_data: dict):
    try:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Type", "Title", "Severity", "Regulation", "Category", "Description", "Remediation"])
        
        for v in audit_data.get("violations", []):
            writer.writerow([
                "Violation",
                v.get("title"),
                v.get("severity"),
                v.get("regulation"),
                v.get("category"),
                v.get("description"),
                v.get("remediation")
            ])
            
        return Response(content=output.getvalue(), media_type="text/csv",
                        headers={"Content-Disposition": "attachment; filename=privacy_audit_data.csv"})
    except Exception as e:
        print(f"CSV Export Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
