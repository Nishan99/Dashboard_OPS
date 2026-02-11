import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useStore, type Invoice } from '../stores/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartData } from '../data/seedData';

const uid = () => Math.random().toString(36).slice(2, 10);

const statusConfig = {
  paid: { icon: CheckCircle, label: 'Paid', className: 'bg-success/10 text-success' },
  unpaid: { icon: Clock, label: 'Unpaid', className: 'bg-warning/10 text-warning' },
  overdue: { icon: AlertCircle, label: 'Overdue', className: 'bg-destructive/10 text-destructive' },
};

export default function PaymentsPage() {
  const { invoices, addInvoice, updateInvoice } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client: '', amount: '', dueDate: '', description: '' });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalUnpaid = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const handleAdd = () => {
    if (!form.client || !form.amount) return;
    addInvoice({
      id: uid(),
      client: form.client,
      amount: parseFloat(form.amount),
      status: 'unpaid',
      dueDate: form.dueDate,
      createdAt: new Date().toISOString().slice(0, 10),
      items: [{ description: form.description || 'Service', amount: parseFloat(form.amount) }],
    });
    setForm({ client: '', amount: '', dueDate: '', description: '' });
    setShowAdd(false);
  };

  const exportCSV = () => {
    const headers = 'Client,Amount,Status,Due Date,Created\n';
    const rows = invoices.map(inv => `${inv.client},${inv.amount},${inv.status},${inv.dueDate},${inv.createdAt}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invoices.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">{invoices.length} invoices</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: totalPaid, color: 'text-success' },
          { label: 'Unpaid', value: totalUnpaid, color: 'text-warning' },
          { label: 'Overdue', value: totalOverdue, color: 'text-destructive' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>${kpi.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData.revenue}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip contentStyle={{ background: 'hsl(228, 14%, 11%)', border: '1px solid hsl(228, 12%, 18%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(142, 60%, 45%)" fill="url(#revGrad2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Invoices list */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Due Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const sc = statusConfig[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{inv.client}</td>
                    <td className="px-5 py-4 text-sm text-foreground">${inv.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.className}`}>
                        <sc.icon className="w-3 h-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{inv.dueDate}</td>
                    <td className="px-5 py-4">
                      {inv.status !== 'paid' && (
                        <button onClick={() => updateInvoice(inv.id, { status: 'paid' })} className="text-xs px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors font-medium">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">New Invoice</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Client name" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" type="number" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={handleAdd} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Invoice</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
