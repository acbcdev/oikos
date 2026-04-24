import { SidebarInset } from "@/components/ui/sidebar";

export default function PlanPage() {
  return (
    <SidebarInset className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
      <div className="p-10">
        <h2 className="text-foreground font-display text-4xl font-bold tracking-tight uppercase leading-none">
          Plan
        </h2>
        <p className="text-muted-foreground text-sm mt-2 font-body">
          Unified financial plans — spending ceilings, savings targets, and FIRE.
        </p>
      </div>
    </SidebarInset>
  );
}
