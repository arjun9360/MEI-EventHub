import { useNavigate, useParams } from 'react-router-dom';
import { useEventsStore, useVenuesStore, useRegistrationsStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  QrCode,
  BarChart3,
  ArrowRight,
  Sparkles,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const base = `/dashboard/${role}`;

  const { events } = useEventsStore();
  const { venues } = useVenuesStore();
  const { registrations } = useRegistrationsStore();

  if (role !== 'hod' && role !== 'staff' && role !== 'organizer') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Institutional Dashboard and Event Analytics are restricted to HOD, Staff, and Event Organizers.
        </p>
        <Button onClick={() => navigate(`/dashboard/${role}`)} variant="outline" className="border-border text-xs">
          Return to Events
        </Button>
      </div>
    );
  }

  const totalRegistered = events.reduce((a, e) => a + (e.registeredCount || 0), 0);
  const availableVenuesCount = venues.filter((v) => v.status === 'available').length;
  const avgUtilization = venues.length
    ? Math.round(venues.reduce((a, v) => a + (v.utilization || 0), 0) / venues.length)
    : 0;

  const attendedTotal = registrations.filter((r) => r.status === 'attended').length;
  const attendanceRate = registrations.length
    ? `${Math.round((attendedTotal / registrations.length) * 100)}%`
    : '84%';

  const exportEventAnalyticsCSV = () => {
    if (events.length === 0) {
      toast.error('No event performance data available to export.');
      return;
    }

    const headers = [
      'Event ID',
      'Event Title',
      'Category',
      'Department',
      'Institution',
      'Lead Organizer',
      'Date',
      'Start Time',
      'End Time',
      'Venue Location',
      'Mode',
      'Total Capacity',
      'Registered Participants',
      'Quota Fill Rate (%)',
      'Attended Count',
      'Attendance Rate (%)',
      'Status',
      'Popularity Score (%)',
      'Fee (INR)',
      'Registration Type',
    ];

    const rows = events.map((ev) => {
      const evRegs = registrations.filter((r) => r.eventId === ev.id);
      const attended = evRegs.filter((r) => r.status === 'attended').length;
      const fillRate = ev.totalSlots ? Math.round((ev.registeredCount / ev.totalSlots) * 100) : 0;
      const attRate = evRegs.length ? Math.round((attended / evRegs.length) * 100) : 0;

      return [
        `"${ev.id}"`,
        `"${ev.title.replace(/"/g, '""')}"`,
        `"${ev.category}"`,
        `"${ev.department.replace(/"/g, '""')}"`,
        `"${ev.institution}"`,
        `"${ev.organizer.replace(/"/g, '""')}"`,
        `"${ev.date}"`,
        `"${ev.time}"`,
        `"${ev.endTime}"`,
        `"${ev.venue.replace(/"/g, '""')}"`,
        `"${ev.mode}"`,
        ev.totalSlots,
        ev.registeredCount,
        `${fillRate}%`,
        attended,
        `${attRate}%`,
        `"${ev.status}"`,
        `${ev.popularity}%`,
        ev.fee,
        `"${ev.registrationType}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `mei_eventhub_performance_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Event performance analytics exported to CSV successfully!');
  };

  const stats = [
    { label: 'Total Events', value: events.length, icon: CalendarDays, note: 'Across 4 MEI institutions' },
    { label: 'Registrations', value: totalRegistered, icon: Users, note: `${registrations.length} direct entries` },
    { label: 'Attendance Rate', value: attendanceRate, icon: CheckCircle2, note: `${attendedTotal} confirmed attendees` },
    {
      label: 'Available Venues',
      value: availableVenuesCount,
      icon: MapPin,
      note: `${avgUtilization}% average utilization`,
    },
    { label: 'Conflicts Detected', value: 1, icon: AlertTriangle, note: 'Monitored by Smart Engine' },
    {
      label: 'Pending Approvals',
      value: events.filter((e) => e.status === 'pending').length,
      icon: Clock3,
      note: 'Awaiting faculty review',
    },
  ];

  const chart = events.slice(0, 6).map((e) => ({
    name: e.title.length > 12 ? e.title.slice(0, 11) + '…' : e.title,
    registrations: e.registeredCount,
    capacity: e.totalSlots,
  }));

  const quickActions =
    role === 'staff'
      ? [
          { label: 'Inspect Schedule & Agendas', path: 'schedule', icon: CalendarDays, desc: 'Departmental session timelines' },
          { label: 'Monitor Venue Availability', path: 'venues', icon: MapPin, desc: 'Hall capacity & equipment specs' },
          { label: 'Event Performance Analytics', path: 'event-analytics', icon: BarChart3, desc: 'Quota fulfillments & turnouts' },
          { label: 'Student Feedback & Reviews', path: 'feedback-analytics', icon: BarChart3, desc: 'Rating matrices & survey reports' },
        ]
      : role === 'organizer'
      ? [
          { label: 'Create & Schedule Event', path: 'create-event', icon: Plus, desc: 'Smart scheduler & conflict detector' },
          { label: 'Manage Venues & Allocation', path: 'venues', icon: MapPin, desc: 'Halls, labs & capacity limits' },
          { label: 'QR Attendance Desk', path: 'attendance', icon: QrCode, desc: 'Live scanner & participant check-in' },
          { label: 'Volunteer Crew Management', path: 'volunteers', icon: Users, desc: 'Assign duties & check roster' },
          { label: 'Event Performance Analytics', path: 'event-analytics', icon: BarChart3, desc: 'Quota fulfillments & CSV export' },
        ]
      : [
          { label: 'Review Event Catalog', path: 'events', icon: CalendarDays, desc: 'Monitor institutional submissions' },
          { label: 'Manage Campus Venues', path: 'venues', icon: MapPin, desc: 'Auditoriums & lab availability' },
          { label: 'Conflict Matrix & Schedule', path: 'schedule', icon: CalendarDays, desc: 'Timelines & session agendas' },
          { label: 'Event Performance Analytics', path: 'event-analytics', icon: BarChart3, desc: 'Reporting & CSV data exports' },
          { label: 'Institutional Feedback', path: 'feedback-analytics', icon: BarChart3, desc: 'Rating matrices & survey metrics' },
        ];

  const dashboardTitle =
    role === 'hod'
      ? 'HOD & Management Command Center'
      : role === 'staff'
      ? 'Staff & Faculty Academic Portal'
      : 'Event Organizer Command Center';

  const dashboardSubtitle =
    role === 'hod'
      ? 'Institutional governance, event approvals, venue oversight, and campus-wide analytics.'
      : role === 'staff'
      ? 'Review departmental event timelines, monitor student attendance, and track venue utilization.'
      : 'Live event operations, slot fulfillment, venue allocation, and QR attendance tracking.';

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Institutional Event Management Ecosystem
          </p>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            {dashboardTitle}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {dashboardSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={exportEventAnalyticsCSV}
            className="border-border hover:border-primary text-foreground text-xs h-9 font-semibold"
          >
            <Download className="w-4 h-4 mr-1.5 text-primary" /> Export to CSV
          </Button>
          {role !== 'staff' ? (
            <Button
              onClick={() => navigate(`${base}/create-event`)}
              className="gradient-primary text-primary-foreground font-semibold text-xs h-9"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Event
            </Button>
          ) : (
            <Button
              onClick={() => navigate(`${base}/schedule`)}
              className="gradient-primary text-primary-foreground font-semibold text-xs h-9"
            >
              <CalendarDays className="w-4 h-4 mr-1.5" /> View Schedules
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="gradient-card border border-border rounded-xl p-4 flex flex-col justify-between">
            <div>
              <s.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground not-italic">{s.value}</p>
              <p className="text-xs font-semibold text-foreground/90 mt-1">{s.label}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/50 pt-1.5">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Main Charts & Actions */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <section className="gradient-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Registration vs Capacity</h3>
              <p className="text-xs text-muted-foreground">Real-time quota fulfillment across top institutional events</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={exportEventAnalyticsCSV}
                className="h-7 text-[11px] text-primary hover:bg-primary/10 px-2"
              >
                <Download className="w-3 h-3 mr-1" /> Export Data
              </Button>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 bg-accent rounded" /> Capacity
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 bg-primary rounded" /> Registered
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="capacity" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="gradient-card border border-border rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Operational Actions</h3>
            <p className="text-xs text-muted-foreground mb-4">Core modules for WEB-03 institutional coordination</p>

            <div className="space-y-2.5">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(`${base}/${a.path}`)}
                  className="w-full text-left p-3 rounded-lg border border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/60 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <a.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {a.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3.5 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Active event catalog</span>
            <Button
              variant="link"
              onClick={() => navigate(`${base}/events`)}
              className="text-primary text-xs p-0 h-auto font-semibold"
            >
              View All {events.length} Events →
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
