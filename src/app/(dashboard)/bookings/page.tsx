"use client";

import { Search, Plus, Filter, Calendar as CalendarIcon, MoreVertical, Trash2, Edit } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useState, useEffect } from "react";
import { BookingForm } from "@/components/dashboard/BookingForm";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import { AlertCircle, Bell, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function BookingsPage() {
  const [view, setView] = useState<"table" | "calendar">("table");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchBookings();
        toast.success(`Booking status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchBookings();
        toast.success("Booking deleted successfully");
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "Reserved": return "info";
      case "Checked-in": return "success";
      case "Checked-out": return "neutral";
      case "Cancelled": return "destructive";
      default: return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings & Reservations</h1>
          <p className="text-muted-foreground">Manage guest stays, room availability, and check-ins.</p>
        </div>
        <button 
          onClick={() => { setEditingBooking(null); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Booking
        </button>
      </div>

      {/* Modern Reminders / High-Priority Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-blue-500 p-2 rounded-lg text-white">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Today's Reminders</p>
            <p className="text-sm font-medium text-blue-900">{bookings.filter(b => b.status === "Reserved").length} Pending Check-ins</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-green-500 p-2 rounded-lg text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Status</p>
            <p className="text-sm font-medium text-green-900">{bookings.filter(b => b.status === "Checked-in").length} Guests In-House</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-amber-500 p-2 rounded-lg text-white">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Upcoming</p>
            <p className="text-sm font-medium text-amber-900">{bookings.filter(b => b.status === "Checked-out").length} Completed Stays</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-purple-500 p-2 rounded-lg text-white">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Urgent</p>
            <p className="text-sm font-medium text-purple-900">Room cleaning required</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search bookings..." className="h-10 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            <Filter className="h-4 w-4" /> Status
          </button>
        </div>
        <div className="flex rounded-lg border border-input">
          <button onClick={() => setView("table")} className={`px-3 py-2 text-sm font-medium rounded-l-lg ${view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Table
          </button>
          <button onClick={() => setView("calendar")} className={`px-3 py-2 text-sm font-medium rounded-r-lg ${view === "calendar" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Calendar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : view === "table" ? (
        <div className="rounded-xl bg-card shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Guest</th>
                <th className="p-4 font-medium text-muted-foreground">Room</th>
                <th className="p-4 font-medium text-muted-foreground">Package</th>
                <th className="p-4 font-medium text-muted-foreground">Check-in</th>
                <th className="p-4 font-medium text-muted-foreground">Check-out</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings found</td></tr>
              ) : bookings.map((b) => (
                <tr key={b._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{b.guestId?.name || "Unknown"}</td>
                  <td className="p-4 text-muted-foreground">{b.roomId?.roomNumber || "N/A"}</td>
                  <td className="p-4 text-muted-foreground">{b.package}</td>
                  <td className="p-4 tabular-nums text-muted-foreground">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="p-4 tabular-nums text-muted-foreground">{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select 
                      value={b.status}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold appearance-none cursor-pointer ${
                        b.status === "Reserved" ? "bg-blue-100 text-blue-700" :
                        b.status === "Checked-in" ? "bg-green-100 text-green-700" :
                        b.status === "Checked-out" ? "bg-gray-100 text-gray-700" :
                        "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Reserved">Reserved</option>
                      <option value="Checked-in">Checked-in</option>
                      <option value="Checked-out">Checked-out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setEditingBooking(b); setIsFormOpen(true); }} className="text-amber-500 hover:text-amber-600 p-2">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteBooking(b._id)} className="text-destructive hover:text-destructive/80 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <BookingCalendar bookings={bookings} />
      )}

      {isFormOpen && (
        <BookingForm 
          onClose={() => { setIsFormOpen(false); setEditingBooking(null); }} 
          onSuccess={fetchBookings} 
          initialData={editingBooking}
        />
      )}
    </div>
  );
}
