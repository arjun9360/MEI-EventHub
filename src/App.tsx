import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext";
import Portal from "./pages/Portal";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EventList from "./pages/dashboard/EventList";
import EventDetail from "./pages/dashboard/EventDetail";
import Venues from "./pages/dashboard/Venues";
import Schedule from "./pages/dashboard/Schedule";
import AttendanceQR from "./pages/dashboard/AttendanceQR";
import Volunteers from "./pages/dashboard/Volunteers";
import MyTickets from "./pages/dashboard/MyTickets";
import Profile from "./pages/dashboard/Profile";
import Team from "./pages/dashboard/Team";
import Developers from "./pages/dashboard/Developers";
import EventHistory from "./pages/dashboard/EventHistory";
import FeedbackForm from "./pages/dashboard/FeedbackForm";
import FeedbackAnalytics from "./pages/dashboard/FeedbackAnalytics";
import EventAnalytics from "./pages/dashboard/EventAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const roleNameMap: Record<string, string> = {
  hod: 'HOD & Management',
  staff: 'Staff & Faculty',
  organizer: 'Event Organizer',
  student: 'MEI Student',
  external: 'External Participant',
  volunteer: 'Volunteer Crew',
};

const RoleAccessGuard = ({
  allowedRoles,
  children,
  moduleName,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
  moduleName: string;
}) => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="gradient-card border border-destructive/40 rounded-2xl p-8 max-w-lg mx-auto my-12 text-center animate-slide-up space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-destructive/15 text-destructive mx-auto flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground">
          Access Restricted: {moduleName}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your current portal role (<span className="text-foreground font-semibold">{roleNameMap[role] || role}</span>) does not have authorization to access this console.
        </p>
        <p className="text-[11px] text-muted-foreground">
          Authorized roles: {allowedRoles.map((r) => roleNameMap[r] || r).join(', ')}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            onClick={() => navigate(`/dashboard/${role}`)}
            className="gradient-primary text-primary-foreground text-xs"
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-border text-xs"
          >
            Switch Role
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const RoleHomeDispatcher = () => {
  const { role } = useParams<{ role: string }>();
  if (role === 'hod' || role === 'staff' || role === 'organizer') {
    return <Dashboard />;
  }
  if (role === 'volunteer') {
    return <AttendanceQR />;
  }
  return <EventList />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Portal />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/dashboard/:role" element={<DashboardLayout />}>
              <Route index element={<RoleHomeDispatcher />} />
              <Route path="events" element={<EventList />} />
              <Route
                path="create-event"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'organizer']} moduleName="Event Creation Console">
                    <CreateEvent />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="venues"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'staff', 'organizer', 'volunteer']} moduleName="Venue Management">
                    <Venues />
                  </RoleAccessGuard>
                }
              />
              <Route path="schedule" element={<Schedule />} />
              <Route
                path="attendance"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'organizer', 'volunteer']} moduleName="QR Attendance Desk">
                    <AttendanceQR />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="volunteers"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'organizer', 'volunteer']} moduleName="Volunteer Crew Console">
                    <Volunteers />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="my-tickets"
                element={
                  <RoleAccessGuard allowedRoles={['student', 'external']} moduleName="Digital Admission Passes">
                    <MyTickets />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="event-analytics"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'staff', 'organizer']} moduleName="Event Performance Analytics">
                    <EventAnalytics />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="feedback-analytics"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'staff', 'organizer']} moduleName="Feedback Analytics">
                    <FeedbackAnalytics />
                  </RoleAccessGuard>
                }
              />
              <Route path="event/:eventId" element={<EventDetail />} />
              <Route path="event/:eventId/feedback" element={<FeedbackForm />} />
              <Route
                path="profile"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'staff', 'organizer', 'student']} moduleName="Profile Details">
                    <Profile />
                  </RoleAccessGuard>
                }
              />
              <Route
                path="team"
                element={
                  <RoleAccessGuard allowedRoles={['hod', 'staff', 'organizer', 'student']} moduleName="Team Roster">
                    <Team />
                  </RoleAccessGuard>
                }
              />
              <Route path="developers" element={<Developers />} />
              <Route path="history" element={<EventHistory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
