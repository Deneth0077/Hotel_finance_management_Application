"use client";

import { 
  Settings, User, Bell, Shield, Database, Save, 
  Globe, Mail, Lock, Eye, EyeOff, Download, 
  Trash2, RefreshCw, CheckCircle2, History as HistoryIcon 
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [showPassword, setShowPassword] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async (date?: string) => {
    try {
      let url = "/api/logs";
      if (date) {
        url += `?startDate=${date}&endDate=${date}T23:59:59`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Fetch Logs Error:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "System & Data") {
      fetchLogs();
    }
  }, [activeTab]);

  const tabs = [
    { name: "General", icon: Settings },
    { name: "Profile", icon: User },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
    { name: "System & Data", icon: Database },
  ];

  const handleSave = () => {
    toast.success(`${activeTab} settings updated successfully!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your LuxeLedger architecture and personal preferences.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          {tabs.map((item) => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === item.name 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" /> 
              {item.name}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-card p-8 shadow-sm border border-border/50 min-h-[500px] flex flex-col justify-between animate-in slide-in-from-right-4 duration-500">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {tabs.find(t => t.name === activeTab)?.icon && <Settings className="h-5 w-5" />}
                </div>
                <h3 className="text-xl font-bold">{activeTab} Settings</h3>
              </div>

              {activeTab === "General" && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> Hotel Name
                    </label>
                    <input type="text" defaultValue="LuxeLedger Wellness Resort" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" /> Contact Email
                    </label>
                    <input type="email" defaultValue="admin@luxeledger.com" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-bold">Base Currency</label>
                      <select className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                        <option>USD ($) - International Standard</option>
                        <option>LKR (Rs) - Local Currency</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-bold">System Language</label>
                      <select className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                        <option>English (US)</option>
                        <option>Sinhala (Coming Soon)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Profile" && (
                <div className="grid gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                      CK
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Change Avatar</button>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold">Full Name</label>
                    <input type="text" defaultValue="Chathuranga KHD" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold">Professional Bio</label>
                    <textarea 
                      className="w-full h-32 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      defaultValue="Visionary leader with 10+ years in premium hospitality management."
                    ></textarea>
                  </div>
                </div>
              )}

              {activeTab === "Notifications" && (
                <div className="space-y-4">
                  {[
                    { title: "Email Notifications", desc: "Receive daily finance and booking summaries via email." },
                    { title: "Push Alerts", desc: "Get real-time browser notifications for new urgent tasks." },
                    { title: "Staff Payment Alerts", desc: "Notify when salary disbursement dates are near." },
                    { title: "Inventory Low-Stock", desc: "Get warned when kitchen supplies fall below threshold." }
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                      <div>
                        <p className="text-sm font-bold">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.desc}</p>
                      </div>
                      <div className="h-6 w-11 bg-primary/20 rounded-full relative cursor-pointer border border-primary/20">
                        <div className="absolute right-1 top-1 h-4 w-4 bg-primary rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Security" && (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-bold">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-bold">New Password</label>
                    <input type="password" placeholder="Min 8 characters" className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
                    <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase">Two-Factor Authentication</p>
                      <p className="text-xs text-blue-700 mt-1">Add an extra layer of security to your owner account. (Highly Recommended)</p>
                      <button className="mt-3 text-xs font-bold text-blue-600 underline">Enable 2FA Intelligence</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "System & Data" && (
                <div className="space-y-6">
                   <div className="p-6 rounded-2xl border bg-card/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <p className="text-sm font-bold">System Status: Optimal</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Real-time Health Check</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/10">
                        <span>Database Engine: MongoDB v7.1</span>
                        <span>Next.js Engine: v16.1</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <HistoryIcon className="h-4 w-4 text-primary" /> System Activity Logs
                        </h4>
                        <div className="flex items-center gap-2">
                          <input 
                            type="date" 
                            className="text-[10px] bg-muted px-2 py-1 rounded-lg border focus:outline-none"
                            onChange={(e) => fetchLogs(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="border rounded-xl overflow-hidden bg-muted/10">
                        <div className="max-h-[300px] overflow-y-auto">
                          <table className="w-full text-[11px] text-left">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr>
                                <th className="p-3 font-bold uppercase text-muted-foreground">Timestamp</th>
                                <th className="p-3 font-bold uppercase text-muted-foreground">User</th>
                                <th className="p-3 font-bold uppercase text-muted-foreground">Action</th>
                                <th className="p-3 font-bold uppercase text-muted-foreground">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logs.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No logs found for this period.</td></tr>
                              ) : logs.map((log: any, i: number) => (
                                <tr key={i} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold">{log.user.name}</span>
                                    <div className="text-[9px] text-primary">{log.user.role}</div>
                                  </td>
                                  <td className="p-3 font-medium text-foreground">{log.action}</td>
                                  <td className="p-3 text-muted-foreground">{log.details}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <button 
                        onClick={() => fetchLogs()}
                        className="w-full py-2 bg-muted/50 text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-colors rounded-lg flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-3 w-3" /> Refresh Logs
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:bg-muted transition-all group">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                          <Download className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Export Ledger</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Download JSON/CSV</p>
                        </div>
                      </button>
                   </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t">
              <button 
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
