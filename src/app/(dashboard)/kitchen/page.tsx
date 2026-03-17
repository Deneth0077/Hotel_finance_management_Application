"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UtensilsCrossed, Plus, AlertTriangle, History, ShoppingCart } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useState } from "react";
import { toast } from "sonner";

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">("inventory");

  const { data: kitchenItems, isLoading } = useQuery({
    queryKey: ["kitchen-inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      const allItems = await res.json();
      return allItems.filter((item: any) => item.category === "Kitchen");
    }
  });

  const lowStockItems = kitchenItems?.filter((item: any) => item.currentStock <= item.minThreshold) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Management</h1>
          <p className="text-muted-foreground">Manage ingredients, meal stock, and kitchen supplies.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Ingredients" 
          value={kitchenItems?.length.toString() || "0"} 
          icon={<UtensilsCrossed className="h-4 w-4" />}
          description="Active items in pantry"
        />
        <MetricCard 
          title="Low Stock Alert" 
          value={lowStockItems.length.toString()} 
          icon={<AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />}
          description="Items below threshold"
          change={lowStockItems.length > 0 ? "Action Required" : "All good"}
          changeType={lowStockItems.length > 0 ? "negative" : "positive"}
        />
        <MetricCard 
          title="Today's Orders" 
          value="12" 
          icon={<ShoppingCart className="h-4 w-4 text-blue-500" />}
          description="Meal packages served today"
        />
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "inventory" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Ingredients Inventory
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Meal Logs & Orders
        </button>
      </div>

      {activeTab === "inventory" ? (
        <div className="rounded-xl bg-card border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Ingredient Name</th>
                <th className="p-4 font-medium text-muted-foreground">Stock Level</th>
                <th className="p-4 font-medium text-muted-foreground">Threshold</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading pantry...</td></tr>
              ) : kitchenItems?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No kitchen items found. Start by adding some.</td></tr>
              ) : kitchenItems?.map((item: any) => (
                <tr key={item._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.unit}</div>
                  </td>
                  <td className="p-4 font-mono">{item.currentStock}</td>
                  <td className="p-4 text-muted-foreground">{item.minThreshold}</td>
                  <td className="p-4">
                    {item.currentStock <= item.minThreshold ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        <AlertTriangle className="h-3 w-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                         Healthy
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-primary hover:underline font-medium">Restock</button>
                    <button className="text-muted-foreground hover:text-foreground font-medium">History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-card border shadow-sm p-12 text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Meal Logging System</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            This module will track guest meal preferences and consumption from wellness packages. Coming soon in phase 5.
          </p>
          <button className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Configure Meal Packages
          </button>
        </div>
      )}
    </div>
  );
}
