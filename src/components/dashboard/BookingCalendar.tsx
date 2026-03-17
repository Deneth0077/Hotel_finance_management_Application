"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatUSD } from "@/lib/currency";

interface BookingCalendarProps {
  bookings: any[];
  onEventClick?: (booking: any) => void;
}

export default function BookingCalendar({ bookings, onEventClick }: BookingCalendarProps) {
  const events = bookings.map((b) => ({
    id: b._id,
    title: `${b.guestId?.name || "Guest"} - Room ${b.roomId?.roomNumber || "N/A"}`,
    start: b.checkIn,
    end: b.checkOut,
    backgroundColor: 
      b.status === "Checked-in" ? "#10b981" : 
      b.status === "Reserved" ? "#3b82f6" : 
      b.status === "Checked-out" ? "#6b7280" : "#ef4444",
    borderColor: "transparent",
    extendedProps: { ...b }
  }));

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm calendar-container">
      <style jsx global>{`
        .fc {
          --fc-border-color: #e2e8f0;
          --fc-button-bg-color: #fff;
          --fc-button-border-color: #e2e8f0;
          --fc-button-text-color: #0f172a;
          --fc-button-hover-bg-color: #f8fafc;
          --fc-button-active-bg-color: #f1f5f9;
          --fc-today-bg-color: #f1f5f944;
          font-family: inherit;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .fc .fc-button {
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active, 
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #f1f5f9;
          color: #0f172a;
          border-color: #e2e8f0;
        }
        .fc-event {
          cursor: pointer;
          padding: 2px 4px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 4px;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        eventClick={(info: any) => {
          if (onEventClick) onEventClick(info.event.extendedProps);
        }}
        height="700px"
        nowIndicator={true}
        editable={false}
        selectable={true}
        dayMaxEvents={true}
      />
    </div>
  );
}
