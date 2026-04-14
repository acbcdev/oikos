"use client";

import { LayoutDashboard, Wallet, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { icon: Wallet, label: "Wallet", href: "/" },
  { icon: LayoutDashboard, label: "Analytics", href: "/analytics" },
  { icon: PieChart, label: "Budgets", href: "/budgets" },
  { icon: TrendingUp, label: "Portfolio", href: "/portfolio" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border/10 bg-card">
      {/* Logo */}
      <SidebarHeader className="p-6 ">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl flex items-center justify-center bg-primary text-primary-foreground font-display font-bold text-2xl shrink-0 shadow-neon">
            O
          </div>

          <span className="text-foreground font-display text-lg font-bold leading-tight tracking-wide uppercase">
            Oikos
          </span>
          <SidebarTrigger size={"icon-lg"} />
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map(({ icon: Icon, label, href }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href));

                return (
                  <SidebarMenuItem key={label} className="relative">
                    {isActive && (
                      <span className="absolute -left-0.1 top-1/2 -translate-y-1/2 w-1 h-5 z-20 bg-primary rounded-full" />
                    )}
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive}
                      className={`
                        flex items-center gap-3 px-6 py-4 rounded-full h-auto transition-all group relative
                        ${
                          isActive
                            ? "nav-item-active hover:bg-secondary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }
                      `}
                    >
                      <Icon
                        size={22}
                        className={`transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-primary" : ""}`}
                      />
                      <span className="font-display text-sm tracking-wider uppercase font-bold">
                        {label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
