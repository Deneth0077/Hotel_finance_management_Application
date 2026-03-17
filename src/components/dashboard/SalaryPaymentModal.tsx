"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Wallet, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatLKR } from "@/lib/currency";

interface SalaryPaymentModalProps {
  member: any;
  onClose: () => void;
}

export function SalaryPaymentModal({ member, onClose }: SalaryPaymentModalProps) {
  const queryClient = useQueryClient();
  const [allowance, setAllowance] = useState(0);
  const [tips, setTips] = useState(0);

  const paySalary = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/staff/${member._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Payment failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(`Salary processed for ${member.name}`);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const total = member.baseSalary + allowance + tips;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-none">Process Salary</h2>
              <p className="text-sm text-muted-foreground mt-1">{member.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border border-dashed">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground font-medium">Monthly Base Salary</span>
              <span className="font-bold text-lg">{formatLKR(member.baseSalary)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fixed Contract Amount</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Tips (Shared)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rs.</span>
                <input
                  type="number"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={tips}
                  onChange={(e) => setTips(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Extra Allowances</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rs.</span>
                <input
                  type="number"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={allowance}
                  onChange={(e) => setAllowance(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Net Payout</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Calculated for {new Date().toLocaleString('default', { month: 'long' })}</p>
              </div>
              <p className="text-2xl font-black text-primary">{formatLKR(total)}</p>
            </div>
          </div>

          <button
            onClick={() => {
              paySalary.mutate({
                tips,
                allowances: allowance,
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
              });
            }}
            disabled={paySalary.isPending}
            className="w-full rounded-xl bg-primary py-4 text-sm font-black text-primary-foreground hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {paySalary.isPending ? "Processing Ledger..." : (
              <>
                <Check className="h-4 w-4" /> Finalize & Pay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
