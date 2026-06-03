import { SidebarInset } from "@/components/ui/sidebar";
import { TrackerLayout } from "@/components/tracker/tracker-layout";

export default function TrackerPage() {
  return (
    <SidebarInset className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
      <TrackerLayout />
    </SidebarInset>
  );
}
