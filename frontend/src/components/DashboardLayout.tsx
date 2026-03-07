import { ReactNode } from "react";
import { TopNavigation } from "@/components/TopNavigation";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background selection:bg-primary/20">
      <TopNavigation />
      <main className="flex-1 p-4 md:p-8 pt-24 container mx-auto">
        {children}
      </main>
    </div>
  );
}

