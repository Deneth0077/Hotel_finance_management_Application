"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { MetricCard } from "./MetricCard";
import { DollarSign, TrendingDown, Wallet } from "lucide-react";
import { formatDualCurrency, formatLKR } from "@/lib/currency";

interface AnalyticsData {
  summary: { Income?: number; Expense?: number };
  dailyStats: Array<{
    _id: { year: number; month: number; day: number; type: string };
    total: number;
  }>;
}

export function FinanceOverview() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["finance-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/finance/analytics");
      return res.json();
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading Financial Data...</div>;

  const summary = data?.summary || {};
  const income = summary.Income || 0;
  const expense = summary.Expense || 0;
  const profit = income - expense;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value={formatDualCurrency(income)} 
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
          description="Total incoming payments"
        />
        <MetricCard 
          title="Total Expenses" 
          value={formatLKR(expense)} 
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          description="Staff, kitchen, utilities"
        />
        <MetricCard 
          title="Net Profit" 
          value={formatDualCurrency(profit)} 
          icon={<Wallet className="h-4 w-4 text-blue-500" />}
          description="Earnings after expenses"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  tickFormatter={(val) => `${val.month}/${val.day}`} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Daily Revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
          {/* Pie Chart or List of Category Totals */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Staff Salaries</span>
              <span className="font-medium">Calculation based on Transactions...</span>
            </div>
            {/* Additional categories would be mapped here */}
          </div>
        </div>
      </div>
    </div>
  );
}
