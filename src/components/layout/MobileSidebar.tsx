import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, CalendarCheck, Users, BedDouble, Heart, Hotel, Package, DollarSign, UtensilsCrossed, Boxes, UserCog, BarChart3, Settings } from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Bookings", path: "/bookings", icon: CalendarCheck },
  { title: "Guests", path: "/guests", icon: Users },
  { title: "Rooms", path: "/rooms", icon: BedDouble },
  { title: "Treatments", path: "/treatments", icon: Heart },
  { title: "Packages", path: "/packages", icon: Package },
  { title: "Finance", path: "/finance", icon: DollarSign },
  { title: "Kitchen", path: "/kitchen", icon: UtensilsCrossed },
  { title: "Inventory", path: "/inventory", icon: Boxes },
  { title: "Staff", path: "/staff", icon: UserCog },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Hotel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">LuxeLedger</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
