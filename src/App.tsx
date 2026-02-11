import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import PeoplePage from "./pages/PeoplePage";
import ProjectsPage from "./pages/ProjectsPage";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import CalendarPage from "./pages/CalendarPage";
import PaymentsPage from "./pages/PaymentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MeetingsPage from "./pages/MeetingsPage";
import DiscussionsPage from "./pages/DiscussionsPage";
import CallsPage from "./pages/CallsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="time" element={<TimeTrackingPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="discussions" element={<DiscussionsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
