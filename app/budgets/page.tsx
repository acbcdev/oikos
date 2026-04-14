import { SidebarInset } from "@/components/ui/sidebar";
import { BudgetsLayout } from "@/components/dashboard/budgets/budgets-layout";

export default function BudgetsPage() {
  return (
    <SidebarInset className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
      <BudgetsLayout />
    </SidebarInset>
  );
}
