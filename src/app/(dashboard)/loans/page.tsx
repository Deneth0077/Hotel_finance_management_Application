"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  CreditCard, Calendar, Landmark, 
  ArrowRightCircle, CheckCircle2, AlertCircle,
  Plus, History, DollarSign, Clock
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatLKR } from "@/lib/currency";
import Link from "next/link";

export default function LoansPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const res = await fetch("/api/loans");
      return res.json();
    }
  });

  const loans = data?.loans || [];
  const summary = data?.summary || { totalDebt: 0, monthlyTotal: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans & Leasing</h1>
          <p className="text-muted-foreground">Manage bank loans, vehicle leasing, and repayment schedules.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
          <Plus className="h-4 w-4" /> New Loan/Lease
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Outstanding" 
          value={formatLKR(summary.totalDebt)} 
          icon={<Landmark className="h-4 w-4 text-red-500" />}
          description="Total active debt"
        />
        <MetricCard 
          title="Monthly Commitment" 
          value={formatLKR(summary.monthlyTotal)} 
          icon={<CreditCard className="h-4 w-4 text-blue-500" />}
          description="Total monthly installments"
        />
        <MetricCard 
          title="Active Agreements" 
          value={loans.filter((l: any) => l.status === "Active").length.toString()} 
          icon={<Clock className="h-4 w-4 text-orange-500" />}
          description="Ongoing repayment plans"
        />
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold px-2">Active Debt Schedules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-4 font-medium text-muted-foreground">Facility Name</th>
                <th className="p-4 font-medium text-muted-foreground">Type</th>
                <th className="p-4 font-medium text-muted-foreground">Monthly Installment</th>
                <th className="p-4 font-medium text-muted-foreground">Repayment Day</th>
                <th className="p-4 font-medium text-muted-foreground">Remaining Balance</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Loading debt data...</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground italic">No loans or leases recorded.</td></tr>
              ) : loans.map((loan: any) => {
                const totalMonths = loan.tenureMonths;
                const remainingMonths = Math.ceil(loan.remainingBalance / (loan.monthlyInstallment || 1));
                
                return (
                  <tr key={loan._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{loan.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{loan.lender}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        loan.type === "Leasing" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {loan.type}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {formatLKR(loan.monthlyInstallment)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Day {loan.repaymentDay}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-red-600">{formatLKR(loan.remainingBalance)}</div>
                      <div className="text-[10px] text-muted-foreground italic">~{remainingMonths} months left</div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        loan.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {loan.status === "Active" ? <ArrowRightCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {loan.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-primary hover:underline font-medium text-xs">Post Payment</button>
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
