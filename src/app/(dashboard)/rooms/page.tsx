"use client";

import { BedDouble, Plus, X, Save } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useState, useEffect } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "Single",
    pricePerNight: 0,
    status: "Available"
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({ roomNumber: "", type: "Single", pricePerNight: 0, status: "Available" });
        fetchRooms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/rooms/${id}`, { // Need to create this dynamic route if not exists or use generic
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-6 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
          <p className="text-2xl font-bold">{rooms.length}</p>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-secondary">{rooms.filter(r => r.status === 'Available').length}</p>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Occupied</p>
          <p className="text-2xl font-bold text-primary">{rooms.filter(r => r.status === 'Occupied').length}</p>
        </div>
        <div className="rounded-xl bg-card p-6 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
          <p className="text-2xl font-bold text-destructive">{rooms.filter(r => r.status === 'Maintenance').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl bg-card shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Room #</th>
                <th className="p-4 font-medium text-muted-foreground">Type</th>
                <th className="p-4 font-medium text-muted-foreground">Price</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No rooms found</td></tr>
              ) : rooms.map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{r.roomNumber}</td>
                  <td className="p-4 text-muted-foreground">{r.type}</td>
                  <td className="p-4 text-muted-foreground">${r.pricePerNight}</td>
                  <td className="p-4">
                    <select 
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold appearance-none cursor-pointer ${
                        r.status === "Available" ? "bg-green-100 text-green-700" :
                        r.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                        r.status === "Cleaning" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:underline font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Room</h2>
              <button onClick={() => setIsFormOpen(false)} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Room Number</label>
                <input required className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Room Type</label>
                <select className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Single</option>
                  <option>Double</option>
                  <option>Suite</option>
                  <option>Deluxe</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price per Night ($)</label>
                <input required type="number" className="rounded-lg border border-input bg-background p-2 text-sm" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
