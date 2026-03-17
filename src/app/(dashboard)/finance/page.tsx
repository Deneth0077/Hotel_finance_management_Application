"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, TrendingUp, TrendingDown, Clock, 
  Wallet, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, Plus, Filter, Download, 
  Search, ShieldCheck, AlertCircle 
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { formatUSD, formatLKR, formatDualCurrency } from "@/lib/currency";
import { useState } from "react";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function AdvancedFinancePage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["finance-full-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/finance/analytics");
      return res.json();
    }
  });

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

  // Prepare department data
  const deptData = Object.entries(summary.departments).map(([name, value]) => ({
    name, value
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
          <p className="text-muted-foreground">Comprehensive hotel revenue, expense, and tax management.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
            <Plus className="h-4 w-4" /> Record Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<DollarSign className="h-4 w-4 text-green-500" />} 
          title="Gross Revenue" 
          value={formatDualCurrency(summary.Income)} 
          description="Total incoming payments" 
        />
        <MetricCard 
          icon={<TrendingDown className="h-4 w-4 text-red-500" />} 
          title="Operational Costs" 
          value={formatLKR(summary.Expense)} 
          description="Total outgoing expenses" 
        />
        <MetricCard 
          icon={<Wallet className="h-4 w-4 text-blue-500" />} 
          title="Net Profit" 
          value={formatDualCurrency(profit)} 
          description={`${profitMargin.toFixed(1)}% Profit Margin`}
        />
        <MetricCard 
          icon={<ShieldCheck className="h-4 w-4 text-purple-500" />} 
          title="Tax Liability" 
          value={formatLKR(summary.totalTax)} 
          description="Estimated tax payable" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Cash Flow Trends</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Income</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-full"></span> Expenses</div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFilter("All")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "All" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-background"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter("Income")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "Income" ? "bg-green-100 text-green-700 shadow-sm" : "hover:bg-background"}`}
                >
                  Income
                </button>
                <button 
                  onClick={() => setFilter("Expense")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "Expense" ? "bg-red-100 text-red-700 shadow-sm" : "hover:bg-background"}`}
                >
                  Expenses
                </button>
              </div>
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Find transaction..." 
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-4 font-medium text-muted-foreground">Transaction</th>
                    <th className="p-4 font-medium text-muted-foreground">Category</th>
                    <th className="p-4 font-medium text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-muted-foreground">Payment</th>
                    <th className="p-4 font-medium text-muted-foreground text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Analysing financial records...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No transactions found for the selected view.</td></tr>
                  ) : filteredTransactions.map((t: any) => (
                    <tr key={t._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{t.description}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{new Date(t.date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-medium">{t.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "Paid" ? "bg-green-100 text-green-700" : 
                          t.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{t.paymentMethod}</td>
                      <td className={`p-4 text-right font-bold ${t.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                        {t.type === "Income" ? "+" : "-"}{t.type === "Income" ? formatUSD(t.amount) : formatLKR(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" /> Revenue by Department
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatUSD(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {deptData.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{formatUSD(d.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm border-amber-100 bg-amber-50/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" /> Pending Receivables
            </h3>
            <p className="text-2xl font-bold text-amber-700">{formatDualCurrency(summary.pendingTotal)}</p>
            <p className="text-xs text-amber-600 mt-1 italic">Outstanding payments from guests & agencies.</p>
            <button className="w-full mt-6 py-2 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors">
              Review AR Ledger
            </button>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4">Financial Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Expense to Revenue Ratio</span>
                  <span className="font-medium">{((summary.Expense / (summary.Income || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400" 
                    style={{ width: `${Math.min((summary.Expense / (summary.Income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Net Profit Margin</span>
                  <span className="font-medium text-green-600">{profitMargin.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${profitMargin}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
