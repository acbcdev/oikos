"use client";

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarOpenTrigger() {
  const { open } = useSidebar();

  if (open) return null;

  return (
    <SidebarTrigger
      size="icon-lg"
      className="fixed top-8 left-4 z-30 text-muted-foreground hover:text-foreground"
    />
  );
}

export function ContentPadding({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className={open ? "" : "pl-12"}>
      {children}
    </div>
  );
}
