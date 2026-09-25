import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVolunteersStore, useEventsStore } from '@/lib/store';
import { type Volunteer } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Shield,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const RESPONSIBILITIES = [
  'Registration desk',
  'QR attendance',
  'Venue coordination',
  'Participant support',
  'Technical support',
  'Stage management',
];

const Volunteers = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { volunteers, addVolunteer, updateVolunteerStatus, removeVolunteer } = useVolunteersStore();
  const { events } = useEventsStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [eventId, setEventId] = useState(events[0]?.id || '1');
  const [responsibility, setResponsibility] = useState(RESPONSIBILITIES[0]);

  if (role !== 'hod' && role !== 'organizer' && role !== 'volunteer') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Volunteer crew management is restricted to Event Organizers, designated Volunteers, and HOD administrators.
        </p>
        <Button onClick={() => navigate(`/dashboard/${role}`)} variant="outline" className="border-border text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regId.trim()) {
      toast.error('Volunteer name and student registration ID required');
      return;
    }

    addVolunteer({
      name,
      regId,
      eventId,
      responsibility,
      status: 'assigned',
    });

    toast.success(`Volunteer ${name} assigned to duty`);
    setName('');
    setRegId('');
    setIsAddOpen(false);
  };

  const handleStatusChange = (id: string, nextStatus: Volunteer['status']) => {
    updateVolunteerStatus(id, nextStatus);
    toast.success(`Duty status updated to ${nextStatus}`);
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.regId.toLowerCase().includes(search.toLowerCase()) ||
      v.responsibility.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || v.responsibility === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">Event Operations</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">Volunteer Management</h2>
          <p className="text-muted-foreground text-sm">
            Coordinate student volunteer teams, designate desk duties, and monitor on-ground operations.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="gradient-primary text-primary-foreground font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" /> Assign Volunteer
        </Button>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Total Volunteers</p>
          <p className="text-2xl font-bold text-foreground mt-2 not-italic">{volunteers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active student crew</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-amber-400 uppercase font-semibold">Assigned</p>
          <p className="text-2xl font-bold text-amber-400 mt-2 not-italic">
            {volunteers.filter((v) => v.status === 'assigned').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pending check-in</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-emerald-400 uppercase font-semibold">Checked-In / On Duty</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2 not-italic">
            {volunteers.filter((v) => v.status === 'checked-in').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active on venue floor</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-primary uppercase font-semibold">Duty Completed</p>
          <p className="text-2xl font-bold text-primary mt-2 not-italic">
            {volunteers.filter((v) => v.status === 'completed').length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Eligible for certificates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="gradient-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search volunteers by name, ID or task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Responsibility:
          </span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48 bg-secondary border-border text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responsibilities</SelectItem>
              {RESPONSIBILITIES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-3">Volunteer</th>
                <th className="pb-3">Reg ID</th>
                <th className="pb-3">Assigned Event</th>
                <th className="pb-3">Responsibility</th>
                <th className="pb-3">Duty Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No volunteers found. Click "Assign Volunteer" to designate crew members.
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((vol) => {
                  const ev = events.find((e) => e.id === vol.eventId);
                  return (
                    <tr key={vol.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 font-semibold text-foreground flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {vol.name.charAt(0)}
                        </div>
                        {vol.name}
                      </td>
                      <td className="py-3.5 font-mono text-primary">{vol.regId}</td>
                      <td className="py-3.5 text-muted-foreground">
                        <span className="font-semibold text-foreground block">{ev?.title || 'General Duty'}</span>
                        <span className="text-[11px] opacity-80">{ev?.date}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="bg-secondary px-2 py-0.5 rounded text-[11px] border border-border text-foreground">
                          {vol.responsibility}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <Badge
                          className={`text-[10px] ${
                            vol.status === 'completed'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : vol.status === 'checked-in'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {vol.status === 'checked-in'
                            ? 'Checked-in (On Duty)'
                            : vol.status === 'completed'
                            ? 'Completed'
                            : 'Assigned'}
                        </Badge>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next =
                              vol.status === 'assigned'
                                ? 'checked-in'
                                : vol.status === 'checked-in'
                                ? 'completed'
                                : 'assigned';
                            handleStatusChange(vol.id, next);
                          }}
                          className="h-7 text-[11px] border-border hover:border-primary px-2"
                        >
                          {vol.status === 'assigned'
                            ? 'Check-In'
                            : vol.status === 'checked-in'
                            ? 'Mark Done'
                            : 'Reset'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            removeVolunteer(vol.id);
                            toast.success(`Volunteer assignment removed`);
                          }}
                          className="h-7 px-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Volunteer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="gradient-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-primary">Assign Student Volunteer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="vname">Student Full Name</Label>
                <Input
                  id="vname"
                  placeholder="e.g. Karthik R"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vreg">Registration ID</Label>
                <Input
                  id="vreg"
                  placeholder="e.g. 23CS041"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1">
                <Label>Event Assignment</Label>
                <Select value={eventId} onValueChange={setEventId}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title} ({e.date})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Assigned Responsibility</Label>
                <Select value={responsibility} onValueChange={setResponsibility}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSIBILITIES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="border-border text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground font-semibold text-xs">
                  Assign Duty
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
