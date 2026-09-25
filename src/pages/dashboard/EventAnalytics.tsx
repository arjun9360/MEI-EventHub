import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useRegistrationsStore, useVenuesStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  Building,
  FileSpreadsheet,
  ArrowUpDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#00B4D8', '#2EC4B6', '#E71D36', '#FF9F1C', '#7209B7', '#4361EE'];

const EventAnalytics = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  const { registrations } = useRegistrationsStore();
  const { venues } = useVenuesStore();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [instFilter, setInstFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Compute enriched metrics for each event
  const enrichedEvents = useMemo(() => {
    return events.map((ev) => {
      const evRegs = registrations.filter((r) => r.eventId === ev.id);
      const attendedCount = evRegs.filter((r) => r.status === 'attended').length;
      const registeredCount = ev.registeredCount || evRegs.length;
      const totalSlots = ev.totalSlots || 100;
      const fillRate = Math.round((registeredCount / totalSlots) * 100);
      const attendanceRate = evRegs.length ? Math.round((attendedCount / evRegs.length) * 100) : 0;

      return {
        ...ev,
        registeredCount,
        attendedCount,
        fillRate,
        attendanceRate,
        actualRegs: evRegs.length,
      };
    });
  }, [events, registrations]);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return enrichedEvents.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.organizer.toLowerCase().includes(search.toLowerCase()) ||
        ev.venue.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || ev.department === deptFilter;
      const matchInst = instFilter === 'all' || ev.institution === instFilter;
      const matchCat = categoryFilter === 'all' || ev.category === categoryFilter;
      return matchSearch && matchDept && matchInst && matchCat;
    });
  }, [enrichedEvents, search, deptFilter, instFilter, categoryFilter]);

  // High level KPIs
  const totalEvents = events.length;
  const totalRegistrations = enrichedEvents.reduce((s, e) => s + e.registeredCount, 0);
  const totalAttended = enrichedEvents.reduce((s, e) => s + e.attendedCount, 0);
  const avgAttendanceRate = enrichedEvents.length
    ? Math.round(enrichedEvents.reduce((s, e) => s + e.attendanceRate, 0) / enrichedEvents.length)
    : 0;
  const avgFillRate = enrichedEvents.length
    ? Math.round(enrichedEvents.reduce((s, e) => s + e.fillRate, 0) / enrichedEvents.length)
    : 0;

  // Chart: Registration vs Capacity vs Turnout
  const chartData = filteredEvents.slice(0, 8).map((e) => ({
    name: e.title.length > 14 ? e.title.slice(0, 12) + '…' : e.title,
    Capacity: e.totalSlots,
    Registrations: e.registeredCount,
    Attended: e.attendedCount,
  }));

  // Chart: Department breakdown
  const deptMap: Record<string, number> = {};
  events.forEach((e) => {
    deptMap[e.department] = (deptMap[e.department] || 0) + (e.registeredCount || 0);
  });
  const deptChartData = Object.entries(deptMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Unique filters lists
  const departments = ['all', ...Array.from(new Set(events.map((e) => e.department)))];
  const institutions = ['all', ...Array.from(new Set(events.map((e) => e.institution)))];
  const categories = ['all', ...Array.from(new Set(events.map((e) => e.category)))];

  // CSV Export function for Institutional Reporting
  const exportPerformanceCSV = (targetEvents = filteredEvents) => {
    if (targetEvents.length === 0) {
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
      'Total Capacity Slots',
      'Registered Count',
      'Quota Fill Rate (%)',
      'Verified Turnout (Attended)',
      'Attendance Rate (%)',
      'Event Status',
      'Student Interest Rating (%)',
      'Registration Fee (INR)',
      'College Eligibility',
      'Department Eligibility',
      'Registration Method',
    ];

    const rows = targetEvents.map((ev) => [
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
      `${ev.fillRate}%`,
      ev.attendedCount,
      `${ev.attendanceRate}%`,
      `"${ev.status}"`,
      `${ev.popularity}%`,
      ev.fee,
      `"${ev.collegeAccess || 'all_colleges'}"`,
      `"${ev.openTo || 'all_departments'}"`,
      `"${ev.registrationType}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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

    toast.success(`Exported ${targetEvents.length} event records to CSV successfully!`);
  };

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-primary/20 text-primary">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Institutional Reporting & Analytics
            </span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Event Performance Analytics
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">
            Real-time institutional performance reporting on event turnouts, venue capacity fulfillment,
            and cross-departmental engagement.
          </p>
        </div>

        {/* Primary Export to CSV Button */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => exportPerformanceCSV(filteredEvents)}
            className="gradient-primary text-primary-foreground font-semibold text-xs shadow-md"
          >
            <Download className="w-4 h-4 mr-2" /> Export to CSV
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {[
          {
            icon: Calendar,
            label: 'Total Events',
            value: totalEvents,
            subtext: 'Campus-wide scheduled',
          },
          {
            icon: Users,
            label: 'Total Registrations',
            value: totalRegistrations,
            subtext: `${avgFillRate}% avg capacity quota`,
          },
          {
            icon: CheckCircle2,
            label: 'Verified Turnout',
            value: totalAttended,
            subtext: 'QR validated attendees',
          },
          {
            icon: TrendingUp,
            label: 'Avg Turnout Rate',
            value: `${avgAttendanceRate}%`,
            subtext: 'Actual attendees / registrants',
          },
          {
            icon: Building,
            label: 'Monitored Venues',
            value: venues.length,
            subtext: `${venues.filter((v) => v.status === 'available').length} currently free`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="gradient-card border border-border rounded-xl p-4 flex flex-col justify-between"
          >
            <div>
              <item.icon className="w-5 h-5 text-primary mb-2.5" />
              <p className="text-2xl font-bold text-foreground not-italic">{item.value}</p>
              <p className="text-xs font-semibold text-foreground/90 mt-1">{item.label}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/50 pt-1.5">
              {item.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Main Bar Chart */}
        <div className="gradient-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Capacity vs Registration vs Turnout
              </h3>
              <p className="text-xs text-muted-foreground">
                Visual comparison across active and scheduled institutional events
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 bg-accent rounded" /> Capacity
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 bg-primary rounded" /> Registered
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Attended
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar dataKey="Capacity" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Registrations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Attended" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Department Distribution */}
        <div className="gradient-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Registration by Department
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Distribution of participant interest across academic departments
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {deptChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val) => <span className="text-[11px] text-foreground">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Total active engagement across {Object.keys(deptMap).length} departments
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Performance Table */}
      <div className="gradient-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Institutional Event Records ({filteredEvents.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Filtered performance dataset ready for export or inspection
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events or venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-secondary border-border"
              />
            </div>

            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-8 text-xs w-36 bg-secondary border-border">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d} className="text-xs">
                    {d === 'all' ? 'All Depts' : d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={instFilter} onValueChange={setInstFilter}>
              <SelectTrigger className="h-8 text-xs w-28 bg-secondary border-border">
                <SelectValue placeholder="Institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((i) => (
                  <SelectItem key={i} value={i} className="text-xs">
                    {i === 'all' ? 'All MEI' : i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPerformanceCSV(filteredEvents)}
              className="h-8 text-xs border-border hover:border-primary text-foreground"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-primary" /> Export Filtered
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-border/80 rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/60 text-muted-foreground border-b border-border font-medium">
              <tr>
                <th className="p-3">Event Title & Dept</th>
                <th className="p-3">Date & Venue</th>
                <th className="p-3 text-center">Capacity</th>
                <th className="p-3 text-center">Registrations</th>
                <th className="p-3 text-center">Fill Rate</th>
                <th className="p-3 text-center">Turnout</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <p className="font-semibold text-foreground">{ev.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {ev.category} · {ev.department} ({ev.institution})
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="text-foreground">{ev.date}</p>
                    <p className="text-[11px] text-muted-foreground">{ev.venue}</p>
                  </td>
                  <td className="p-3 text-center font-mono text-foreground">{ev.totalSlots}</td>
                  <td className="p-3 text-center font-mono font-semibold text-primary">
                    {ev.registeredCount}
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        ev.fillRate >= 80
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-primary/40 text-primary'
                      }`}
                    >
                      {ev.fillRate}%
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-mono text-emerald-400 font-semibold">{ev.attendedCount}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      ({ev.attendanceRate}%)
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      className={`text-[10px] capitalize ${
                        ev.status === 'completed'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/20 text-primary border-primary/30'
                      }`}
                    >
                      {ev.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportPerformanceCSV([ev])}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary"
                    >
                      <Download className="w-3 h-3 mr-1" /> CSV
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No events matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
