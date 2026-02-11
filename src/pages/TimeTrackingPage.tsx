import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Download } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '../data/seedData';

export default function TimeTrackingPage() {
  const { activeTimer, startTimer, stopTimer, timeEntries, projects, people } = useStore();
  const [elapsed, setElapsed] = useState(0);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!activeTimer) { setElapsed(0); return; }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startTimer({
      id: Math.random().toString(36).slice(2, 10),
      userId: 'u1',
      projectId: selectedProject,
      startTime: new Date().toISOString(),
      endTime: null,
      description,
    });
  };

  const exportCSV = () => {
    const headers = 'User,Project,Start,End,Description,Hours\n';
    const rows = timeEntries.map(te => {
      const user = people.find(p => p.id === te.userId)?.name || '';
      const proj = projects.find(p => p.id === te.projectId)?.name || '';
      const hours = te.endTime ? ((new Date(te.endTime).getTime() - new Date(te.startTime).getTime()) / 3600000).toFixed(2) : '0';
      return `${user},${proj},${te.startTime},${te.endTime || ''},${te.description},${hours}`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timesheet.csv';
    a.click();
  };

  const recentEntries = [...timeEntries].reverse().slice(0, 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Tracking</h1>
          <p className="text-sm text-muted-foreground">{timeEntries.length} entries logged</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-5xl font-mono font-bold text-foreground tracking-wider">{formatTime(elapsed)}</div>
            <p className="text-sm text-muted-foreground mt-2">{activeTimer ? 'Timer running...' : 'Ready to track'}</p>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you working on?" className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <button
            onClick={activeTimer ? stopTimer : handleStart}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              activeTimer
                ? 'bg-destructive hover:bg-destructive/80 animate-pulse-glow'
                : 'gradient-primary hover:opacity-90'
            }`}
          >
            {activeTimer ? <Square className="w-5 h-5 text-destructive-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Productivity Chart */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Hours by Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.productivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Bar dataKey="hours" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Entries */}
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Entries</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin">
            {recentEntries.map(te => {
              const proj = projects.find(p => p.id === te.projectId);
              const hours = te.endTime ? ((new Date(te.endTime).getTime() - new Date(te.startTime).getTime()) / 3600000).toFixed(1) : '-';
              return (
                <div key={te.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{te.description}</p>
                    <p className="text-xs text-muted-foreground">{proj?.name}</p>
                  </div>
                  <span className="text-sm font-mono text-foreground">{hours}h</span>
                  <span className="text-xs text-muted-foreground">{new Date(te.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
