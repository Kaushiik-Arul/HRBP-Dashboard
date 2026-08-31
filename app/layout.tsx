import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";

import "./globals.css";

const manrope = localFont({
  src: [
    { path: "../fonts/Manrope-ExtraLight.otf", weight: "200" },
    { path: "../fonts/Manrope-Light.otf", weight: "300" },
    { path: "../fonts/Manrope-Regular.otf", weight: "400" },
    { path: "../fonts/Manrope-Medium.otf", weight: "500" },
    { path: "../fonts/Manrope-SemiBold.otf", weight: "600" },
    { path: "../fonts/Manrope-Bold.otf", weight: "700" },
    { path: "../fonts/Manrope-ExtraBold.otf", weight: "800" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HR Workforce Intelligence",
  description: "A hardcoded workforce intelligence dashboard experience.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
