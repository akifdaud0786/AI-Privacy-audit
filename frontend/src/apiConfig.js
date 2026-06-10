const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const API_URLS = {
  auditStream: `${API_BASE}/api/audit/stream`,
  policyAnalyze: `${API_BASE}/api/policy/analyze`,
  chat: `${API_BASE}/api/chat`,
  export: (format) => `${API_BASE}/api/export/${format}`,
};
