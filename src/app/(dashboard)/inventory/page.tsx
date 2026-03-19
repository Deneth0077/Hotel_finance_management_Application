"use client";

import { Boxes, Plus, AlertCircle, TrendingDown, Edit3, Trash2, FileSpreadsheet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InventoryForm } from "@/components/dashboard/InventoryForm";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { CategoryForm } from "@/components/dashboard/CategoryForm";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const lowStockCount = inventory.filter((item: any) => item.currentStock <= item.minThreshold).length;
  const totalExpense = 0; // This can be linked to finance later

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsCategoryOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4 text-primary" /> New Category
          </button>
          <button 
            onClick={() => setIsExcelOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Bulk Upload
          </button>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-card border">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-2 ${lowStockCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Items</p>
              <p className="text-xl font-bold">{lowStockCount} items low on stock</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card border">
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
        <div className="overflow-x-auto">
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
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.supplier || 'No supplier'}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium uppercase tracking-wider">{item.category}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{item.currentStock} <span className="text-muted-foreground text-xs">{item.unit}</span></div>
                    <div className="text-[10px] text-muted-foreground">Threshold: {item.minThreshold} {item.unit}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      item.currentStock > item.minThreshold ? "bg-green-100 text-green-700" :
                      item.currentStock > 0 ? "bg-amber-100 text-amber-700 font-bold" :
                      "bg-red-100 text-red-700 font-bold"
                    }`}>
                      {item.currentStock > item.minThreshold ? "In Stock" : item.currentStock > 0 ? "Low Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg hover:bg-muted text-primary transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id, item.name)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete Item"
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
      </div>

      {isModalOpen && (
        <InventoryForm 
          onClose={closeModal} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })}
          initialData={editingItem}
        />
      )}

      {isExcelOpen && (
        <ExcelUpload 
          onClose={() => setIsExcelOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })}
        />
      )}

      {isCategoryOpen && (
        <CategoryForm 
          onClose={() => setIsCategoryOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
        />
      )}
    </div>
  );
}
