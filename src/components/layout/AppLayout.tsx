"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileSidebar } from "./MobileSidebar";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSidebarOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <AppHeader onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
