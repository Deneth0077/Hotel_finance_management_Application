import React from "react";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon | React.ReactNode;
  description?: string;
  className?: string;
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, description, className }: MetricCardProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If it's already a rendered element like <DollarSign />
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    // If it's a component like DollarSign, we need to render it
    const IconComponent = Icon as any;
    try {
      return <IconComponent className="h-4 w-4 text-muted-foreground" />;
    } catch (e) {
      // Fallback in case casting fails or it's a primitive
      return Icon as React.ReactNode;
    }
  };

  return (
    <div className={`rounded-xl bg-card p-4 md:p-5 shadow-card border overflow-hidden ${className || ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</h3>
        <div className="rounded-lg bg-muted p-2">
          {renderIcon()}
        </div>
      </div>
      <p className="mt-2 text-xl md:text-2xl font-black tabular-nums tracking-tighter truncate" title={value}>{value}</p>
      {change && (
        <p className={`mt-1 text-xs font-medium ${
          changeType === "positive" ? "text-secondary" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
        }`}>
          {change}
        </p>
      )}
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
