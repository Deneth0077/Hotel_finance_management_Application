"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Sparkles, Plus, Search, Filter, Home, Truck, Monitor, Wrench } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await fetch("/api/assets");
      return res.json();
    }
  });

  const assets = data?.assets || [];
  const summary = data?.summary || { totalValue: 0, equipmentValue: 0, propertyValue: 0, totalMaintenance: 0 };

  const filteredAssets = assets.filter((asset: any) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Prepare chart data
  const categoryData = Object.entries(
    assets.reduce((acc: any, asset: any) => {
      acc[asset.category] = (acc[asset.category] || 0) + asset.currentValue;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset & Property Management</h1>
          <p className="text-muted-foreground">Track valuation, maintenance, and depreciation of hotel property.</p>
        </div>
        <Link 
          href="/assets/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4" /> Add New Asset
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Asset Value" 
          value={`$${summary.totalValue.toLocaleString()}`} 
          icon={<Home className="h-4 w-4" />}
          description="Total hotel valuation"
        />
        <MetricCard 
          title="Property Value" 
          value={`$${summary.propertyValue.toLocaleString()}`} 
          icon={<Home className="h-4 w-4 text-blue-500" />}
          description="Land & Buildings"
        />
        <MetricCard 
          title="Equipment Value" 
          value={`$${summary.equipmentValue.toLocaleString()}`} 
          icon={<Monitor className="h-4 w-4 text-green-500" />}
          description="FF&E and Medical"
        />
        <MetricCard 
          title="Annual Maintenance" 
          value={`$${summary.totalMaintenance.toLocaleString()}`} 
          icon={<Wrench className="h-4 w-4 text-orange-500" />}
          description="Budgeted yearly cost"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Value by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 bg-background border rounded-lg text-sm outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Buildings">Buildings</option>
              <option value="Furniture">Furniture</option>
              <option value="Medical Equipment">Medical Equipment</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="p-4 font-medium text-muted-foreground">Asset Name</th>
                  <th className="p-4 font-medium text-muted-foreground">Category</th>
                  <th className="p-4 font-medium text-muted-foreground">Condition</th>
                  <th className="p-4 font-medium text-muted-foreground">Purchase Value</th>
                  <th className="p-4 font-medium text-muted-foreground">Current Value</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading assets...</td></tr>
                ) : filteredAssets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No assets found matching your criteria.</td></tr>
                ) : filteredAssets.map((asset: any) => (
                  <tr key={asset._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{asset.name}</td>
                    <td className="p-4 text-muted-foreground">{asset.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        asset.condition === "Excellent" ? "bg-green-100 text-green-700" :
                        asset.condition === "Needs Repair" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">${asset.purchasePrice.toLocaleString()}</td>
                    <td className="p-4 font-medium text-foreground">${asset.currentValue.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/assets/${asset._id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
