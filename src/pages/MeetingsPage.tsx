import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, Clock, Users, Plus, X, Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useStore } from '@/stores/useStore';

export default function MeetingsPage() {
  const { meetings, people, addMeeting, updateMeeting } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', notes: '' });

  const uid = () => Math.random().toString(36).slice(2, 10);

  const handleCreate = () => {
    if (!form.title || !form.date || !form.startTime || !form.endTime) return;
    addMeeting({
      id: uid(),
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      attendeeIds: [],
      status: 'scheduled',
      notes: form.notes,
    });
    setForm({ title: '', date: '', startTime: '', endTime: '', notes: '' });
    setShowCreate(false);
  };

  const handleUpdate = (id: string) => {
    updateMeeting(id, {
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      notes: form.notes,
    });
    setEditingId(null);
    setForm({ title: '', date: '', startTime: '', endTime: '', notes: '' });
  };

  const startEdit = (m: typeof meetings[0]) => {
    setEditingId(m.id);
    setForm({ title: m.title, date: m.date, startTime: m.startTime, endTime: m.endTime, notes: m.notes });
  };

  const filtered = meetings
    .filter((m) => filter === 'all' || m.status === filter)
    .filter((m) => search ? m.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusColors: Record<string, string> = {
    scheduled: 'bg-primary/15 text-primary',
    completed: 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]',
    cancelled: 'bg-destructive/15 text-destructive',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meetings..."
              className="pl-8 pr-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Meeting
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Create/Edit modal */}
      <AnimatePresence>
        {(showCreate || editingId) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setEditingId(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{editingId ? 'Edit Meeting' : 'New Meeting'}</h2>
                <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Meeting title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex gap-3">
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Meeting notes..." rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              <button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                {editingId ? 'Save Changes' : 'Create Meeting'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meetings list */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12 glass rounded-xl">No meetings found</div>
        )}
        {filtered.map((m) => (
          <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-card/70 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm truncate">{m.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status]}`}>{m.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.startTime} – {m.endTime}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.attendeeIds.length} attendees</span>
              </div>
              {m.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{m.notes}</p>}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {m.status === 'scheduled' && (
                <>
                  <button onClick={() => updateMeeting(m.id, { status: 'completed' })} className="w-7 h-7 rounded-lg hover:bg-[hsl(var(--success))]/15 flex items-center justify-center text-[hsl(var(--success))]" title="Complete">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateMeeting(m.id, { status: 'cancelled' })} className="w-7 h-7 rounded-lg hover:bg-destructive/15 flex items-center justify-center text-destructive" title="Cancel">
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={() => startEdit(m)} className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
