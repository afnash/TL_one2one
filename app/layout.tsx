import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LMSProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneToOne — Modern 1-on-1 Teaching & Learning Platform",
  description: "Next-generation 1-to-1 collaborative teaching platform with infinite whiteboards, individual student workspaces, assignments and instant session reporting.",
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
      <body className="min-h-full flex flex-col bg-[#fbfbfd] text-slate-900">
        <LMSProvider>{children}</LMSProvider>
      </body>
    </html>
  );
}
