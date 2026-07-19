import type { Metadata } from "next";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Paperfork demo workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
