"use client";

import { BarChart3, Download, TrendingUp, Calendar } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted">
            <Calendar className="h-4 w-4" /> This Month
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" /> Occupancy Trend
          </h3>
          <div className="mt-8 h-64 flex items-end gap-2">
            {[40, 65, 45, 90, 85, 60, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-secondary/20 rounded-t-md hover:bg-secondary/40 transition-all group relative" style={{ height: `${h}%` }}>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] px-2 py-1 rounded">
                  {h}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted-foreground font-medium">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-card border border-border/50">
          <h3 className="text-lg font-bold">Revenue Breakdown</h3>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Room Bookings</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Wellness Treatments</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-full bg-secondary rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kitchen & Dining</span>
                <span className="font-bold">10%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
