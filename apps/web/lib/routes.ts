function withSession(path: string, sessionId?: string): string {
  if (!sessionId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}session=${encodeURIComponent(sessionId)}`;
}

export const routes = {
  login: () => "/login",
  signup: () => "/signup",
  home: () => "/",
  audits: () => "/audits",
  audit: (id: string, sessionId?: string) => withSession(`/audits/${id}`, sessionId),
  auditReport: (id: string, sessionId?: string) =>
    withSession(`/audits/${id}/report`, sessionId),
  research: () => "/research",
  researchRun: (id: string, sessionId?: string) => withSession(`/research/${id}`, sessionId),
  researchReport: (id: string, sessionId?: string) =>
    withSession(`/research/${id}/report`, sessionId),
};
