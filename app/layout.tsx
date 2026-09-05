import type { Metadata } from "next";
import "./globals.css";
import { LMSProvider } from "@/lib/store";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fbfbfd] text-slate-900">
        <LMSProvider>{children}</LMSProvider>
      </body>
    </html>
  );
}
