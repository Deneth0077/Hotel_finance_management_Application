"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Plus, DollarSign, Calendar, 
  Trash2, Wallet, Sparkles, TrendingUp,
  Search, UserCog
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatLKR } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";
import { StaffForm } from "@/components/dashboard/StaffForm";
import { SalaryPaymentModal } from "@/components/dashboard/SalaryPaymentModal";

export default function StaffSalaryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [payingMember, setPayingMember] = useState<any>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      return res.json();
    }
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete staff member");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
      console.error("Delete Mutation Error:", error);
    }
  });

  const paySalary = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await fetch(`/api/staff/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Payment failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Salary processed & transaction recorded");
    }
  });

  const totalMonthlyPayout = staff.reduce((acc: number, s: any) => acc + s.baseSalary, 0);

  const filteredStaff = staff.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Salary</h1>
          <p className="text-muted-foreground">Manage employees, payroll, tips, and allowances.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Monthly Payroll" 
          value={formatLKR(totalMonthlyPayout)} 
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
          description="Fixed base salaries"
        />
        <MetricCard 
          title="Active Staff" 
          value={staff.length.toString()} 
          icon={<Users className="h-4 w-4 text-blue-500" />}
          description="Total employees"
        />
        <MetricCard 
          title="Avg Pay Day" 
          value="1st of Month" 
          icon={<Calendar className="h-4 w-4 text-purple-500" />}
          description="Standard disbursement cycle"
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-medium text-muted-foreground">
                <th className="p-4">Employee</th>
                <th className="p-4">Role</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Pay Day</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading staff...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic">No staff found.</td></tr>
              ) : filteredStaff.map((s: any) => (
                <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.phone || "No phone"}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold uppercase tracking-wider">{s.role}</span>
                  </td>
                  <td className="p-4 font-medium">{formatLKR(s.baseSalary)}</td>
                  <td className="p-4 text-muted-foreground text-xs">Day {s.salaryPayDay}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setPayingMember(s)}
                      className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 transition-all font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Wallet className="h-3.5 w-3.5" /> Pay
                    </button>
                    <button 
                      onClick={() => setEditingMember(s)}
                      className="text-muted-foreground hover:text-primary hover:bg-muted p-2 rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Remove ${s.name} from staff records?`)) {
                          deleteStaff.mutate(s._id);
                        }
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 p-2 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {(isAdding || editingMember) && (
        <StaffForm 
          initialData={editingMember}
          onClose={() => {
            setIsAdding(false);
            setEditingMember(null);
          }} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["staff"] })} 
        />
      )}

      {payingMember && (
        <SalaryPaymentModal 
          member={payingMember} 
          onClose={() => setPayingMember(null)} 
        />
      )}
    </div>
  );
}
