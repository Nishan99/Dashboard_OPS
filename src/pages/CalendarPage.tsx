import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useStore, type Meeting } from '../stores/useStore';

const uid = () => Math.random().toString(36).slice(2, 10);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { meetings, people, addMeeting, updateMeeting } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1));
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', attendeeIds: [] as string[] });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    addMeeting({
      id: uid(),
      ...form,
      status: 'scheduled',
      notes: '',
    });
    setForm({ title: '', date: '', startTime: '09:00', endTime: '10:00', attendeeIds: [] });
    setShowAdd(false);
  };

  const getMeetingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meetings.filter(m => m.date === dateStr);
  };

  const statusColor = (s: Meeting['status']) =>
    s === 'completed' ? 'bg-success' : s === 'cancelled' ? 'bg-destructive' : 'bg-primary';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">{meetings.filter(m => m.status === 'scheduled').length} upcoming events</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {/* Month nav */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayMeetings = getMeetingsForDay(day);
            const isToday = day === 11 && month === 1 && year === 2025;
            return (
              <button
                key={day}
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  setSelectedDay(selectedDay === dateStr ? null : dateStr);
                }}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-colors relative ${
                  isToday ? 'bg-primary/15 border border-primary/30' : 'hover:bg-secondary'
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                {dayMeetings.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayMeetings.slice(0, 3).map(m => (
                      <div key={m.id} className={`w-1.5 h-1.5 rounded-full ${statusColor(m.status)}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Events for {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            {meetings.filter(m => m.date === selectedDay).length === 0 ? (
              <p className="text-sm text-muted-foreground">No events</p>
            ) : (
              meetings.filter(m => m.date === selectedDay).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className={`w-2 h-8 rounded-full ${statusColor(m.status)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.startTime} – {m.endTime} · {m.attendeeIds.length} attendees</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    m.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                    m.status === 'completed' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>{m.status}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming meetings list */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Meetings</h3>
        <div className="space-y-2">
          {meetings.filter(m => m.status === 'scheduled').map(m => {
            const attendees = m.attendeeIds.map(id => people.find(p => p.id === id)).filter(Boolean);
            return (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="text-center min-w-[48px]">
                  <p className="text-xs text-muted-foreground">{new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-lg font-bold text-foreground">{new Date(m.date + 'T00:00:00').getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.startTime} – {m.endTime}</p>
                </div>
                <div className="flex -space-x-2">
                  {attendees.slice(0, 3).map(a => (
                    <img key={a!.id} src={a!.avatar} alt={a!.name} className="w-6 h-6 rounded-full border-2 border-card" title={a!.name} />
                  ))}
                  {attendees.length > 3 && (
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground border-2 border-card">
                      +{attendees.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add event modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">New Event</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button onClick={handleAdd} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Event</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
