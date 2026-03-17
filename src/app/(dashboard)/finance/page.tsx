"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, 
  Wallet, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, Plus, Filter, Download, 
  Search, ShieldCheck, AlertCircle, FileText, 
  Building, CreditCard, Trash2, Activity,
  FileSpreadsheet
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from "recharts";
import { formatUSD, formatLKR, formatDualCurrency } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6", "#6366f1"];

export default function AdvancedFinancePage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  
  // Transaction Form State
  const [txForm, setTxForm] = useState({
    type: "Expense",
    category: "Other",
    amount: "",
    taxAmount: "0",
    date: new Date().toISOString().split('T')[0],
    description: "",
    status: "Paid",
    paymentMethod: "Bank Transfer"
  });

  const { data, isLoading } = useQuery({
    queryKey: ["finance-full-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/finance/analytics");
      return res.json();
    }
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTx: any) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-full-analytics"] });
      toast.success("Transaction recorded successfully in ledger.");
      setIsTxModalOpen(false);
      setTxForm({ ...txForm, amount: "", description: "" });
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteTxMutation = useMutation({
    mutationFn: async (id: string) => {
      // Create an endpoint if it doesn't exist, we will assume /api/transactions/[id]
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-full-analytics"] });
      toast.success("Transaction voided successfully.");
    }
  });

  const handleExportCSV = () => {
    if (!data?.transactions) return;
    const headers = ["Date", "Type", "Category", "Description", "Amount", "Tax", "Status", "Payment Method"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.transactions.map((t: any) => {
          return `${new Date(t.date).toISOString().split('T')[0]},${t.type},${t.category},"${t.description || ''}",${t.amount},${t.taxAmount || 0},${t.status},${t.paymentMethod}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hotel_Finance_Ledger_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Financial Ledger exported successfully!");
  };

  const summary = data?.summary || { Income: 0, Expense: 0, totalTax: 0, departments: {}, pendingTotal: 0 };
  const transactions = data?.transactions || [];
  const profit = summary.Income - summary.Expense;
  const profitMargin = summary.Income > 0 ? (profit / summary.Income) * 100 : 0;

  const filteredTransactions = transactions.filter((t: any) => {
    const matchesFilter = filter === "All" || t.type === filter;
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Prepare trend data
  const trendData = data?.stats?.reduce((acc: any, curr: any) => {
    const monthYear = `${curr._id.month}/${curr._id.year}`;
    let existing = acc.find((a: any) => a.name === monthYear);
    if (!existing) {
      existing = { name: monthYear, Income: 0, Expense: 0 };
      acc.push(existing);
    }
    existing[curr._id.type] = curr.total;
    return acc;
  }, []) || [];

  // Data mapping for Profit & Loss
  const deptData = Object.entries(summary.departments).map(([name, value]) => ({ name, value }));
  const expenseCategories = transactions.filter((t: any) => t.type === "Expense").reduce((acc: any, t: any) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const expenseData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount || !txForm.category) return toast.error("Amount and Category are required");
    addTransactionMutation.mutate({
      ...txForm,
      amount: Number(txForm.amount),
      taxAmount: Number(txForm.taxAmount)
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Financial Intelligence System</h1>
          <p className="text-slate-300 mt-1 max-w-xl">Master financial controller module. Monitor real-time cash flow, process departmental ledger entries, and audit P&L reports.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 backdrop-blur-md" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-400" /> Export CSV
          </Button>
          
          <Dialog open={isTxModalOpen} onOpenChange={setIsTxModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 border-0">
                <Plus className="h-4 w-4 mr-2" /> Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Post Transaction to Ledger
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitTx} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select value={txForm.type} onValueChange={(v) => setTxForm({...txForm, type: v})}>
                      <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Income">Income (+ Revenue)</SelectItem>
                        <SelectItem value="Expense">Expense (- Cost)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={txForm.category} onValueChange={(v) => setTxForm({...txForm, category: v})}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        {txForm.type === "Income" ? (
                          <>
                            <SelectItem value="Room Booking">Room Booking</SelectItem>
                            <SelectItem value="Treatment Payment">Treatment Payment</SelectItem>
                            <SelectItem value="Food Package">Food Package</SelectItem>
                            <SelectItem value="Other">Other Revenue</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Staff Salary">Staff Salary</SelectItem>
                            <SelectItem value="Kitchen Purchase">Kitchen Purchase</SelectItem>
                            <SelectItem value="Medicine Purchase">Medicine Purchase</SelectItem>
                            <SelectItem value="Electricity">Electricity</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                            <SelectItem value="Other">Other Expense</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">RS</span>
                      <Input required type="number" step="0.01" className="pl-9" placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm({...txForm, amount: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Applicable Tax</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">RS</span>
                      <Input type="number" step="0.01" className="pl-9" placeholder="0.00" value={txForm.taxAmount} onChange={(e) => setTxForm({...txForm, taxAmount: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description Memo</Label>
                  <Input required placeholder="Brief description of transaction..." value={txForm.description} onChange={(e) => setTxForm({...txForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={txForm.paymentMethod} onValueChange={(v) => setTxForm({...txForm, paymentMethod: v})}>
                      <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Credit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Online">Online Gateway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={txForm.status} onValueChange={(v) => setTxForm({...txForm, status: v})}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Processed (Paid)</SelectItem>
                        <SelectItem value="Pending">Accounts Receivable (Pending)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={addTransactionMutation.isPending}>
                  {addTransactionMutation.isPending ? "Posting to Ledger..." : "Post Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<DollarSign className="h-5 w-5 text-emerald-500" />} 
          title="Gross Revenue" 
          value={formatDualCurrency(summary.Income)} 
          description="Total incoming payments" 
          className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900"
        />
        <MetricCard 
          icon={<TrendingDown className="h-5 w-5 text-rose-500" />} 
          title="Operational Costs" 
          value={formatLKR(summary.Expense)} 
          description="Total outgoing expenses"
          className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900" 
        />
        <MetricCard 
          icon={<Wallet className="h-5 w-5 text-blue-500" />} 
          title="Net Profit" 
          value={formatDualCurrency(profit)} 
          description={`${profitMargin.toFixed(1)}% Profit Margin`}
          className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900"
        />
        <MetricCard 
          icon={<ShieldCheck className="h-5 w-5 text-indigo-500" />} 
          title="Tax Liability" 
          value={formatLKR(summary.totalTax)} 
          description="Estimated tax payable" 
          className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="ledger">Master Ledger</TabsTrigger>
          <TabsTrigger value="pnl">Profit & Loss (P&L)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg">Cash Flow Matrix</h3>
                    <p className="text-sm text-muted-foreground">Historical revenue vs operational costs over time.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Revenue</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> Expenses</div>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                      <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                      <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(v) => `Rs ${v/1000}k`} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                      <Area type="monotone" dataKey="Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" /> Key Performance
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Expense Ratio</span>
                      <span className="font-bold">{((summary.Expense / (summary.Income || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000" 
                        style={{ width: `${Math.min((summary.Expense / (summary.Income || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Net Profit Margin</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" style={{ width: `${Math.min(profitMargin, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-amber-500/10">
                  <CreditCard className="h-32 w-32" />
                </div>
                <h3 className="font-bold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-500 text-lg relative z-10">
                  <AlertCircle className="h-5 w-5" /> Accounts Receivable
                </h3>
                <p className="text-3xl font-extrabold text-amber-700 dark:text-amber-400 relative z-10 my-4 tracking-tight">
                  {formatDualCurrency(summary.pendingTotal)}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-500 font-medium relative z-10">
                  Outstanding pending payments from reservations and external agencies.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-2xl border shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-muted rounded-xl">
                <button onClick={() => setFilter("All")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "All" ? "bg-background shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}>All Entries</button>
                <button onClick={() => setFilter("Income")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "Income" ? "bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-900/50 dark:text-emerald-400" : "hover:bg-background/50 text-muted-foreground"}`}>Income</button>
                <button onClick={() => setFilter("Expense")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === "Expense" ? "bg-rose-100 text-rose-700 shadow-sm dark:bg-rose-900/50 dark:text-rose-400" : "hover:bg-background/50 text-muted-foreground"}`}>Expenses</button>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search ledger by description..." 
                  className="w-full pl-10 pr-4 bg-background/50 border-muted-foreground/20 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left border-b">
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Date & Reg</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Particulars</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Category</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Method</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right w-32">Amount</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right w-16">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    <tr><td colSpan={7} className="p-12 text-center text-muted-foreground animate-pulse">Synchronizing Master Ledger...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No ledger entries match this query.</td></tr>
                  ) : filteredTransactions.map((t: any) => (
                    <tr key={t._id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-1">TX-{t._id.substring(0,6)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{t.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-muted/50 border rounded-md text-[11px] font-medium text-foreground">{t.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          {t.paymentMethod === 'Cash' ? <DollarSign className="w-3 h-3"/> : <CreditCard className="w-3 h-3"/>}
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          t.status === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" : 
                          t.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400" : "bg-rose-100 text-rose-800"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold tabular-nums tracking-tight ${t.type === "Income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {t.type === "Income" ? "+" : "-"}{ formatLKR(t.amount) }
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                          if (confirm("Are you sure you want to void this transaction?")) {
                            deleteTxMutation.mutate(t._id);
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pnl" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" /> Revenue Verticals
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deptData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                        {deptData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => formatLKR(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}/>
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8">
                   <table className="w-full text-sm">
                     <tbody className="divide-y divide-border/50">
                       {deptData.map((d: any, i: number) => (
                         <tr key={i}>
                           <td className="py-3 flex items-center gap-3 font-medium">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                             {d.name}
                           </td>
                           <td className="py-3 text-right font-bold text-emerald-600">{formatLKR(d.value)}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>

             <div className="bg-card p-6 rounded-2xl border shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-rose-500" /> Cost Center Output
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="opacity-10" />
                      <XAxis type="number" stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(v) => `Rs ${v/1000}k`} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs font-semibold" tickLine={false} axisLine={false} width={100} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(v: number) => formatLKR(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}/>
                      <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]}>
                        {expenseData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8">
                   <table className="w-full text-sm">
                     <tbody className="divide-y divide-border/50">
                       {expenseData.map((d: any, i: number) => (
                         <tr key={i}>
                           <td className="py-3 font-medium text-muted-foreground">{d.name}</td>
                           <td className="py-3 text-right font-bold text-rose-600">{formatLKR(d.value)}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
