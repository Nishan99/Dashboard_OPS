import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical } from 'lucide-react';
import { useStore, type Task, type TaskStatus, type Priority } from '../stores/useStore';

const uid = () => Math.random().toString(36).slice(2, 10);

const columns: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'bg-muted-foreground' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-primary' },
  { key: 'review', label: 'Review', color: 'bg-warning' },
  { key: 'done', label: 'Done', color: 'bg-success' },
];

const priorityColors: Record<Priority, string> = {
  low: 'text-muted-foreground bg-muted',
  medium: 'text-primary bg-primary/10',
  high: 'text-warning bg-warning/10',
  urgent: 'text-destructive bg-destructive/10',
};

export default function ProjectsPage() {
  const { projects, tasks, people, addTask, moveTask, deleteTask } = useStore();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', projectId: '', assigneeId: '', priority: 'medium' as Priority, dueDate: '' });

  const filteredTasks = selectedProject === 'all' ? tasks : tasks.filter(t => t.projectId === selectedProject);

  const handleAdd = () => {
    if (!form.title) return;
    addTask({
      id: uid(),
      ...form,
      status: 'todo',
      createdAt: new Date().toISOString(),
    });
    setForm({ title: '', projectId: '', assigneeId: '', priority: 'medium', dueDate: '' });
    setShowAdd(false);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.filter(p => p.status === 'active').length} active projects, {tasks.length} tasks</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Project filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button onClick={() => setSelectedProject('all')} className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedProject === 'all' ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
          All Projects
        </button>
        {projects.filter(p => p.status === 'active').map(p => (
          <button key={p.id} onClick={() => setSelectedProject(p.id)} className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedProject === p.id ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">New Task</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Assignee</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <button onClick={handleAdd} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Task</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px] p-2 rounded-xl bg-secondary/30 border border-border/50">
                <AnimatePresence>
                  {colTasks.map(task => {
                    const assignee = people.find(p => p.id === task.assigneeId);
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={() => setDraggedTask(task.id)}
                        className="glass rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-card/80 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{task.title}</p>
                            {project && <p className="text-xs text-muted-foreground mt-1">{project.name}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              {assignee && (
                                <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full" title={assignee.name} />
                              )}
                              {task.dueDate && (
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
