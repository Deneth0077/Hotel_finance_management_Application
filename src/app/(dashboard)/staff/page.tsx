"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Plus, DollarSign, Calendar, 
  Trash2, Wallet, Sparkles, TrendingUp,
  Search, UserCog, HeartHandshake, Download
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [tipAmount, setTipAmount] = useState("");

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

  const distributeTips = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch("/api/staff/distribute-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to distribute tips");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(`Successfully distributed Rs. ${data.splitAmount} to ${data.activeStaffCount} active staff!`);
      setTipAmount("");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const downloadStaffPDF = () => {
    const doc = new jsPDF();
    const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Set up PDF Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("Hotel Finance Management", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Staff Payroll Settlement Report - ${monthYear}`, 14, 28);
    
    doc.setDrawColor(226, 232, 240); // border-slate-200
    doc.line(14, 32, 196, 32);

    const tableData = filteredStaff.map((s: any) => [
      s.name,
      s.role,
      formatLKR(s.baseSalary),
      formatLKR(s.allowance || 0),
      formatLKR(s.pendingTips || 0),
      formatLKR(s.baseSalary + (s.allowance || 0) + (s.pendingTips || 0))
    ]);

    const totalPayout = filteredStaff.reduce((acc: number, s: any) => 
      acc + (s.baseSalary + (s.allowance || 0) + (s.pendingTips || 0)), 0
    );

    autoTable(doc, {
      startY: 38,
      head: [['Employee', 'Role', 'Base Salary', 'Allowances', 'Tips', 'Total Payable']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235], // blue-600
        textColor: 255, 
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' }
      },
      styles: { fontSize: 9, cellPadding: 4 },
      foot: [[
        { content: 'Total Overall Settlement Value:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatLKR(totalPayout), styles: { halign: 'right', fontStyle: 'bold', fillColor: [241, 245, 249] } }
      ]]
    });

    // Add footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Generated on ${new Date().toLocaleString()} | Finance Intelligence Module`, 14, finalY);

    doc.save(`Staff_Payroll_${monthYear}.pdf`);
    toast.success("Payroll PDF generated successfully!");
  };

  const totalMonthlyPayout = staff.reduce((acc: number, s: any) => acc + s.baseSalary, 0);

  const filteredStaff = (staff || []).filter((s: any) => {
    const name = s?.name?.toLowerCase() || "";
    const role = s?.role?.toLowerCase() || "";
    const term = (searchTerm || "").toLowerCase();
    return name.includes(term) || role.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Salary</h1>
          <p className="text-muted-foreground">Manage employees, payroll, tips, and allowances.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadStaffPDF}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
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
        <div className="rounded-xl bg-card p-6 shadow-card border flex flex-col justify-between items-start gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground leading-tight">Tip Box</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Distribute pooled tips equally</p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">Rs.</span>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
              />
            </div>
            <button 
              onClick={() => tipAmount && distributeTips.mutate(Number(tipAmount))}
              disabled={distributeTips.isPending || !tipAmount}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm shadow transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {distributeTips.isPending ? "Sharing..." : "Share Tips"}
            </button>
          </div>
        </div>
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
                <th className="p-4">Allowances</th>
                <th className="p-4">Pending Tips</th>
                <th className="p-4 font-bold text-primary">Total Payable</th>
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
                  <td className="p-4 text-muted-foreground">{formatLKR(s.allowance || 0)}</td>
                  <td className="p-4 text-amber-600 font-semibold">{formatLKR(s.pendingTips || 0)}</td>
                  <td className="p-4 font-black tracking-tight text-primary">
                    {formatLKR(s.baseSalary + (s.allowance || 0) + (s.pendingTips || 0))}
                  </td>
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
