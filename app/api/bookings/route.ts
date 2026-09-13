import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookingSchema } from '@/lib/validations/booking';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let bookings: any[] = [];

    if (role === 'STUDENT') {
      bookings = await db.mentorBooking.findMany({
        where: { studentId: session.user.id },
        include: {
          mentor: { include: { user: true } },
        },
        orderBy: { date: 'asc' },
      });
    } else if (role === 'MENTOR') {
      const mentorProfile = await db.mentorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (mentorProfile) {
        bookings = await db.mentorBooking.findMany({
          where: { mentorId: mentorProfile.id },
          include: { student: true },
          orderBy: { date: 'asc' },
        });
      }
    } else if (role === 'SUPER_ADMIN') {
      bookings = await db.mentorBooking.findMany({
        include: { student: true, mentor: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to book a session.' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = bookingSchema.parse(body);

    const mentor = await db.mentorProfile.findUnique({
      where: { id: validatedData.mentorId },
      include: { user: true },
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Double-booking prevention check!
    const existingConflict = await db.mentorBooking.findFirst({
      where: {
        mentorId: validatedData.mentorId,
        date: validatedData.date,
        timeSlot: validatedData.timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingConflict) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another date or time slot.' },
        { status: 400 }
      );
    }

    const mockMeetingUrl = `https://meet.google.com/skillsphere-${Math.random().toString(36).substring(7)}`;

    const booking = await db.mentorBooking.create({
      data: {
        studentId: session.user.id,
        mentorId: validatedData.mentorId,
        date: validatedData.date,
        timeSlot: validatedData.timeSlot,
        sessionType: validatedData.sessionType,
        fee: mentor.hourlyRate,
        notes: validatedData.notes,
        status: 'CONFIRMED',
        meetingUrl: mockMeetingUrl,
      },
    });

    // Notify Student
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'Mentor Session Confirmed',
        message: `Your session with ${mentor.user.name} on ${validatedData.date} (${validatedData.timeSlot}) is confirmed!`,
        link: '/student/bookings',
      },
    });

    // Notify Mentor
    await db.notification.create({
      data: {
        userId: mentor.userId,
        title: 'New Student Booking',
        message: `Student ${session.user.name} booked a session on ${validatedData.date} (${validatedData.timeSlot}).`,
        link: '/mentor/bookings',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Booking failed' }, { status: 500 });
  }
}
