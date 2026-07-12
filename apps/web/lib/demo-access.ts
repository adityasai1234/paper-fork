export const DEMO_ACCESS_COOKIE = "paperfork_demo";

export function getDemoEmail(): string {
  return process.env.DEMO_EMAIL ?? "admin@gmail.com";
}

export function getDemoPassword(): string {
  return process.env.DEMO_PASSWORD ?? "pass1234";
}

export function isValidDemoLogin(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  if (!normalizedEmail || !normalizedPassword) return false;
  return (
    normalizedEmail === getDemoEmail().trim().toLowerCase() &&
    normalizedPassword === getDemoPassword()
  );
}
