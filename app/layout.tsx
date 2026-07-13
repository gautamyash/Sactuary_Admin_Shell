import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name + " Admin",
    template: "%s | " + siteConfig.name + " Admin",
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const htmlClass = [inter.variable, geistMono.variable, "h-full", "antialiased"].join(" ");
  return (
    <html lang="en" suppressHydrationWarning className={htmlClass}>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
