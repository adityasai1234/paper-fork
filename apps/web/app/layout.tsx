import type { Metadata } from "next";
import { Alata, Lora } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const alata = Alata({ weight: "400", subsets: ["latin"], variable: "--font-alata" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Paperfork — Research audit intelligence",
  description: "Trace where a research paper and its repository diverge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${alata.variable} ${lora.variable}`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
