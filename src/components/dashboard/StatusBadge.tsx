import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "info" | "neutral" | "destructive";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-gray-100 text-gray-700",
  destructive: "bg-red-100 text-red-800",
};

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variantStyles[variant], className)}>
      {label}
    </span>
  );
}
