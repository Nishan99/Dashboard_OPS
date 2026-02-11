import { create } from 'zustand';

export type Role = 'Admin' | 'Manager' | 'Member';
export type Status = 'Active' | 'Away' | 'Offline';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  status: Status;
  avatar: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'paused';
  progress: number;
  teamIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  description: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeeIds: string[];
  status: 'scheduled' | 'cancelled' | 'completed';
  notes: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
  items: { description: string; amount: number }[];
}

export interface ActivityEvent {
  id: string;
  userId: string;
  action: string;
  target: string;
  timestamp: string;
}

interface AppState {
  people: Person[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  meetings: Meeting[];
  invoices: Invoice[];
  activity: ActivityEvent[];
  activeTimer: TimeEntry | null;
  sidebarOpen: boolean;

  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  archiveProject: (id: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  startTimer: (entry: TimeEntry) => void;
  stopTimer: () => void;

  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;

  logActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  toggleSidebar: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<AppState>((set, get) => ({
  people: [],
  projects: [],
  tasks: [],
  timeEntries: [],
  meetings: [],
  invoices: [],
  activity: [],
  activeTimer: null,
  sidebarOpen: true,

  addPerson: (person) => set((s) => {
    get().logActivity({ userId: 'system', action: 'added person', target: person.name });
    return { people: [...s.people, person] };
  }),
  removePerson: (id) => set((s) => {
    const p = s.people.find(x => x.id === id);
    get().logActivity({ userId: 'system', action: 'removed person', target: p?.name || id });
    return { people: s.people.filter(x => x.id !== id) };
  }),
  updatePerson: (id, updates) => set((s) => ({
    people: s.people.map(x => x.id === id ? { ...x, ...updates } : x),
  })),

  addProject: (project) => set((s) => {
    get().logActivity({ userId: 'system', action: 'created project', target: project.name });
    return { projects: [...s.projects, project] };
  }),
  updateProject: (id, updates) => set((s) => ({
    projects: s.projects.map(x => x.id === id ? { ...x, ...updates } : x),
  })),
  archiveProject: (id) => set((s) => ({
    projects: s.projects.map(x => x.id === id ? { ...x, status: 'archived' as const } : x),
  })),

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) => set((s) => ({
    tasks: s.tasks.map(x => x.id === id ? { ...x, ...updates } : x),
  })),
  moveTask: (id, status) => set((s) => ({
    tasks: s.tasks.map(x => x.id === id ? { ...x, status } : x),
  })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(x => x.id !== id) })),

  startTimer: (entry) => set({ activeTimer: entry }),
  stopTimer: () => set((s) => {
    if (!s.activeTimer) return {};
    const completed = { ...s.activeTimer, endTime: new Date().toISOString() };
    return {
      activeTimer: null,
      timeEntries: [...s.timeEntries, completed],
    };
  }),

  addMeeting: (meeting) => set((s) => ({ meetings: [...s.meetings, meeting] })),
  updateMeeting: (id, updates) => set((s) => ({
    meetings: s.meetings.map(x => x.id === id ? { ...x, ...updates } : x),
  })),

  addInvoice: (invoice) => set((s) => ({ invoices: [...s.invoices, invoice] })),
  updateInvoice: (id, updates) => set((s) => ({
    invoices: s.invoices.map(x => x.id === id ? { ...x, ...updates } : x),
  })),

  logActivity: (event) => set((s) => ({
    activity: [{ ...event, id: uid(), timestamp: new Date().toISOString() }, ...s.activity].slice(0, 50),
  })),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
