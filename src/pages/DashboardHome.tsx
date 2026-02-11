import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, FolderKanban, Clock, DollarSign } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { chartData } from '../data/seedData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function KPICard({ label, value, change, icon: Icon, positive }: {
  label: string; value: string; change: string; icon: React.ElementType; positive: boolean;
}) {
  return (
    <motion.div variants={item} className="kpi-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        {positive ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
        <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>{change}</span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </motion.div>
  );
}

export default function DashboardHome() {
  const { people, projects, tasks, invoices, activity, timeEntries } = useStore();

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const activePeople = people.filter(p => p.status === 'Active').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const hoursThisWeek = timeEntries.reduce((s, te) => {
    if (!te.endTime) return s;
    return s + (new Date(te.endTime).getTime() - new Date(te.startTime).getTime()) / 3600000;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, Alex. Here's what's happening.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} change="+12.5%" icon={DollarSign} positive />
        <KPICard label="Active People" value={String(activePeople)} change="+2" icon={Users} positive />
        <KPICard label="Active Projects" value={String(activeProjects)} change="+1" icon={FolderKanban} positive />
        <KPICard label="Hours Tracked" value={`${hoursThisWeek.toFixed(0)}h`} change="-3.2%" icon={Clock} positive={false} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue & Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData.revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(260, 60%, 55%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Task Distribution */}
        <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData.taskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                {chartData.taskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {chartData.taskDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Velocity + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Project Velocity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.projectVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              <Bar dataKey="completed" fill="hsl(142, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="created" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show" className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Activity Feed</h3>
          <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
            {activity.slice(0, 8).map((evt) => {
              const person = people.find(p => p.id === evt.userId);
              const timeAgo = Math.floor((Date.now() - new Date(evt.timestamp).getTime()) / 3600000);
              return (
                <div key={evt.id} className="flex items-start gap-3">
                  <img src={person?.avatar || ''} alt="" className="w-7 h-7 rounded-full mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{person?.name}</span>{' '}
                      <span className="text-muted-foreground">{evt.action}</span>{' '}
                      <span className="font-medium">{evt.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo / 24)}d ago`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
