"use client";

import { Boxes, Plus, AlertCircle, TrendingDown } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

export default function InventoryPage() {
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      return res.json();
    }
  });

  const lowStockCount = inventory.filter((item: any) => item.currentStock <= item.minThreshold).length;
  const totalExpense = 0; // This can be linked to finance later
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Items</p>
              <p className="text-xl font-bold">{lowStockCount} items low on stock</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Expenses</p>
              <p className="text-xl font-bold">${totalExpense.toLocaleString()} this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-card overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left bg-muted/30">
              <th className="p-4 font-medium text-muted-foreground">Item Name</th>
              <th className="p-4 font-medium text-muted-foreground">Category</th>
              <th className="p-4 font-medium text-muted-foreground">Stock Level</th>
              <th className="p-4 font-medium text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading inventory...</td></tr>
            ) : inventory.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No inventory items found.</td></tr>
            ) : inventory.map((item: any) => (
              <tr key={item._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4 text-muted-foreground">{item.category}</td>
                <td className="p-4 text-muted-foreground">{item.currentStock} {item.unit}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.currentStock > item.minThreshold ? "bg-green-100 text-green-700" :
                    item.currentStock > 0 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {item.currentStock > item.minThreshold ? "In Stock" : item.currentStock > 0 ? "Low Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-primary hover:underline font-medium">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
