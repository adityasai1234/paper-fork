const DEFAULT_APP_URL = "https://www.getkarpathy.com";

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL).replace(/\/$/, "");
}

export function contactEmail(): string {
  return process.env.APP_CONTACT_EMAIL ?? "paperfork@getkarpathy.com";
}

export function auditPageUrl(auditId: string, sessionId?: string): string {
  const base = `${appBaseUrl()}/audits/${auditId}`;
  return sessionId ? `${base}?session=${sessionId}` : base;
}

export function reportPageUrl(auditId: string, sessionId?: string): string {
  const base = `${appBaseUrl()}/audits/${auditId}/report`;
  return sessionId ? `${base}?session=${sessionId}` : base;
}

export function appHostnameForSpeech(): string {
  try {
    return new URL(appBaseUrl()).hostname.replace(/\./g, " dot ");
  } catch {
    return "getkarpathy dot com";
  }
}
