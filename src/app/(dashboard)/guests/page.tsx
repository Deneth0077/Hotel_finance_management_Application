"use client";

import { Search, Plus, X, Save } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useState, useEffect } from "react";

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guests");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
      if (data.length > 0) setSelectedGuest(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          medicalCondition: formData.medicalCondition.split(",").map(c => c.trim())
        }),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ name: "", email: "", phone: "", country: "", medicalCondition: "", emergencyContact: "", notes: "" });
        fetchGuests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredGuests = guests.filter(g => 
    g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Guest
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Guest List */}
        <div className="lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search guests..." 
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {loading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>
            ) : filteredGuests.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No guests found</p>
            ) : filteredGuests.map((g) => (
              <button
                key={g._id}
                onClick={() => setSelectedGuest(g)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedGuest?._id === g._id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${selectedGuest?._id === g._id ? "font-semibold text-primary" : "font-medium"}`}>{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.country}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${g.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Guest Profile */}
        <div className="lg:col-span-2">
          {selectedGuest ? (
            <div className="rounded-xl bg-card shadow-card">
              <div className="border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedGuest.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedGuest.email}</p>
                  </div>
                  <StatusBadge label={selectedGuest.status || "Arriving"} variant={selectedGuest.status === "Active" ? "success" : "info"} />
                </div>
              </div>

              <div className="border-b border-border px-6">
                <div className="flex gap-6">
                  {["details", "notes"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`border-b-2 py-3 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div><p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Phone</p><p className="font-medium">{selectedGuest.phone}</p></div>
                      <div><p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Country</p><p className="font-medium">{selectedGuest.country}</p></div>
                      <div><p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Emergency Contact</p><p className="font-medium">{selectedGuest.emergencyContact || "N/A"}</p></div>
                      <div><p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Status</p><p className="mt-1"><StatusBadge label={selectedGuest.status || "Arriving"} variant={selectedGuest.status === "Active" ? "success" : "info"} /></p></div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-2">Medical Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGuest.medicalCondition?.map((c: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs font-medium">{c}</span>
                        )) || <span className="text-muted-foreground italic">No conditions noted</span>}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "notes" && (
                  <div className="space-y-3">
                    {selectedGuest.notes ? (
                      <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                        <p className="text-sm italic">{selectedGuest.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-4 text-center">No notes found for this guest.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
              Select a guest to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Guest Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Guest Profile</h2>
              <button onClick={() => setIsFormOpen(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input required className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <input required type="email" className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input required className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Country</label>
                <input required className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Medical Condition (comma separated)</label>
                <input className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.medicalCondition} onChange={e => setFormData({...formData, medicalCondition: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea className="rounded-lg border border-input bg-background p-2 text-sm h-20" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Save Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
