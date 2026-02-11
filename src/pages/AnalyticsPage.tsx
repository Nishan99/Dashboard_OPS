import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { chartData } from '../data/seedData';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const heatmapData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 12 }, (_, hour) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
    hour: `${(hour + 8).toString().padStart(2, '0')}:00`,
    value: Math.floor(Math.random() * 10),
  }))
).flat();

const geoData = [
  { city: 'San Francisco', lat: 37.7, lng: -122.4, projects: 3 },
  { city: 'New York', lat: 40.7, lng: -74.0, projects: 2 },
  { city: 'London', lat: 51.5, lng: -0.1, projects: 2 },
  { city: 'Berlin', lat: 52.5, lng: 13.4, projects: 1 },
  { city: 'Tokyo', lat: 35.7, lng: 139.7, projects: 1 },
];

export default function AnalyticsPage() {
  const { tasks, people, invoices, timeEntries, projects } = useStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const tasksByStatus = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, fill: 'hsl(217, 91%, 60%)' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, fill: 'hsl(260, 60%, 55%)' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, fill: 'hsl(38, 92%, 55%)' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, fill: 'hsl(142, 60%, 45%)' },
  ];

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const overdue = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep insights into your operations</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${completionRate}%`, sub: 'of tasks completed' },
          { label: 'Overdue Tasks', value: String(overdue), sub: 'need attention' },
          { label: 'Active Members', value: String(people.filter(p => p.status === 'Active').length), sub: 'currently online' },
          { label: 'Total Revenue', value: `$${(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) / 1000).toFixed(1)}k`, sub: 'this period' },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={item} initial="hidden" animate="show" className="kpi-card">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(217, 91%, 60%)' }} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(260, 60%, 55%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(260, 60%, 55%)' }} strokeDasharray="5 5" />
              <Legend wrapperStyle={{ color: 'hsl(215, 15%, 55%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {tasksByStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Velocity */}
      <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Project Velocity (Tasks Completed vs Created)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData.projectVelocity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
            <XAxis dataKey="week" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
            <Bar dataKey="completed" fill="hsl(142, 60%, 45%)" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="created" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} opacity={0.5} name="Created" />
            <Legend wrapperStyle={{ color: 'hsl(215, 15%, 55%)' }} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="grid gap-1 min-w-[600px]" style={{ gridTemplateColumns: '60px repeat(12, 1fr)' }}>
            <div />
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-[10px] text-muted-foreground text-center">{`${(i + 8).toString().padStart(2, '0')}:00`}</div>
            ))}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <>
                <div key={day} className="text-xs text-muted-foreground flex items-center">{day}</div>
                {Array.from({ length: 12 }, (_, hour) => {
                  const val = heatmapData.find(d => d.day === day && d.hour === `${(hour + 8).toString().padStart(2, '0')}:00`)?.value || 0;
                  const opacity = Math.max(0.1, val / 10);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="aspect-square rounded-sm"
                      style={{ backgroundColor: `hsl(217 91% 60% / ${opacity})` }}
                      title={`${day} ${hour + 8}:00 — ${val} events`}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Team locations */}
      <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Team Locations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {geoData.map(loc => (
            <div key={loc.city} className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm font-medium text-foreground">{loc.city}</p>
              <p className="text-xs text-muted-foreground mt-1">{loc.projects} projects</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
