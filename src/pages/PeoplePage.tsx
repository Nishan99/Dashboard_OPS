import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, X, Check } from 'lucide-react';
import { useStore, type Person, type Role, type Status } from '../stores/useStore';

const uid = () => Math.random().toString(36).slice(2, 10);

export default function PeoplePage() {
  const { people, addPerson, removePerson, updatePerson } = useStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Member' as Role, team: '', status: 'Active' as Status });

  const filtered = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addPerson({
      id: uid(),
      ...form,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=3b82f6,8b5cf6`,
      joinedAt: new Date().toISOString().slice(0, 10),
    });
    setForm({ name: '', email: '', role: 'Member', team: '', status: 'Active' });
    setShowAdd(false);
  };

  const handleEdit = (p: Person) => {
    setEditId(p.id);
    setForm({ name: p.name, email: p.email, role: p.role, team: p.team, status: p.status });
  };

  const saveEdit = () => {
    if (editId) {
      updatePerson(editId, form);
      setEditId(null);
    }
  };

  const statusColor = (s: Status) => s === 'Active' ? 'bg-success' : s === 'Away' ? 'bg-warning' : 'bg-muted-foreground';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground">{people.length} team members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-2">
          {['all', 'Admin', 'Manager', 'Member'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {(showAdd || editId) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditId(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{editId ? 'Edit Person' : 'Add Person'}</h2>
                <button onClick={() => { setShowAdd(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </select>
                <input value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} placeholder="Team" className="px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button onClick={editId ? saveEdit : handleAdd} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                {editId ? 'Save Changes' : 'Add Person'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* People grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl p-5 hover:bg-card/70 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full" />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${statusColor(p.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{p.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.role}</span>
                    <span className="text-xs text-muted-foreground">{p.team}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removePerson(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
