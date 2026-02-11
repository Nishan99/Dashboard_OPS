import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FolderKanban, Clock, Calendar,
  CreditCard, BarChart3, X, Zap, MessageSquare, Video, Phone,
} from 'lucide-react';
import { useStore } from '../../stores/useStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/people', icon: Users, label: 'People' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/time', icon: Clock, label: 'Time' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/dashboard/meetings', icon: Video, label: 'Meetings' },
  { to: '/dashboard/discussions', icon: MessageSquare, label: 'Discussions' },
  { to: '/dashboard/calls', icon: Phone, label: 'Calls' },
  { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 h-full z-50 lg:z-30 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-foreground text-lg tracking-tight">OpsHub</span>
            )}
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Chen&backgroundColor=3b82f6"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Alex Chen</p>
                <p className="text-xs text-muted-foreground truncate">Admin</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
