"use client";

import { BedDouble, Plus, X, Save, Edit3, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatLKR } from "@/lib/currency";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
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

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRoomId ? `/api/rooms/${editingRoomId}` : "/api/rooms";
      const method = editingRoomId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setEditingRoomId(null);
        setFormData({ roomNumber: "", type: "Single", pricePerNight: 0, status: "Available" });
        toast.success(editingRoomId ? "Room updated successfully" : "Room added successfully");
        fetchRooms();
      }
    } catch (e) {
      toast.error("Failed to save room details");
    }
  };

  const openEditModal = (room: any) => {
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      status: room.status
    });
    setEditingRoomId(room._id);
    setIsFormOpen(true);
  };

  const deleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Room deleted");
        fetchRooms();
      }
    } catch (e) {
      toast.error("Delete failed");
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
          onClick={() => {
            setEditingRoomId(null);
            setFormData({ roomNumber: "", type: "Single", pricePerNight: 0, status: "Available" });
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
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
                  <td className="p-4 text-muted-foreground font-semibold">{formatLKR(r.pricePerNight)}</td>
                  <td className="p-4">
                    <select 
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer border shadow-sm ${
                        r.status === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        r.status === "Occupied" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        r.status === "Cleaning" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(r)}
                      className="p-2 rounded-lg hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors border"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteRoom(r._id)}
                      className="p-2 rounded-lg hover:bg-destructive/5 text-muted-foreground hover:text-destructive transition-colors border"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary"><BedDouble className="h-5 w-5" /></div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">{editingRoomId ? "Edit Room" : "Add Room"}</h2>
              </div>
              <button 
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingRoomId(null);
                }} 
                className="rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Room Number</label>
                <input required placeholder="001..." className="w-full rounded-xl border border-input bg-background p-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Room Type</label>
                <select className="w-full rounded-xl border border-input bg-background p-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Single</option>
                  <option>Double</option>
                  <option>Suite</option>
                  <option>Deluxe</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Price per Night (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">Rs.</span>
                  <input required type="number" className="w-full rounded-xl border border-input bg-background pl-12 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingRoomId(null);
                  }} 
                  className="flex-1 rounded-xl border py-3 text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" /> {editingRoomId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
