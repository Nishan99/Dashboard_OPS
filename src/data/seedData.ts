import type { Person, Project, Task, TimeEntry, Meeting, Invoice, ActivityEvent } from '../stores/useStore';

const uid = () => Math.random().toString(36).slice(2, 10);

const avatarUrl = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3b82f6,8b5cf6,06b6d4,10b981&fontFamily=Inter`;

export const seedPeople: Person[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@ops.co', role: 'Admin', team: 'Engineering', status: 'Active', avatar: avatarUrl('Alex Chen'), joinedAt: '2024-01-15' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah@ops.co', role: 'Manager', team: 'Product', status: 'Active', avatar: avatarUrl('Sarah Miller'), joinedAt: '2024-02-20' },
  { id: 'u3', name: 'James Wilson', email: 'james@ops.co', role: 'Member', team: 'Engineering', status: 'Away', avatar: avatarUrl('James Wilson'), joinedAt: '2024-03-10' },
  { id: 'u4', name: 'Emily Davis', email: 'emily@ops.co', role: 'Member', team: 'Design', status: 'Active', avatar: avatarUrl('Emily Davis'), joinedAt: '2024-04-05' },
  { id: 'u5', name: 'Michael Brown', email: 'michael@ops.co', role: 'Manager', team: 'Sales', status: 'Active', avatar: avatarUrl('Michael Brown'), joinedAt: '2024-01-28' },
  { id: 'u6', name: 'Lisa Anderson', email: 'lisa@ops.co', role: 'Member', team: 'Marketing', status: 'Offline', avatar: avatarUrl('Lisa Anderson'), joinedAt: '2024-05-12' },
  { id: 'u7', name: 'David Kim', email: 'david@ops.co', role: 'Member', team: 'Engineering', status: 'Active', avatar: avatarUrl('David Kim'), joinedAt: '2024-06-01' },
  { id: 'u8', name: 'Rachel Taylor', email: 'rachel@ops.co', role: 'Member', team: 'Product', status: 'Active', avatar: avatarUrl('Rachel Taylor'), joinedAt: '2024-03-18' },
];

export const seedProjects: Project[] = [
  { id: 'p1', name: 'Platform Redesign', description: 'Complete UI/UX overhaul of the main platform', status: 'active', progress: 68, teamIds: ['u1', 'u4', 'u7'], createdAt: '2024-06-01' },
  { id: 'p2', name: 'Mobile App v2', description: 'Native mobile app rebuild with React Native', status: 'active', progress: 42, teamIds: ['u3', 'u7'], createdAt: '2024-07-15' },
  { id: 'p3', name: 'Analytics Engine', description: 'Real-time analytics processing pipeline', status: 'active', progress: 85, teamIds: ['u1', 'u3'], createdAt: '2024-05-10' },
  { id: 'p4', name: 'Marketing Site', description: 'New marketing website and landing pages', status: 'paused', progress: 30, teamIds: ['u4', 'u6'], createdAt: '2024-08-01' },
  { id: 'p5', name: 'API Gateway', description: 'Microservices API gateway infrastructure', status: 'active', progress: 91, teamIds: ['u1', 'u7'], createdAt: '2024-04-20' },
];

export const seedTasks: Task[] = [
  { id: 't1', title: 'Design new dashboard layout', projectId: 'p1', assigneeId: 'u4', status: 'done', priority: 'high', dueDate: '2025-01-20', createdAt: '2024-12-01' },
  { id: 't2', title: 'Implement auth flow', projectId: 'p1', assigneeId: 'u1', status: 'in_progress', priority: 'urgent', dueDate: '2025-02-15', createdAt: '2024-12-15' },
  { id: 't3', title: 'API endpoint for users', projectId: 'p1', assigneeId: 'u7', status: 'review', priority: 'high', dueDate: '2025-02-10', createdAt: '2024-12-20' },
  { id: 't4', title: 'Setup CI/CD pipeline', projectId: 'p2', assigneeId: 'u3', status: 'todo', priority: 'medium', dueDate: '2025-02-28', createdAt: '2025-01-05' },
  { id: 't5', title: 'User onboarding screens', projectId: 'p2', assigneeId: 'u4', status: 'in_progress', priority: 'medium', dueDate: '2025-02-20', createdAt: '2025-01-10' },
  { id: 't6', title: 'Data pipeline optimization', projectId: 'p3', assigneeId: 'u1', status: 'in_progress', priority: 'high', dueDate: '2025-02-12', createdAt: '2025-01-01' },
  { id: 't7', title: 'Write unit tests', projectId: 'p3', assigneeId: 'u3', status: 'todo', priority: 'low', dueDate: '2025-03-01', createdAt: '2025-01-15' },
  { id: 't8', title: 'Landing page copy', projectId: 'p4', assigneeId: 'u6', status: 'todo', priority: 'low', dueDate: '2025-03-15', createdAt: '2025-01-20' },
  { id: 't9', title: 'Rate limiting middleware', projectId: 'p5', assigneeId: 'u7', status: 'done', priority: 'urgent', dueDate: '2025-01-30', createdAt: '2024-12-10' },
  { id: 't10', title: 'Load testing', projectId: 'p5', assigneeId: 'u1', status: 'review', priority: 'high', dueDate: '2025-02-08', createdAt: '2025-01-08' },
  { id: 't11', title: 'Mobile responsive fixes', projectId: 'p1', assigneeId: 'u4', status: 'todo', priority: 'medium', dueDate: '2025-02-25', createdAt: '2025-01-25' },
  { id: 't12', title: 'Push notification service', projectId: 'p2', assigneeId: 'u7', status: 'todo', priority: 'high', dueDate: '2025-03-05', createdAt: '2025-01-28' },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const seedTimeEntries: TimeEntry[] = Array.from({ length: 30 }, (_, i) => ({
  id: `te${i + 1}`,
  userId: seedPeople[i % seedPeople.length].id,
  projectId: seedProjects[i % seedProjects.length].id,
  startTime: new Date(2025, 1, 3 + Math.floor(i / 4), 9 + (i % 4) * 2, 0).toISOString(),
  endTime: new Date(2025, 1, 3 + Math.floor(i / 4), 11 + (i % 4) * 2, 30).toISOString(),
  description: ['Feature development', 'Code review', 'Bug fixing', 'Testing', 'Documentation'][i % 5],
}));

export const seedMeetings: Meeting[] = [
  { id: 'm1', title: 'Sprint Planning', date: '2025-02-10', startTime: '09:00', endTime: '10:00', attendeeIds: ['u1', 'u2', 'u3', 'u4'], status: 'completed', notes: 'Planned sprint 24 goals.' },
  { id: 'm2', title: 'Design Review', date: '2025-02-11', startTime: '14:00', endTime: '15:00', attendeeIds: ['u2', 'u4'], status: 'scheduled', notes: '' },
  { id: 'm3', title: 'All Hands', date: '2025-02-12', startTime: '11:00', endTime: '12:00', attendeeIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'], status: 'scheduled', notes: '' },
  { id: 'm4', title: '1:1 with Sarah', date: '2025-02-13', startTime: '10:00', endTime: '10:30', attendeeIds: ['u1', 'u2'], status: 'scheduled', notes: '' },
  { id: 'm5', title: 'Client Demo', date: '2025-02-14', startTime: '15:00', endTime: '16:00', attendeeIds: ['u1', 'u5', 'u8'], status: 'scheduled', notes: '' },
  { id: 'm6', title: 'Retrospective', date: '2025-02-07', startTime: '16:00', endTime: '17:00', attendeeIds: ['u1', 'u2', 'u3'], status: 'completed', notes: 'Identified 3 areas for improvement.' },
];

export const seedInvoices: Invoice[] = [
  { id: 'inv1', client: 'Acme Corp', amount: 12500, status: 'paid', dueDate: '2025-01-15', createdAt: '2024-12-20', items: [{ description: 'Platform development', amount: 10000 }, { description: 'Consulting', amount: 2500 }] },
  { id: 'inv2', client: 'TechStart Inc', amount: 8750, status: 'unpaid', dueDate: '2025-02-28', createdAt: '2025-01-15', items: [{ description: 'Mobile app development', amount: 7000 }, { description: 'UI/UX Design', amount: 1750 }] },
  { id: 'inv3', client: 'GlobalFin', amount: 25000, status: 'paid', dueDate: '2025-01-30', createdAt: '2025-01-05', items: [{ description: 'Analytics platform', amount: 20000 }, { description: 'Training', amount: 5000 }] },
  { id: 'inv4', client: 'DataFlow LLC', amount: 6200, status: 'overdue', dueDate: '2025-01-20', createdAt: '2024-12-10', items: [{ description: 'API integration', amount: 6200 }] },
  { id: 'inv5', client: 'NovaBrand', amount: 15800, status: 'unpaid', dueDate: '2025-03-10', createdAt: '2025-02-01', items: [{ description: 'Brand portal', amount: 12000 }, { description: 'Support package', amount: 3800 }] },
];

export const seedActivity: ActivityEvent[] = [
  { id: 'a1', userId: 'u1', action: 'completed task', target: 'Rate limiting middleware', timestamp: daysAgo(0) },
  { id: 'a2', userId: 'u4', action: 'created design', target: 'Dashboard wireframes', timestamp: daysAgo(0) },
  { id: 'a3', userId: 'u2', action: 'updated project', target: 'Platform Redesign', timestamp: daysAgo(1) },
  { id: 'a4', userId: 'u5', action: 'closed deal', target: 'Acme Corp renewal', timestamp: daysAgo(1) },
  { id: 'a5', userId: 'u7', action: 'deployed', target: 'API Gateway v2.1', timestamp: daysAgo(2) },
  { id: 'a6', userId: 'u3', action: 'started sprint', target: 'Mobile App Sprint 5', timestamp: daysAgo(2) },
  { id: 'a7', userId: 'u6', action: 'published', target: 'Q4 Marketing Report', timestamp: daysAgo(3) },
  { id: 'a8', userId: 'u8', action: 'created document', target: 'Product Roadmap 2025', timestamp: daysAgo(3) },
];

export const chartData = {
  revenue: [
    { month: 'Aug', revenue: 32000, expenses: 22000 },
    { month: 'Sep', revenue: 38000, expenses: 24000 },
    { month: 'Oct', revenue: 42000, expenses: 26000 },
    { month: 'Nov', revenue: 47000, expenses: 25000 },
    { month: 'Dec', revenue: 52000, expenses: 28000 },
    { month: 'Jan', revenue: 58000, expenses: 30000 },
    { month: 'Feb', revenue: 62500, expenses: 31000 },
  ],
  productivity: [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 8.2 },
    { day: 'Wed', hours: 6.8 },
    { day: 'Thu', hours: 8.5 },
    { day: 'Fri', hours: 7.0 },
  ],
  taskDistribution: [
    { name: 'To Do', value: 4, fill: 'hsl(217, 91%, 60%)' },
    { name: 'In Progress', value: 3, fill: 'hsl(260, 60%, 55%)' },
    { name: 'Review', value: 2, fill: 'hsl(38, 92%, 55%)' },
    { name: 'Done', value: 3, fill: 'hsl(142, 60%, 45%)' },
  ],
  projectVelocity: [
    { week: 'W1', completed: 8, created: 12 },
    { week: 'W2', completed: 14, created: 10 },
    { week: 'W3', completed: 11, created: 9 },
    { week: 'W4', completed: 16, created: 13 },
    { week: 'W5', completed: 12, created: 8 },
    { week: 'W6', completed: 18, created: 11 },
  ],
};
