import type { Metadata } from "next";
import "./globals.css";
import { LMSProvider } from "@/lib/store";
import { DM_Sans, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

// Outfit's round geometric forms match the sofiaa logo; DM Sans keeps body text calm.
const display = Outfit({ subsets: ["latin"], variable: "--font-display" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "sofiaa | Live one-to-one lessons that click",
  description: "Teach and learn face to face. Live video, a shared whiteboard, homework and progress reports, all in one calm place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", display.variable, body.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LMSProvider><TooltipProvider>{children}</TooltipProvider></LMSProvider>
      </body>
    </html>
  );
}
