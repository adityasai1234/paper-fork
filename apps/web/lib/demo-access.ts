export const DEMO_ACCESS_COOKIE = "paperfork_demo";

/** Comma-separated mock passwords from env (hand out to demo users). */
export function getDemoPasswords(): string[] {
  const raw =
    process.env.DEMO_PASSWORDS ?? "paperfork-demo,demopass8,try-paperfork";
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function isValidDemoPassword(password: string): boolean {
  const trimmed = password.trim();
  if (!trimmed) return false;
  return getDemoPasswords().includes(trimmed);
}
