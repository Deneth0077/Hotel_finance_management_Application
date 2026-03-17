"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { toggleSidebar } from "@/store/features/uiSlice";
import { 
  LayoutDashboard, CalendarCheck, Users, BedDouble, 
  Heart, Hotel, Package, DollarSign, UtensilsCrossed, 
  Boxes, UserCog, BarChart3, Settings, Sparkles,
  Landmark, ChevronLeft, ChevronRight, Shield
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Bookings", path: "/bookings", icon: CalendarCheck },
  { title: "Guests", path: "/guests", icon: Users },
  { title: "Rooms", path: "/rooms", icon: BedDouble },
  { title: "Treatments", path: "/treatments", icon: Heart },
  { title: "Packages", path: "/packages", icon: Package },
  { title: "Finance", path: "/finance", icon: DollarSign },
  { title: "Loans & Leasing", path: "/loans", icon: Landmark },
  { title: "Kitchen", path: "/kitchen", icon: UtensilsCrossed },
  { title: "Inventory", path: "/inventory", icon: Boxes },
  { title: "Assets", path: "/assets", icon: Sparkles },
  { title: "Staff & Salary", path: "/staff", icon: UserCog },
  { title: "Profiles", path: "/profiles", icon: Shield },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-card/80 backdrop-blur-xl lg:flex transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className={`flex h-16 items-center gap-2 px-6 relative ${!isOpen && "justify-center"}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
          <Hotel className="h-4 w-4 text-primary-foreground" />
        </div>
        {isOpen && <span className="text-lg font-bold tracking-tight text-foreground animate-in fade-in duration-500">LuxeLedger</span>}
        
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground shadow-sm transition-transform hover:scale-110"
        >
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={!isOpen ? item.title : ""}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${!isOpen && "justify-center"}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {isOpen && <span className="animate-in slide-in-from-left-2 duration-300">{item.title}</span>}
              {!isOpen && isActive && <div className="absolute right-0 h-4 w-1 bg-primary rounded-l-full" />}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        {isOpen ? (
          <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              Admin
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Property Owner</p>
              <p className="text-[10px] text-muted-foreground mt-1 underline cursor-pointer">View Profile</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
             <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-4 w-4" />
             </div>
          </div>
        )}
      </div>
    </aside>
  );
}
