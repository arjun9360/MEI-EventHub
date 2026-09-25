import { useNavigate } from 'react-router-dom';
import { MeiLogo } from '@/components/MeiLogo';
import { Shield, GraduationCap, Users, Globe, UserCheck, CalendarDays } from 'lucide-react';

const roles = [
  {
    id: 'hod',
    title: 'HOD & Management',
    icon: Shield,
    description: 'Manage events, venues, conflicts, analytics & approvals',
    path: '/login/hod',
  },
  {
    id: 'staff',
    title: 'Staff & Faculty',
    icon: Users,
    description: 'Review departmental schedules, monitor student participation & venues',
    path: '/login/staff',
  },
  {
    id: 'organizer',
    title: 'Event Organizer',
    icon: CalendarDays,
    description: 'Create & schedule events, allocate halls, manage QR attendance & volunteers',
    path: '/login/organizer',
  },
  {
    id: 'student',
    title: 'MEI Students',
    icon: GraduationCap,
    description: 'Browse campus events, register & get digital QR passes',
    path: '/login/student',
  },
  {
    id: 'external',
    title: 'Other College Students',
    icon: Globe,
    description: 'Discover open public events & register without login',
    path: '/dashboard/external',
  },
  {
    id: 'volunteer',
    title: 'Volunteer Crew',
    icon: UserCheck,
    description: 'Check-in participants with live QR scanner & duty logs',
    path: '/login/volunteer',
  },
];

const Portal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-light-accent/10"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="animate-slide-up mb-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-3 animate-float p-1 flex items-center justify-center">
          <MeiLogo className="w-full h-full object-contain filter drop-shadow-md" />
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary text-glow">
          MEI EventHub
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Unified Institutional Events Management & Smart Scheduling Ecosystem
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full z-10">
        {roles.map((role, index) => (
          <button
            key={role.id}
            onClick={() => navigate(role.path)}
            className="gradient-card border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3 
                       hover:glow-teal hover:border-primary/50 transition-all duration-300 
                       hover:scale-[1.03] cursor-pointer group animate-slide-up"
            style={{ animationDelay: `${0.08 * (index + 1)}s` }}
          >
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center 
                            group-hover:animate-pulse-glow transition-all">
              <role.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-base font-heading font-semibold text-primary">
              {role.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {role.description}
            </p>
          </button>
        ))}
      </div>

      {/* Footer with Copyright and Version Number */}
      <footer className="mt-12 text-center space-y-1.5 z-10">
        <p className="text-xs text-muted-foreground">
          WEB-03: Smart Event Management & Scheduling System · Mahendra Educational Institutions
        </p>
        <p className="text-[11px] text-muted-foreground/80 font-medium">
          © 2026 MEI EventHub — Mahendra Educational Institutions. All Rights Reserved.
        </p>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary/60 border border-border text-[10px] text-muted-foreground font-mono">
          <span>Release Version</span>
          <span className="text-primary font-semibold">v2.4.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Portal;
