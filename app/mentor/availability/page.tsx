'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store/useUIStore';

export default function MentorAvailabilityPage() {
  const { addToast } = useUIStore();
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Availability Slot Saved!',
      message: `Weekly slot set for ${daysMap[dayOfWeek]}s from ${startTime} to ${endTime}.`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configure Mentor Availability</h1>
        <p className="text-xs text-slate-500 mt-1">Set up weekly recurring consultation windows for 1-on-1 student bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Add Weekly Time Window
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {daysMap.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" className="font-semibold">
                <Save className="w-4 h-4 mr-1.5" /> Save Time Window
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
