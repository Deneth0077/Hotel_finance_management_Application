"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          purchasePrice: Number(data.purchasePrice),
          currentValue: Number(data.currentValue),
          depreciationRate: Number(data.depreciationRate),
          annualMaintenanceCost: Number(data.annualMaintenanceCost),
          valueHistory: [{ date: new Date(), value: Number(data.currentValue) }]
        }),
      });

      if (res.ok) {
        toast.success("Asset registered successfully");
        router.push("/assets");
      } else {
        throw new Error("Failed to register asset");
      }
    } catch (err) {
      toast.error("Error creating asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Register New Asset
          </h1>
          <p className="text-sm text-muted-foreground">Add new property or equipment to the hotel valuation ledger.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Name</label>
              <input name="name" required placeholder="e.g. Luxury Garden Villa" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select name="category" required className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="Land">Land</option>
                <option value="Buildings">Buildings</option>
                <option value="Guest Rooms">Guest Rooms</option>
                <option value="Furniture">Furniture</option>
                <option value="Kitchen Equipment">Kitchen Equipment</option>
                <option value="Medical Equipment">Medical Equipment</option>
                <option value="Spa Equipment">Spa Equipment</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Electronics">Electronics</option>
                <option value="Pool Equipment">Pool Equipment</option>
                <option value="Garden Equipment">Garden Equipment</option>
                <option value="Other Assets">Other Assets</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input name="location" placeholder="e.g. North Wing" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Date</label>
              <input name="purchaseDate" type="date" required className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Price ($)</label>
              <input name="purchasePrice" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Value ($)</label>
              <input name="currentValue" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Annual Depreciation (%)</label>
              <input name="depreciationRate" type="number" step="0.1" placeholder="5.0" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <select name="condition" className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea name="notes" rows={3} placeholder="Additional details..." className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Saving..." : <><Save className="h-4 w-4" /> Save Asset</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
