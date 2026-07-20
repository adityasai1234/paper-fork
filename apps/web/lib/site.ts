export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      return "https://paperfork.getkarpathy.com";
    }
    return "http://localhost:3000";
  }
  return url.replace(/\/$/, "");
}

export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "paperfork@getkarpathy.com";
