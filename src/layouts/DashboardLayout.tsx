import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Search, Bell } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { useStore } from '../stores/useStore';
import { useSeedData } from '../hooks/useSeedData';
import { useState } from 'react';

export default function DashboardLayout() {
  useSeedData();
  const { sidebarOpen, toggleSidebar } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { setSearchOpen(false); setSearchQuery(''); }}
                    placeholder="Search everything..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Search...</span>
                  <kbd className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
