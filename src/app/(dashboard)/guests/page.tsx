"use client";

import { 
  Search, Plus, X, Save, 
  User, Calendar, CreditCard, 
  Stethoscope, Utensils, Info, 
  Trash2, Edit3, CheckCircle2,
  TrendingDown, TrendingUp, HandCoins,
  History, PlaneLanding, PlaneTakeoff,
  MapPin, Phone, Mail, FileText
} from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatLKR } from "@/lib/currency";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullGuestData, setFullGuestData] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSpendingModalOpen, setIsSpendingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    medicalCondition: "",
    emergencyContact: "",
    notes: ""
  });

  const [spendingForm, setSpendingForm] = useState({ description: "", amount: "" });

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setGuests(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (e) {
      toast.error("Failed to load guest list");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullDetails = async (id: string) => {
    setIsDetailsLoading(true);
    try {
      const res = await fetch(`/api/guests/${id}/full-details`);
      const data = await res.json();
      setFullGuestData(data);
    } catch (e) {
      toast.error("Failed to load guest records");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchFullDetails(selectedId);
    }
  }, [selectedId]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          medicalCondition: formData.medicalCondition ? formData.medicalCondition.split(",").map(c => c.trim()) : []
        }),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ name: "", email: "", phone: "", country: "", medicalCondition: "", emergencyContact: "", notes: "" });
        toast.success("Guest profile created");
        fetchGuests();
      }
    } catch (e) {
      toast.error("Error creating guest");
    }
  };

  const handleAddSpending = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/guests/${selectedId}/spendings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: spendingForm.description,
          amount: Number(spendingForm.amount)
        }),
      });
      if (res.ok) {
        setIsSpendingModalOpen(false);
        setSpendingForm({ description: "", amount: "" });
        toast.success("Spending recorded");
        fetchFullDetails(selectedId);
      }
    } catch (e) {
      toast.error("Failed to record spending");
    }
  };

  const deleteSpending = async (spendingId: string) => {
    if (!selectedId) return;
    if (!confirm("Are you sure you want to remove this record?")) return;
    try {
      const res = await fetch(`/api/guests/${selectedId}/spendings?spendingId=${spendingId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Record removed");
        fetchFullDetails(selectedId);
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const calculateFinance = () => {
    if (!fullGuestData) return { total: 0, room: 0, treatments: 0, extras: 0 };
    const roomCost = fullGuestData.booking?.totalAmount || 0;
    const treatmentsCost = fullGuestData.treatments?.reduce((acc: number, t: any) => acc + (t.sessionPrice || t.treatmentId?.price || 0), 0) || 0;
    const extrasCost = fullGuestData.guest?.extraSpendings?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0;
    return {
      total: roomCost + treatmentsCost + extrasCost,
      room: roomCost,
      treatments: treatmentsCost,
      extras: extrasCost
    };
  };

  const finances = calculateFinance();
  const filteredGuests = guests.filter(g => 
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Relations</h1>
          <p className="text-muted-foreground">360-degree view of guest stay, finance, and wellness.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add New Guest
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar: Guest List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search guests..." 
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center"><span className="animate-pulse text-sm text-muted-foreground">Loading Guests...</span></div>
            ) : filteredGuests.map((g) => (
              <button
                key={g._id}
                onClick={() => setSelectedId(g._id)}
                className={`w-full rounded-xl p-4 text-left transition-all border ${
                  selectedId === g._id 
                    ? "bg-primary/10 border-primary/30 shadow-sm" 
                    : "bg-card border-transparent hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      selectedId === g._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {g.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[120px]">{g.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{g.country}</p>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${g.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Guest Dashboard */}
        <div className="lg:col-span-9 space-y-6">
          {isDetailsLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed">
              <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3" />
              <p className="text-muted-foreground font-medium">Synchronizing guest records...</p>
            </div>
          ) : fullGuestData ? (
            <div className="animate-in fade-in duration-500">
              {/* Profile Card */}
              <div className="rounded-2xl bg-card border shadow-card overflow-hidden">
                <div className="bg-muted/30 p-6 border-b">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{fullGuestData.guest.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {fullGuestData.guest.country}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {fullGuestData.guest.phone}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase font-black"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {fullGuestData.guest.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors border"><Edit3 className="h-4 w-4" /></button>
                       <button className="p-2 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors border"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border px-6 flex flex-wrap gap-6 bg-background">
                  {[
                    { id: "overview", label: "Overview", icon: Info },
                    { id: "stays", label: "Accomodation", icon: Calendar },
                    { id: "finance", label: "Financial Ledger", icon: CreditCard },
                    { id: "wellness", label: "Treatments", icon: Stethoscope },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 border-b-2 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard title="Total Package" value={formatLKR(finances.total)} icon={<CreditCard className="text-blue-500" />} className="bg-blue-50/50" />
                        <MetricCard title="Room Revenue" value={formatLKR(finances.room)} icon={<Calendar className="text-indigo-500" />} />
                        <MetricCard title="Wellness Share" value={formatLKR(finances.treatments)} icon={<Stethoscope className="text-rose-500" />} />
                        <MetricCard title="Extra Spendings" value={formatLKR(finances.extras)} icon={<TrendingUp className="text-amber-500" />} className="bg-amber-50/50" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Medical Records</h4>
                          <div className="flex flex-wrap gap-2">
                             {fullGuestData.guest.medicalCondition?.length > 0 ? fullGuestData.guest.medicalCondition.map((c: string, i: number) => (
                               <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100">{c}</span>
                             )) : <p className="text-sm text-muted-foreground italic">No medical history noted</p>}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Guest Notes</h4>
                          <div className="p-4 bg-muted/20 rounded-xl border border-dashed">
                             <p className="text-sm text-foreground line-clamp-3">{fullGuestData.guest.notes || "Add personal preferences or notes about this guest..."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "stays" && (
                    <div className="space-y-6">
                      {fullGuestData.booking ? (
                        <div className="rounded-2xl border p-6 space-y-6 bg-slate-50/50">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center border font-bold text-lg">
                                  {fullGuestData.booking.roomId?.roomNumber || "N/A"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg">Suite Management</h4>
                                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{fullGuestData.booking.roomId?.type || "Standard Room"}</p>
                                </div>
                              </div>
                              <StatusBadge label={fullGuestData.booking.status} variant="info" />
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1"><PlaneLanding className="h-3 w-3" /> Check-In</span>
                                <p className="text-sm font-bold">{new Date(fullGuestData.booking.checkIn).toLocaleDateString()}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1"><PlaneTakeoff className="h-3 w-3" /> Check-Out</span>
                                <p className="text-sm font-bold">{new Date(fullGuestData.booking.checkOut).toLocaleDateString()}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Base Rate / Day</span>
                                <p className="text-sm font-bold text-emerald-600">{formatLKR(fullGuestData.booking.roomId?.pricePerNight || 0)}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Est. Room Cost</span>
                                <p className="text-sm font-bold">{formatLKR(fullGuestData.booking.totalAmount)}</p>
                              </div>
                           </div>

                           <div className="pt-4 border-t flex justify-end gap-3">
                              <button className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-muted transition-all">Extend Stay</button>
                              <button className="px-4 py-2 text-xs font-bold bg-white border rounded-lg hover:bg-muted transition-all">Change Room</button>
                           </div>
                        </div>
                      ) : (
                        <div className="p-12 text-center border-2 border-dashed rounded-2xl">
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                          <p className="text-muted-foreground font-medium">No active room bookings found for this guest.</p>
                          <button className="mt-4 text-primary text-sm font-black uppercase tracking-widest hover:underline">+ Link New Stay</button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "finance" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Utensils className="h-4 w-4" /> Extra Services & Extras</h4>
                         <button 
                           onClick={() => setIsSpendingModalOpen(true)}
                           className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                         >
                           <Plus className="h-3 w-3" /> Add Spending
                         </button>
                      </div>

                      <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase font-black">
                              <th className="p-4 text-left">Description</th>
                              <th className="p-4 text-left">Date</th>
                              <th className="p-4 text-right">Amount</th>
                              <th className="p-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fullGuestData.guest.extraSpendings?.length > 0 ? fullGuestData.guest.extraSpendings.map((s: any) => (
                              <tr key={s._id} className="border-t hover:bg-muted/10 transition-colors">
                                <td className="p-4 font-semibold">{s.description}</td>
                                <td className="p-4 text-muted-foreground">{new Date(s.date).toLocaleDateString()}</td>
                                <td className="p-4 text-right font-bold text-amber-600">{formatLKR(s.amount)}</td>
                                <td className="p-4 text-right">
                                   <button onClick={() => deleteSpending(s._id)} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                                </td>
                              </tr>
                            )) : (
                              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No extra spendings recorded yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Checkout Balance</p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Combined Accommodation, Wellness & Extras</p>
                         </div>
                         <div className="text-right">
                            <p className="text-3xl font-black text-primary tracking-tighter">{formatLKR(finances.total)}</p>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Settlement Required at Check-out</span>
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "wellness" && (
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-rose-600"><History className="h-4 w-4" /> Wellness History</h4>
                         <button className="text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-200 transition-all">+ Book Session</button>
                      </div>

                      <div className="grid gap-4">
                        {fullGuestData.treatments?.length > 0 ? fullGuestData.treatments.map((t: any) => (
                          <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:border-rose-200 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                   <Stethoscope className="h-5 w-5" />
                                </div>
                                <div>
                                   <h5 className="font-bold text-sm tracking-tight">{t.treatmentId?.name || "Global Treatment"}</h5>
                                   <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold"><Calendar className="h-3 w-3" /> {new Date(t.scheduledTime).toLocaleString()}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="font-black text-sm">{formatLKR(t.sessionPrice || t.treatmentId?.price || 0)}</p>
                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{t.status}</span>
                             </div>
                          </div>
                        )) : (
                          <div className="p-12 text-center border-2 border-dashed rounded-2xl">
                             <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                             <p className="text-muted-foreground">No treatment history found.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-2xl border-2 border-dashed text-muted-foreground bg-muted/20">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                 <User className="h-12 w-12 opacity-30" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">Select a Guest Profile</p>
              <p className="text-sm mt-1">To view room details, treatments, and financial ledger.</p>
            </div>
          )}
        </div>
      </div>

      {/* Spending Modal */}
      {isSpendingModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl border animate-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2"><HandCoins className="h-5 w-5" /> Add Spending</h3>
                  <button onClick={() => setIsSpendingModalOpen(false)} className="p-1.5 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
               </div>
               <form onSubmit={handleAddSpending} className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Spending Description</label>
                     <input 
                       required 
                       placeholder="e.g. Lunch Service, Airport Taxi, Laundry"
                       className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" 
                       value={spendingForm.description}
                       onChange={e => setSpendingForm({...spendingForm, description: e.target.value})}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Amount (LKR)</label>
                     <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-xs">Rs.</span>
                       <input 
                         required 
                         type="number"
                         className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" 
                         value={spendingForm.amount}
                         onChange={e => setSpendingForm({...spendingForm, amount: e.target.value})}
                       />
                     </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                     Update Ledger
                  </button>
               </form>
           </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><User className="h-6 w-6" /></div>
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">New Guest Profile</h2>
                    <p className="text-xs text-muted-foreground font-medium">Create a baseline record for checking-in.</p>
                 </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="rounded-full p-2 hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input required placeholder="Enter Guest Name..." className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required type="email" placeholder="email@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required placeholder="+94..." className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Country / Region</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input required placeholder="e.g. Germany, USA, Local" className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5"><Stethoscope className="h-3 w-3" /> Medical Conditions</label>
                <input placeholder="Diabetes, High Blood Pressure, etc." className="w-full px-4 py-3 rounded-xl border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.medicalCondition} onChange={e => setFormData({...formData, medicalCondition: e.target.value})} />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-xl border py-3 text-xs font-black uppercase tracking-widest hover:bg-muted transition-all">Dismiss</button>
                <button type="submit" className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Finalize Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
