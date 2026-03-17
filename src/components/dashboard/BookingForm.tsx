"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function BookingForm({ onClose, onSuccess, initialData }: BookingFormProps) {
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestId: initialData?.guestId?._id || initialData?.guestId || "",
    roomId: initialData?.roomId?._id || initialData?.roomId || "",
    package: initialData?.package || "7-Day Rejuvenate",
    checkIn: initialData?.checkIn ? new Date(initialData.checkIn).toISOString().split('T')[0] : "",
    checkOut: initialData?.checkOut ? new Date(initialData.checkOut).toISOString().split('T')[0] : "",
    totalAmount: initialData?.totalAmount || 0,
    status: initialData?.status || "Reserved",
  });

  useEffect(() => {
    fetch("/api/guests").then(res => res.json()).then(setGuests);
    fetch("/api/rooms").then(res => res.json()).then(setRooms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData ? `/api/bookings/${initialData._id}` : "/api/bookings";
      const method = initialData ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
        onClose();
        toast.success(initialData ? "Booking updated successfully!" : "Booking created successfully!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create booking");
      }
    } catch (error) {
      toast.error("Error creating booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{initialData ? "Edit Booking" : "New Booking"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Guest</label>
            <select 
              required
              className="rounded-lg border border-input bg-background p-2 text-sm"
              value={formData.guestId}
              onChange={e => setFormData({ ...formData, guestId: e.target.value })}
            >
              <option value="">Choose a guest...</option>
              {guests.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Room</label>
            <select 
              required
              className="rounded-lg border border-input bg-background p-2 text-sm"
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="">Choose a room...</option>
              {rooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber} - {r.type} (${r.pricePerNight}/night)</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Treatment Package</label>
            <select 
              className="rounded-lg border border-input bg-background p-2 text-sm"
              value={formData.package}
              onChange={e => setFormData({ ...formData, package: e.target.value })}
            >
              <option>7-Day Rejuvenate</option>
              <option>14-Day Deep Detox</option>
              <option>3-Day Quick Relax</option>
              <option>Custom Plan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Check-in</label>
              <input 
                type="date" 
                required
                className="rounded-lg border border-input bg-background p-2 text-sm"
                value={formData.checkIn}
                onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Check-out</label>
              <input 
                type="date" 
                required
                className="rounded-lg border border-input bg-background p-2 text-sm"
                value={formData.checkOut}
                onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Total Amount ($)</label>
            <input 
              type="number" 
              required
              className="rounded-lg border border-input bg-background p-2 text-sm"
              value={formData.totalAmount}
              onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 rounded-lg border border-input py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : initialData ? "Update Booking" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
