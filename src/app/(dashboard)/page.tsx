"use client";

import { CalendarCheck, Users, BedDouble, DollarSign, TrendingDown, Clock, LogIn, LogOut, Heart, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const revenueData: any[] = [];
const expenseData: any[] = [];
const occupancyData: any[] = [];

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

import { formatDualCurrency, formatLKR } from "@/lib/currency";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard icon={CalendarCheck} title="Today's Bookings" value={data?.metrics?.todayBookings || "0"} change="New reservations" changeType="positive" />
        <MetricCard icon={Users} title="Active Guests" value={data?.metrics?.activeGuests || "0"} change="In-house currently" changeType="neutral" />
        <MetricCard icon={BedDouble} title="Available Rooms" value={data?.metrics?.availableRooms || "0"} change="Ready for booking" changeType="positive" />
        <MetricCard icon={DollarSign} title="Today's Revenue" value={formatDualCurrency(data?.metrics?.todayRevenue || 0)} change="Paid bookings" changeType="positive" />
        <MetricCard icon={TrendingDown} title="Today's Expenses" value={formatLKR(0)} change="Pending tracking" changeType="neutral" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-card p-6 shadow-card">
          <h3 className="font-semibold">Monthly Revenue</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215.4 16.3% 46.9%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215.4 16.3% 46.9%)" tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card">
          <h3 className="font-semibold">Expense Breakdown</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-card shadow-card">
          <div className="border-b border-border p-6">
            <h3 className="font-semibold">Today's Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {/* Check-ins */}
            <div className="p-6">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <LogIn className="h-4 w-4 text-green-500" /> Upcoming Check-ins
              </h4>
              <div className="space-y-3">
                {data?.activity?.checkins?.length > 0 ? data.activity.checkins.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div><span className="font-medium">{c.guest}</span> <span className="text-muted-foreground">· Room {c.room}</span></div>
                    <span className="tabular-nums text-muted-foreground font-medium">{c.time}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground italic">No check-ins today</p>}
              </div>
            </div>
            {/* Check-outs */}
            <div className="p-6">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <LogOut className="h-4 w-4 text-orange-500" /> Upcoming Check-outs
              </h4>
              <div className="space-y-3">
                {data?.activity?.checkouts?.length > 0 ? data.activity.checkouts.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div><span className="font-medium">{c.guest}</span> <span className="text-muted-foreground">· Room {c.room}</span></div>
                    <span className="tabular-nums text-muted-foreground font-medium">{c.time}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground italic">No check-outs today</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Reminders */}
        <div className="rounded-xl bg-card p-6 shadow-card">
          <h3 className="font-semibold mb-4">Urgent Alerts</h3>
          <div className="space-y-3">
            {data?.metrics?.availableRooms < 5 && (
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 border border-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Low room availability! Only {data.metrics.availableRooms} rooms left.</p>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 border border-blue-100">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-sm text-blue-800">New shift rotation starting at 4:00 PM today.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
