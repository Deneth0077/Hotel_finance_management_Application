"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface InventoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function InventoryForm({ onClose, onSuccess, initialData }: InventoryFormProps) {
  const queryClient = useQueryClient();

  // Fetch dynamic categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    }
  });

  const defaultCategories = ["General", "Kitchen", "Treatment Oil", "Medicine", "Spa Supply"];
  const allCategories = Array.from(new Set([...defaultCategories, ...categories.map((c: any) => c.name)]));

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || allCategories[0] || "General",
    currentStock: initialData?.currentStock || 0,
    minThreshold: initialData?.minThreshold || 5,
    unit: initialData?.unit || "pieces",
    supplier: initialData?.supplier || "",
  });

  // Ensure category is updated if none was set but categories loaded
  useEffect(() => {
    if (!formData.category && allCategories.length > 0) {
      setFormData(prev => ({ ...prev, category: allCategories[0] }));
    }
  }, [allCategories]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = initialData ? `/api/inventory/${initialData._id}` : "/api/inventory";
      const method = initialData ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${initialData ? 'update' : 'add'} item`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Item ${initialData ? 'updated' : 'added'} successfully`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rice, Coconut Oil, Hand Soap"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Category *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Current Stock *</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Min. Threshold *</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Unit *</label>
              <select
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="pieces">pieces</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="liters">liters</option>
                <option value="bottles">bottles</option>
                <option value="packets">packets</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Supplier</label>
              <input
                type="text"
                placeholder="Optional"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {mutation.isPending ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Item" : "Add Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
