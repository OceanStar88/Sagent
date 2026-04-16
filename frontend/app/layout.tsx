import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import logo from "@/logo.png";

import "./tailwind.css";

const headingFont = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sagent",
  description: "Real-time AI voice call dashboard",
  icons: {
    icon: logo.src,
    shortcut: logo.src,
    apple: logo.src,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="text-[15px]" suppressHydrationWarning>
      <body className={`${headingFont.className} min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(10,132,208,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,120,212,0.08),transparent_24%),linear-gradient(180deg,#eceff3_0%,#e2e7ee_100%)] text-slate-900 antialiased dark:bg-[radial-gradient(circle_at_top_left,rgba(55,148,255,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(79,193,255,0.1),transparent_18%),linear-gradient(180deg,#20242b_0%,#181c22_100%)] dark:text-zinc-100`}>{children}</body>
    </html>
  );
}
