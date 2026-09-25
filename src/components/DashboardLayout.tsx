import { useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { MeiLogo } from '@/components/MeiLogo';
import { useNotificationsStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  MapPin,
  CalendarClock,
  QrCode,
  Users2,
  BarChart3,
  MessageSquare,
  History,
  Ticket,
  User,
  Users,
  Code2,
  Menu,
  X,
  Bell,
  LogOut,
  CheckCheck,
  Database,
  LogIn,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  // Primary Dashboard Views
  { label: 'Overview Dashboard', icon: LayoutDashboard, path: '', roles: ['hod', 'staff', 'organizer'] },
  { label: 'Discover Events', icon: Calendar, path: 'events', roles: ['hod', 'staff', 'organizer'] },
  
  // Event Organizer & HOD specific
  { label: 'Create & Schedule Event', icon: PlusCircle, path: 'create-event', roles: ['hod', 'organizer'] },
  
  // Shared Timelines & Venues
  { label: 'Schedule & Timelines', icon: CalendarClock, path: 'schedule', roles: ['hod', 'staff', 'organizer', 'student', 'external', 'volunteer'] },
  { label: 'Venue Management', icon: MapPin, path: 'venues', roles: ['hod', 'staff', 'organizer', 'volunteer'] },
  
  // Operations: QR & Volunteers (Organizer, Volunteer, HOD)
  { label: 'QR Attendance Desk', icon: QrCode, path: 'attendance', roles: ['hod', 'organizer', 'volunteer'] },
  { label: 'Volunteer Crew', icon: Users2, path: 'volunteers', roles: ['hod', 'organizer', 'volunteer'] },
  
  // Institutional Analytics (HOD, Staff & Organizer)
  { label: 'Event Analytics', icon: BarChart3, path: 'event-analytics', roles: ['hod', 'staff', 'organizer'] },
  { label: 'Feedback Analytics', icon: MessageSquare, path: 'feedback-analytics', roles: ['hod', 'staff', 'organizer'] },

  // Student specific items
  { label: 'Discover Events', icon: Calendar, path: '', roles: ['student', 'external'] },
  { label: 'My Passes & Tickets', icon: Ticket, path: 'my-tickets', roles: ['student', 'external'] },

  // Shared institutional items
  { label: 'Event History & Results', icon: History, path: 'history', roles: ['hod', 'staff', 'organizer', 'student', 'external'] },
  { label: 'My Team', icon: Users, path: 'team', roles: ['hod', 'staff', 'organizer', 'student'] },
  { label: 'Profile', icon: User, path: 'profile', roles: ['hod', 'staff', 'organizer', 'student'] },
  { label: 'Developers', icon: Code2, path: 'developers' },
];

const roleLabels: Record<string, string> = {
  hod: 'HOD & Management',
  staff: 'Staff & Faculty',
  organizer: 'Event Organizer',
  student: 'MEI Student Portal',
  external: 'External Events Portal',
  volunteer: 'Volunteer Desk Portal',
};

const DashboardLayout = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { currentUser, userProfile, logout, loginWithGoogle } = useAuth();
  const { notifications, markAllRead } = useNotificationsStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const basePath = `/dashboard/${role}`;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(role);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="gradient-card border-b border-border px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-foreground hover:text-primary transition-colors p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <button
            onClick={() => navigate(basePath)}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-card/80 border border-primary/30 p-0.5 flex items-center justify-center shrink-0">
              <MeiLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-heading font-bold text-primary text-glow leading-none">
                MEI EventHub
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Unified Institutional Events Management Ecosystem
              </p>
            </div>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Firestore DB Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-medium">Firestore Live</span>
          </div>

          <Badge
            variant="outline"
            className="text-[11px] border-primary/40 text-primary hidden md:inline-flex capitalize"
          >
            {roleLabels[role || ''] || role}
          </Badge>

          {/* User Profile or Google Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-border/60">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-7 h-7 rounded-full border border-primary/50"
                  title={currentUser.displayName || currentUser.email || ''}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center border border-primary/40"
                  title={currentUser.displayName || currentUser.email || ''}
                >
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left text-xs leading-tight">
                <p className="font-semibold text-foreground truncate max-w-[120px]">
                  {currentUser.displayName || 'Google User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {currentUser.email}
                </p>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleLogin}
              className="text-xs h-7 px-2 border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Auth</span>
            </Button>
          )}

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-foreground hover:text-primary transition-colors relative p-1.5 rounded-lg hover:bg-secondary/60"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 gradient-card border border-border rounded-xl shadow-2xl p-4 z-50 animate-slide-up space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-heading font-bold text-foreground text-sm">
                      Event Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No notifications at this time.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border text-xs space-y-0.5 transition-colors ${
                          n.read
                            ? 'bg-secondary/20 border-border/40 text-muted-foreground'
                            : 'bg-primary/10 border-primary/30 text-foreground'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{n.detail}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-border pt-2 text-center">
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Exit / Switch role */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Switch Role
          </Button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-[53px] w-64 gradient-card border-r border-border 
                      transform transition-transform duration-200 z-40 flex flex-col justify-between
                      ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="p-4 overflow-y-auto flex-1">
            <div className="mb-4 pb-2 border-b border-border/60">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {roleLabels[role || ''] || 'Dashboard Menu'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Role-Based Access Control</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                if (item.roles && !item.roles.includes(role || '')) return null;

                const fullTarget = item.path ? `${basePath}/${item.path}` : basePath;
                const isActive =
                  location.pathname === fullTarget ||
                  (item.path === '' && location.pathname === basePath);

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(fullTarget);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                        : 'text-foreground/80 hover:bg-secondary/60 hover:text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 text-primary" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/60 bg-secondary/20 space-y-3">
            {currentUser ? (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-6 h-6 rounded-full border border-primary/40 shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate text-[11px]">{currentUser.displayName || 'Google User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out of Firebase"
                  className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs 
                           border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in with Google
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs 
                         text-destructive hover:bg-destructive/10 transition-colors font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit to Portal
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {menuOpen && (
          <div
            className="fixed inset-0 top-[53px] bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 overflow-auto min-w-0 flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Footer at bottom with copyright and version */}
          <footer className="mt-12 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0">
                <MeiLogo className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-medium">
                © 2026 MEI EventHub — Mahendra Educational Institutions. All Rights Reserved.
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-secondary/80 border border-border text-foreground font-semibold">
                Version 2.4.0
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
