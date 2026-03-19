"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UtensilsCrossed, Plus, AlertTriangle, ShoppingCart, DollarSign, TrendingUp, History, LayoutGrid, List, Edit3, Trash2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useState } from "react";
import { toast } from "sonner";
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { RecordSaleForm } from "@/components/dashboard/RecordSaleForm";


export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"inventory" | "menu" | "sales">("inventory");
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch Inventory (Ingredients)
  const { data: kitchenItems = [], isLoading: isInventoryLoading } = useQuery({
    queryKey: ["kitchen-inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      const allItems = await res.json();
      return allItems.filter((item: any) => item.category === "Kitchen");
    }
  });

  // Fetch Menu Items (Dishes)
  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["kitchen-menu"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen/menu");
      return res.json();
    }
  });

  // Fetch Today's Sales
  const { data: dailySales = [], isLoading: isSalesLoading } = useQuery({
    queryKey: ["kitchen-sales", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/kitchen/sales?date=${selectedDate}`);
      return res.json();
    }
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/kitchen/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-menu"] });
      toast.success("Dish deleted successfully");
    }
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/kitchen/sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete sale record");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-sales"] });
      toast.success("Sale record deleted");
    }
  });

  const lowStockItems = kitchenItems.filter((item: any) => item.currentStock <= item.minThreshold);
  
  const dailyTotalRevenue = dailySales.reduce((acc: number, sale: any) => acc + sale.totalRevenue, 0);
  const dailyTotalCost = dailySales.reduce((acc: number, sale: any) => acc + sale.totalCost, 0);
  const dailyTotalProfit = dailyTotalRevenue - dailyTotalCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen & Restaurant</h1>
          <p className="text-sm text-muted-foreground">Manage ingredients, menu dishes, and track daily profits.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "menu" && (
            <button 
              onClick={() => { setEditingMenuItem(null); setIsMenuModalOpen(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Dish
            </button>
          )}
          {activeTab === "sales" && (
            <button 
              onClick={() => setIsSaleModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Record Sale
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Daily Sales" 
          value={`${dailyTotalRevenue.toLocaleString()} LKR`} 
          icon={ShoppingCart}
          description={`${dailySales.length} meals sold today`}
        />
        <MetricCard 
          title="Daily Profit" 
          value={`${dailyTotalProfit.toLocaleString()} LKR`} 
          icon={TrendingUp}
          change={dailyTotalRevenue > 0 ? `${((dailyTotalProfit / dailyTotalRevenue) * 100).toFixed(1)}% margin` : "No sales"}
          changeType={dailyTotalProfit > 0 ? "positive" : "neutral"}
        />
        <MetricCard 
          title="Inventory Alerts" 
          value={lowStockItems.length.toString()} 
          icon={AlertTriangle}
          description="Items below threshold"
          className={lowStockItems.length > 0 ? "border-red-200" : ""}
        />
        <MetricCard 
          title="Active Menu" 
          value={menuItems.length.toString()} 
          icon={UtensilsCrossed}
          description="Dishes in restaurant"
        />
      </div>

      <div className="flex gap-6 border-b border-border">
        {[
          { id: "inventory", label: "Inventory", icon: LayoutGrid },
          { id: "menu", label: "Menu Management", icon: List },
          { id: "sales", label: "Daily Sales & Profit", icon: DollarSign },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-1 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inventory" && (
        <div className="rounded-xl bg-card border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="p-4 font-medium text-muted-foreground">Ingredient Name</th>
                <th className="p-4 font-medium text-muted-foreground">Stock Level</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isInventoryLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading pantry...</td></tr>
              ) : kitchenItems.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No ingredients found.</td></tr>
              ) : kitchenItems.map((item: any) => (
                <tr key={item._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Unit: {item.unit}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold">{item.currentStock}</div>
                    <div className="text-[10px] text-muted-foreground">Threshold: {item.minThreshold}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      item.currentStock > item.minThreshold ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.currentStock > item.minThreshold ? "Healthy" : "Low Stock"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:underline text-xs font-semibold">Update Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "menu" && (
        <div className="rounded-xl bg-card border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left bg-muted/30">
                <th className="p-4 font-medium text-muted-foreground">Dish Name</th>
                <th className="p-4 font-medium text-muted-foreground">Category</th>
                <th className="p-4 font-medium text-muted-foreground">Cost Price</th>
                <th className="p-4 font-medium text-muted-foreground">Selling Price</th>
                <th className="p-4 font-medium text-muted-foreground">Profit</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isMenuLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading menu...</td></tr>
              ) : menuItems.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No dishes in the menu yet.</td></tr>
              ) : menuItems.map((item: any) => (
                <tr key={item._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-xs text-muted-foreground uppercase">{item.category}</td>
                  <td className="p-4 font-mono">{item.costPrice.toLocaleString()}</td>
                  <td className="p-4 font-mono font-bold">{item.sellingPrice.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="text-green-600 font-bold text-xs ring-1 ring-green-100 px-2 py-0.5 rounded-full">
                      +{(item.sellingPrice - item.costPrice).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingMenuItem(item); setIsMenuModalOpen(true); }}
                        className="p-2 rounded-lg hover:bg-muted text-primary transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Delete this dish?")) deleteMenuMutation.mutate(item._id); }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "sales" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
            <span className="text-sm font-semibold">Select Date:</span>
            <input 
              type="date" 
              className="rounded-lg border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="rounded-xl bg-card border shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left bg-muted/30">
                  <th className="p-4 font-medium text-muted-foreground">Dish</th>
                  <th className="p-4 font-medium text-muted-foreground text-center">Qty</th>
                  <th className="p-4 font-medium text-muted-foreground">Total Revenue</th>
                  <th className="p-4 font-medium text-muted-foreground">Total Profit</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isSalesLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading sales records...</td></tr>
                ) : dailySales.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No sales recorded for this date.</td></tr>
                ) : dailySales.map((sale: any) => (
                  <tr key={sale._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{sale.menuItemId?.name || "Unknown Dish"}</td>
                    <td className="p-4 text-center font-bold">{sale.quantity}</td>
                    <td className="p-4 font-mono font-bold text-primary">{sale.totalRevenue.toLocaleString()}</td>
                    <td className="p-4 font-mono text-green-600 font-bold">+{sale.totalProfit.toLocaleString()}</td>
                    <td className="p-4 text-right">
                       <button 
                         onClick={() => { if(confirm("Delete this record?")) deleteSaleMutation.mutate(sale._id); }}
                         className="p-1 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {dailySales.length > 0 && (
                <tfoot className="bg-muted/10 font-black italic">
                   <tr>
                     <td className="p-4 text-right" colSpan={2}>DAILY TOTAL:</td>
                     <td className="p-4 tabular-nums text-primary">{dailyTotalRevenue.toLocaleString()} LKR</td>
                     <td className="p-4 tabular-nums text-green-600">{dailyTotalProfit.toLocaleString()} LKR</td>
                     <td></td>
                   </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {isMenuModalOpen && (
        <MenuItemForm 
          onClose={() => setIsMenuModalOpen(false)} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["kitchen-menu"] })}
          initialData={editingMenuItem}
        />
      )}

      {isSaleModalOpen && (
        <RecordSaleForm 
          onClose={() => setIsSaleModalOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["kitchen-sales"] })}
        />
      )}
    </div>
  );
}

