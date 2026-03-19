"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RecordSaleFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordSaleForm({ onClose, onSuccess }: RecordSaleFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    menuItemId: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
  });

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["kitchen-menu"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen/menu");
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/kitchen/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record sale");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-sales"] });
      toast.success("Sale recorded successfully");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.menuItemId || formData.quantity <= 0) {
      toast.error("Please select a dish and a valid quantity");
      return;
    }
    mutation.mutate(formData);
  };

  const selectedItem = menuItems.find((item: any) => item._id === formData.menuItemId);
  const totalRevenue = selectedItem ? selectedItem.sellingPrice * formData.quantity : 0;
  const totalCost = selectedItem ? selectedItem.costPrice * formData.quantity : 0;
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Record Daily Sale</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Meal/Dish *</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.menuItemId}
              onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
              required
            >
              <option value="">Select a dish...</option>
              {menuItems.map((item: any) => (
                <option key={item._id} value={item._id}>{item.name} - {item.sellingPrice} LKR</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Sale Date</label>
              <input
                type="date"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-xs">
             <div className="flex justify-between items-center">
               <span className="text-muted-foreground">Total Revenue:</span>
               <span className="font-semibold text-lg">{totalRevenue.toLocaleString()} LKR</span>
             </div>
             <div className="flex justify-between items-center text-muted-foreground border-b border-border pb-2 mb-2">
               <span>Total Cost:</span>
               <span>{totalCost.toLocaleString()} LKR</span>
             </div>
             <div className="flex justify-between items-center font-bold text-sm">
               <span>Net Profit:</span>
               <span className={totalProfit >= 0 ? "text-green-600" : "text-red-500"}>
                 {totalProfit.toLocaleString()} LKR
               </span>
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
              disabled={mutation.isPending || isLoading}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {mutation.isPending ? "Recording..." : "Record Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
