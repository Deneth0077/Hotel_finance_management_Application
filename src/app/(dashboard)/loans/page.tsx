"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CreditCard, Calendar, Landmark, 
  ArrowRightCircle, CheckCircle2, AlertCircle,
  Plus, History, DollarSign, Clock, Percent, Activity
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatLKR } from "@/lib/currency";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoansPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Finance analytics to determine Monthly Income for burden calculation
  const { data: financeData } = useQuery({
    queryKey: ["finance-full-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/finance/analytics");
      return res.json();
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const res = await fetch("/api/loans");
      return res.json();
    }
  });

  const loans = data?.loans || [];
  const summary = data?.summary || { totalDebt: 0, monthlyTotal: 0 };

  // Calculate Average Monthly Income from stats (protect against division by 1)
  const averageMonthlyIncome = useMemo(() => {
    if (!financeData?.stats) return 1; 
    const incomeStats = financeData.stats.filter((s:any) => s._id.type === "Income");
    if (incomeStats.length === 0) return 1;
    const total = incomeStats.reduce((sum:number, s:any) => sum + s.total, 0);
    return total / incomeStats.length;
  }, [financeData]);

  const [form, setForm] = useState({
    name: "",
    type: "Bank Loan",
    lender: "",
    principalAmount: "",
    interestRate: "",
    tenureMonths: "",
    startDate: new Date().toISOString().split('T')[0],
    repaymentDay: "1"
  });

  // PMT Auto Loan Calculation Core Logic
  const calculatedInstallment = useMemo(() => {
    const p = parseFloat(form.principalAmount);
    const rAnn = parseFloat(form.interestRate);
    const n = parseInt(form.tenureMonths);

    if (!p || !n) return 0;
    
    if (!rAnn || rAnn === 0) return p / n; // 0% Interest case

    // Monthly interest rate
    const r = (rAnn / 100) / 12;
    // PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const pmt = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return pmt;
  }, [form.principalAmount, form.interestRate, form.tenureMonths]);

  // Debt Burden Percentage
  // How much of the average monthly revenue does this new loan represent?
  const burdenPercentage = averageMonthlyIncome > 1 
    ? (calculatedInstallment / averageMonthlyIncome) * 100 
    : 0;

  const createLoanMutation = useMutation({
    mutationFn: async (newLoan: any) => {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLoan),
      });
      if (!res.ok) throw new Error("Failed to create loan");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("New loan/lease agreement recorded securely!");
      setIsModalOpen(false);
      setForm({
        name: "", type: "Bank Loan", lender: "", principalAmount: "", interestRate: "", tenureMonths: "", startDate: new Date().toISOString().split('T')[0], repaymentDay: "1"
      });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`)
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.principalAmount || !form.tenureMonths || !form.lender) {
      return toast.error("Please fill in all required facility details.");
    }
    
    createLoanMutation.mutate({
      ...form,
      principalAmount: Number(form.principalAmount),
      interestRate: Number(form.interestRate || 0),
      tenureMonths: Number(form.tenureMonths),
      repaymentDay: Number(form.repaymentDay),
      monthlyInstallment: calculatedInstallment
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans & Leasing</h1>
          <p className="text-muted-foreground">Manage banking facilities, vehicle leases, and structured debt.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border-0">
              <Plus className="h-4 w-4 mr-2" /> New Setup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Landmark className="h-6 w-6 text-primary" /> Setup Debt Facility
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
              
              {/* Form Side */}
              <div className="md:col-span-3 space-y-4">
                <div className="space-y-2">
                  <Label>Facility Name</Label>
                  <Input placeholder="e.g. Commercial Bank Term Loan" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facility Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Loan">Bank Term Loan</SelectItem>
                        <SelectItem value="Leasing">Vehicle/Equip Lease</SelectItem>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Credit Line">Revolving Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lender / Bank</Label>
                    <Input placeholder="e.g. BOC, HNB, People's Bank" value={form.lender} onChange={(e) => setForm({...form, lender: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Principal Amount Received</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" step="1000" className="pl-9" placeholder="0.00" value={form.principalAmount} onChange={(e) => setForm({...form, principalAmount: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Interest Rate (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" step="0.01" className="pl-9" placeholder="12.5" value={form.interestRate} onChange={(e) => setForm({...form, interestRate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tenure (Months)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" className="pl-9" placeholder="60 (e.g. 5 Years)" value={form.tenureMonths} onChange={(e) => setForm({...form, tenureMonths: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Repayment Day</Label>
                    <Select value={form.repaymentDay.toString()} onValueChange={(v) => setForm({...form, repaymentDay: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {[1, 5, 10, 15, 20, 25, 28].map(day => (
                          <SelectItem key={day} value={day.toString()}>Day {day} of month</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Agreement Start</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Intelligence Side */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner border border-slate-700">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Activity className="h-5 w-5" /> 
                    <h4 className="font-bold text-sm uppercase tracking-wider">AI Intelligence</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Auto-Calculated Monthly Installment</p>
                      <p className="text-3xl font-extrabold text-white mt-1">
                        {formatLKR(calculatedInstallment)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-xs text-slate-400 font-medium">Income Risk Assessment</p>
                        <p className={`text-sm font-bold ${burdenPercentage > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {burdenPercentage.toFixed(1)}% Burden
                        </p>
                      </div>
                      
                      {/* Risk Bar */}
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${burdenPercentage > 40 ? 'bg-rose-500' : burdenPercentage > 20 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(burdenPercentage, 100)}%` }} 
                        />
                      </div>
                      
                      <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                        {averageMonthlyIncome > 1 
                          ? `This loan will consume ${Math.min(burdenPercentage, 100).toFixed(1)}% of your average hotel monthly revenue (${formatLKR(averageMonthlyIncome)}).` 
                          : "Processing revenue data to structure risk..."}
                      </p>

                      {burdenPercentage > 35 ? (
                        <div className="mt-3 p-2 bg-rose-500/20 border border-rose-500/30 rounded text-xs text-rose-200 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <p>Warning: This installment exceeds safe threshold. Consider increasing the tenure.</p>
                        </div>
                      ) : (
                         <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-200 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <p>Safe capability. This facility is well within your operating cashflow.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={onSubmit} 
                  disabled={createLoanMutation.isPending || !form.name || !form.principalAmount}
                  className="w-full bg-primary hover:bg-primary/90 py-6 text-sm font-bold shadow-xl"
                >
                  {createLoanMutation.isPending ? "Configuring Ledger..." : "Activate Debt Line Setup"}
                </Button>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Outstanding" 
          value={formatLKR(summary.totalDebt)} 
          icon={<Landmark className="h-5 w-5 text-rose-500" />}
          description="Total active debt capital"
          className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900"
        />
        <MetricCard 
          title="Monthly Commitment" 
          value={formatLKR(summary.monthlyTotal)} 
          icon={<CreditCard className="h-5 w-5 text-blue-500" />}
          description="Total gross installments"
          className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900"
        />
        <MetricCard 
          title="Active Agreements" 
          value={loans.filter((l: any) => l.status === "Active").length.toString()} 
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          description="Ongoing structured repayment plans"
          className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900"
        />
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border bg-muted/20">
          <h3 className="font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Active Debt Schedules
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="p-4 font-semibold text-muted-foreground">Facility Name & Lender</th>
                <th className="p-4 font-semibold text-muted-foreground">Type</th>
                <th className="p-4 font-semibold text-muted-foreground">Monthly Installment</th>
                <th className="p-4 font-semibold text-muted-foreground">Repayment Date</th>
                <th className="p-4 font-semibold text-muted-foreground">Remaining Balance</th>
                <th className="p-4 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground animate-pulse">Syncing debt structures...</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground italic">No active debt registered. Your capital is pure!</td></tr>
              ) : loans.map((loan: any) => {
                const totalMonths = loan.tenureMonths;
                const remainingMonths = Math.ceil(loan.remainingBalance / (loan.monthlyInstallment || 1));
                
                return (
                  <tr key={loan._id} className="last:border-0 hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-foreground">{loan.name}</div>
                      <div className="text-[11px] font-medium text-muted-foreground mt-0.5">{loan.lender}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        loan.type === "Leasing" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400" : 
                        loan.type === "Credit Line" ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                      }`}>
                        {loan.type}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold tabular-nums tracking-tight">
                      {formatLKR(loan.monthlyInstallment)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Day {loan.repaymentDay}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-rose-600 dark:text-rose-400">{formatLKR(loan.remainingBalance)}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">~{remainingMonths} months left</div>
                    </td>
                    <td className="p-4">
                      <span className={`flex justify-center items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                        loan.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-slate-100 text-slate-800"
                      }`}>
                        {loan.status === "Active" ? <ArrowRightCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
