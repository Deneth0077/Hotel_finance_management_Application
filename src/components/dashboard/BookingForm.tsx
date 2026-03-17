"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface BookingFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  prefillGroupId?: string;
  prefillRoomId?: string;
}

export function BookingForm({ onClose, onSuccess, initialData, prefillGroupId, prefillRoomId }: BookingFormProps) {
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewGuestMode, setIsNewGuestMode] = useState(false);
  const [newGuestData, setNewGuestData] = useState({ name: "", email: "", phone: "", country: "" });
  const [formData, setFormData] = useState({
    guestId: prefillGroupId || initialData?.guestId?._id || initialData?.guestId || "",
    roomId: prefillRoomId || initialData?.roomId?._id || initialData?.roomId || "",
    package: initialData?.package || "7-Day Rejuvenate",
    checkIn: initialData?.checkIn ? new Date(initialData.checkIn).toISOString().split('T')[0] : "",
    checkOut: initialData?.checkOut ? new Date(initialData.checkOut).toISOString().split('T')[0] : "",
    totalAmount: initialData?.totalAmount || 0,
    status: initialData?.status || "Reserved",
  });

  useEffect(() => {
    fetch("/api/guests").then(res => res.json()).then(setGuests);
    fetch("/api/rooms").then(res => res.json()).then(setRooms);
    fetch("/api/bookings").then(res => res.json()).then(setAllBookings);
  }, []);

  const isRoomBooked = (roomId: string) => {
    if (!formData.checkIn || !formData.checkOut) return false;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);

    return allBookings.some(b => {
      // Skip the current booking if we are editing
      if (initialData?._id === b._id) return false;
      if (b.roomId?._id !== roomId && b.roomId !== roomId) return false;
      if (b.status === "Cancelled") return false;

      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);

      return (start < bEnd && end > bStart);
    });
  };

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.roomId) {
      const room = rooms.find(r => r._id === formData.roomId);
      if (room) {
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        if (nights > 0) {
          setFormData(prev => ({ ...prev, totalAmount: nights * room.pricePerNight }));
        }
      }
    }
  }, [formData.checkIn, formData.checkOut, formData.roomId, rooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let currentGuestId = formData.guestId;

      // Create new guest first if in new guest mode
      if (isNewGuestMode) {
        const guestRes = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGuestData),
        });
        if (guestRes.ok) {
          const newGuest = await guestRes.json();
          currentGuestId = newGuest._id;
        } else {
          toast.error("Failed to create new guest profile");
          setLoading(false);
          return;
        }
      }

      const url = initialData ? `/api/bookings/${initialData._id}` : "/api/bookings";
      const method = initialData ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, guestId: currentGuestId }),
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Guest Information</label>
              {!initialData && (
                <button 
                  type="button" 
                  onClick={() => setIsNewGuestMode(!isNewGuestMode)}
                  className="text-[10px] font-black uppercase text-primary hover:underline"
                >
                  {isNewGuestMode ? "Select Existing" : "+ New Guest Profile"}
                </button>
              )}
            </div>
            
            {isNewGuestMode ? (
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl border border-dashed animate-in fade-in slide-in-from-top-2">
                <input required placeholder="Full Name" className="col-span-2 rounded-lg border bg-background p-2 text-sm" value={newGuestData.name} onChange={e => setNewGuestData({...newGuestData, name: e.target.value})} />
                <input placeholder="Email" className="rounded-lg border bg-background p-2 text-sm" value={newGuestData.email} onChange={e => setNewGuestData({...newGuestData, email: e.target.value})} />
                <input required placeholder="Phone" className="rounded-lg border bg-background p-2 text-sm" value={newGuestData.phone} onChange={e => setNewGuestData({...newGuestData, phone: e.target.value})} />
              </div>
            ) : (
              <select 
                required
                disabled={!!prefillGroupId}
                className="rounded-lg border border-input bg-background p-2 text-sm disabled:opacity-75"
                value={formData.guestId}
                onChange={e => setFormData({ ...formData, guestId: e.target.value })}
              >
                <option value="">Choose a guest...</option>
                {guests.map(g => <option key={g._id} value={g._id}>{g.name} ({g.phone})</option>)}
              </select>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Room</label>
            <select 
              required
              disabled={!!prefillRoomId}
              className={`rounded-lg border border-input bg-background p-2 text-sm disabled:opacity-75 ${isRoomBooked(formData.roomId) ? 'border-destructive text-destructive' : ''}`}
              value={formData.roomId}
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
            >
              <option value="">{formData.checkIn ? "Choose a room..." : "Set dates first..."}</option>
              {rooms.map(r => {
                const booked = isRoomBooked(r._id);
                return (
                  <option key={r._id} value={r._id} disabled={booked} className={booked ? "text-muted-foreground line-through" : ""}>
                    {r.roomNumber} - {r.type} (Rs.{r.pricePerNight}/night) {booked ? "— [ALREADY BOOKED]" : ""}
                  </option>
                );
              })}
            </select>
            {isRoomBooked(formData.roomId) && (
              <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">Caution: Room is already booked for these dates!</p>
            )}
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
            <label className="text-sm font-medium">Estimated Total (LKR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rs.</span>
              <input 
                type="number" 
                required
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm font-bold"
                value={formData.totalAmount}
                onChange={e => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium italic">Auto-calculated based on stay duration.</p>
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
