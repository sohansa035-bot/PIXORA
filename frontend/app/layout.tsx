import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIXORA — Evidence-Aware Digital Image Forensics",
  description:
    "Don't just detect. Determine whether the evidence is sufficient to conclude. Investigate manipulation, provenance, metadata and visual anomalies through evidence-aware forensic intelligence.",
  keywords: [
    "digital image forensics",
    "image manipulation detection",
    "evidence sufficiency",
    "C2PA provenance",
    "content credentials",
    "error level analysis",
    "pixel forensics",
    "digital image forensics analysis",
  ],
  authors: [{ name: "PIXORA Forensic Systems" }],
  openGraph: {
    title: "PIXORA — Evidence-Aware Digital Image Forensics",
    description: "Every image leaves evidence. Investigate the evidence behind an image.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F0E8] text-[#111111] selection:bg-[#3155FF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
