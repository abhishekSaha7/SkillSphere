import { z } from 'zod';

export const bookingSchema = z.object({
  mentorId: z.string().min(1, 'Mentor ID is required'),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  sessionType: z.string().min(1, 'Session type is required'),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
