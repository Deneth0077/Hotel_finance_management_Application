"use client";

import { Activity, Plus, Clock, DollarSign, X, Save, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Massage",
    duration: 60,
    price: 0,
    description: ""
  });

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/treatments");
      const data = await res.json();
      setTreatments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ name: "", category: "Massage", duration: 60, price: 0, description: "" });
        fetchTreatments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Treatments</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Treatment
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground p-12">No treatments found. Start by adding one.</p>
          ) : treatments.map((t) => (
            <div key={t._id} className="rounded-xl bg-card p-6 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Heart className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full text-muted-foreground uppercase tracking-wider">
                  {t.category}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{t.name}</h3>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {t.duration} min
                </div>
                <div className="flex items-center gap-1 font-bold text-primary">
                  <DollarSign className="h-4 w-4" /> {t.price}
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted transition-colors">
                  Edit
                </button>
                <button className="flex-1 rounded-lg bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Treatment Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Treatment</h2>
              <button onClick={() => setIsFormOpen(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddTreatment} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Treatment Name</label>
                <input required className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Massage</option>
                    <option>Hydrotherapy</option>
                    <option>Acupuncture</option>
                    <option>Diet</option>
                    <option>Healing</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Duration (mins)</label>
                  <input required type="number" className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price ($)</label>
                <input required type="number" className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Save Treatment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
