/**
 * Logic to prevent double bookings in a room.
 * This should be used in the POST/PUT /api/bookings route.
 */
import Booking from "@/models/Booking";

export async function isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date) {
  const overlappingBooking = await Booking.findOne({
    roomId,
    status: { $ne: "Cancelled" }, // Ignore cancelled bookings
    $or: [
      {
        // New checkIn is during an existing booking
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });

  return !overlappingBooking;
}
