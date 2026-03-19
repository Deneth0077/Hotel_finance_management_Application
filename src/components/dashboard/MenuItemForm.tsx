"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MenuItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function MenuItemForm({ onClose, onSuccess, initialData }: MenuItemFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    costPrice: initialData?.costPrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    category: initialData?.category || "Main",
    description: initialData?.description || "",
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = initialData ? `/api/kitchen/menu/${initialData._id}` : "/api/kitchen/menu";
      const method = initialData ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${initialData ? 'update' : 'add'} menu item`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-menu"] });
      toast.success(`Dish ${initialData ? 'updated' : 'added'} successfully`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.costPrice || !formData.sellingPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(formData);
  };

  const profit = formData.sellingPrice - formData.costPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{initialData ? 'Edit Dish' : 'Add New Dish'}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Dish Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chicken Rice, Veg Burger"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Cost Price (LKR) *</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Selling Price (LKR) *</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg flex justify-between items-center text-sm">
             <span className="font-medium">Estimated Profit per Meal:</span>
             <span className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>
               {profit.toLocaleString()} LKR
             </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Category</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Starter">Starter</option>
              <option value="Main">Main Course</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Beverage</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Description (Optional)</label>
            <textarea
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
              {mutation.isPending ? "Saving..." : (initialData ? "Update Dish" : "Add Dish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
