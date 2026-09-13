'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/useUIStore';

export function BookingModalButton({
  mentorId,
  hourlyRate,
  consultationTypes,
}: {
  mentorId: string;
  hourlyRate: number;
  consultationTypes: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useUIStore();

  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState('2026-09-25');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [sessionType, setSessionType] = useState('System Design Mock Interview');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/mentors/${mentorId}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId,
          date,
          timeSlot,
          sessionType,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      addToast({
        type: 'success',
        title: 'Session Booked!',
        message: 'Your Google Meet URL has been generated.',
      });

      setIsOpen(false);
      router.push('/student/bookings');
      router.refresh();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Booking Error',
        message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full py-3 font-bold">
        Book Consultation (${hourlyRate})
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Schedule 1-on-1 Mentorship Session">
        <form onSubmit={handleBookSession} className="space-y-4">
          <Input
            label="Session Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Available Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`p-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    timeSlot === slot
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Consultation Topic
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="System Design Mock Interview">System Design Mock Interview</option>
              <option value="Resume Review & Career Roadmap">Resume Review & Career Roadmap</option>
              <option value="1-on-1 Code Pairing">1-on-1 Code Pairing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes for Mentor (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What topics or questions would you like to cover in this session?"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-600">Total Fee:</span>
            <span className="font-extrabold text-slate-900">${hourlyRate.toFixed(2)} USD</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="font-semibold">
              Confirm & Book Session
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
