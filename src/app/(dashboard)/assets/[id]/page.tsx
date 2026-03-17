"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Calendar, DollarSign, Wrench, 
  TrendingDown, Info, ShieldCheck, History 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";

export default function AssetDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: asset, isLoading } = useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      const res = await fetch(`/api/assets/${id}`); // Assuming a GET by ID route exists or will be added
      return res.json();
    }
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading asset details...</div>;
  if (!asset) return <div className="p-8 text-center text-red-500">Asset not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">{asset.name}</h1>
                <p className="text-muted-foreground">{asset.category} · {asset.location}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                asset.condition === "Excellent" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {asset.condition}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Purchase Date</p>
                <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {new Date(asset.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Purchase Price</p>
                <p className="font-medium text-foreground">${asset.purchasePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Current Value</p>
                <p className="font-medium text-primary">${asset.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Depreciation</p>
                <p className="font-medium text-red-500">{asset.depreciationRate}% Annual</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" /> Valuation History
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={asset.valueHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    stroke="#94A3B8" 
                    fontSize={12}
                  />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Maintenance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Typical Annual Cost</span>
                <span className="font-medium">${asset.annualMaintenanceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Schedule</span>
                <span className="font-medium">{asset.maintenanceSchedule}</span>
              </div>
              <button className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm">
                Log New Maintenance
              </button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Recent Repairs
            </h3>
            <div className="space-y-4">
              {asset.maintenanceHistory?.length > 0 ? (
                asset.maintenanceHistory.slice(-3).map((log: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                    <p className="text-sm font-medium">{log.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()} · ${log.cost}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No maintenance history recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
