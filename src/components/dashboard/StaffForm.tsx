"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface StaffFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function StaffForm({ onClose, onSuccess, initialData }: StaffFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    baseSalary: initialData?.baseSalary || 0,
    allowance: initialData?.allowance || 0,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = initialData ? `/api/staff/${initialData._id}` : "/api/staff";
      const method = initialData ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Failed to ${initialData ? 'update' : 'add'} staff member`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(`Staff member ${initialData ? 'updated' : 'added'} successfully`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.baseSalary) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Full Name *</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Role / Position *</label>
            <input
              type="text"
              required
              placeholder="e.g. Receptionist, Chef, Therapist"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Base Salary (LKR) *</label>
              <input
                type="number"
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Allowances (LKR)</label>
              <input
                type="number"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.allowance}
                onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Phone Number</label>
            <input
              type="text"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Email Address</label>
            <input
              type="email"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              {mutation.isPending ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Member" : "Add Member")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
