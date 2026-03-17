"use client";

import { Package, Plus, CheckCircle2 } from "lucide-react";

const packages = [
  { 
    id: 1, 
    name: "7-Day Rejuvenate", 
    days: 7, 
    price: 1200, 
    includes: ["Suite Room", "2x Massage", "Hydrotherapy", "Daily Wellness Diet"] 
  },
  { 
    id: 2, 
    name: "14-Day Deep Detox", 
    days: 14, 
    price: 2400, 
    includes: ["Deluxe Room", "Daily Acupuncture", "Intensive Detox Plan", "Yoga Sessions"] 
  },
  { 
    id: 3, 
    name: "3-Day Quick Relax", 
    days: 3, 
    price: 450, 
    includes: ["Standard Room", "1x Spa Treatment", "Healthy Breakfast"] 
  },
];

export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Wellness Packages</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Package
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex flex-col rounded-xl bg-card p-6 shadow-card border border-border/50">
            <h3 className="text-xl font-bold">{pkg.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{pkg.days} Days Stay</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">${pkg.price}</span>
              <span className="text-xs text-muted-foreground">/package</span>
            </div>
            
            <ul className="mt-6 space-y-3 flex-1">
              {pkg.includes.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <button className="mt-8 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Customize Package
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
