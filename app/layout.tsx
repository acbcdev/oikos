import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shell/app-sidebar";
import {
  SidebarOpenTrigger,
  ContentPadding,
} from "@/components/shell/sidebar-open-trigger";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Oikos",
  description: "Personal finance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${outfit.variable} antialiased`}
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
      >
        <TooltipProvider>
          <div className="min-h-screen flex bg-background">
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
                <SidebarOpenTrigger />
                <ContentPadding>{children}</ContentPadding>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
