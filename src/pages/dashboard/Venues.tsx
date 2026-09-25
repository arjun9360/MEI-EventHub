import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVenuesStore, useEventsStore } from '@/lib/store';
import { type Venue } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Plus,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Search,
  Filter,
  Calendar,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const VENUE_TYPES = [
  'All Types',
  'Auditorium',
  'Seminar Hall',
  'Conference Hall',
  'Computer Lab',
  'Open Ground',
  'Classroom',
];

const Venues = () => {
  const { role } = useParams<{ role: string }>();
  const isOrganizer = role === 'hod' || role === 'organizer';
  const { venues, addVenue, updateVenue, deleteVenue } = useVenuesStore();
  const { events } = useEventsStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [scheduleVenue, setScheduleVenue] = useState<Venue | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('Academic Block');
  const [floor, setFloor] = useState('Ground');
  const [room, setRoom] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [type, setType] = useState('Seminar Hall');
  const [facilities, setFacilities] = useState('Projector, AC, Sound system');

  if (role === 'student' || role === 'external') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Campus venue infrastructure & allocation management is restricted to Institutional Staff, Organizers, and Management.
        </p>
        <Button onClick={() => window.history.back()} variant="outline" className="border-border text-xs">
          Return to Events
        </Button>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setBuilding('Academic Block');
    setFloor('Ground');
    setRoom('');
    setCapacity('100');
    setType('Seminar Hall');
    setFacilities('Projector, AC, Sound system');
    setEditingVenue(null);
  };

  const handleOpenEdit = (v: Venue) => {
    setEditingVenue(v);
    setName(v.name);
    setBuilding(v.building);
    setFloor(v.floor);
    setRoom(v.room);
    setCapacity(String(v.capacity));
    setType(v.type);
    setFacilities(v.facilities.join(', '));
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Venue name is required');
      return;
    }

    const facList = facilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingVenue) {
      updateVenue(editingVenue.id, {
        name,
        building,
        floor,
        room: room || '—',
        capacity: Number(capacity) || 50,
        type,
        facilities: facList,
      });
      toast.success(`Venue "${name}" updated successfully`);
    } else {
      const newV: Venue = {
        id: `v_${Date.now()}`,
        name,
        building,
        floor,
        room: room || '—',
        capacity: Number(capacity) || 50,
        type,
        facilities: facList,
        status: 'available',
        active: true,
        utilization: 10,
      };
      addVenue(newV);
      toast.success(`Venue "${name}" added to registry`);
    }

    setIsAddOpen(false);
    resetForm();
  };

  const toggleMaintenance = (v: Venue) => {
    const nextStatus = v.status === 'maintenance' ? 'available' : 'maintenance';
    updateVenue(v.id, {
      status: nextStatus,
      active: nextStatus !== 'maintenance',
    });
    toast.success(
      `${v.name} marked as ${nextStatus === 'maintenance' ? 'Under Maintenance' : 'Available'}`
    );
  };

  const handleDelete = (v: Venue) => {
    deleteVenue(v.id);
    toast.success(`Venue "${v.name}" removed`);
  };

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.building.toLowerCase().includes(search.toLowerCase()) ||
      v.room.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All Types' || v.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' && v.status === 'available') ||
      (statusFilter === 'occupied' && v.status === 'occupied') ||
      (statusFilter === 'maintenance' && v.status === 'maintenance');
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">Facilities & Infrastructure</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">Venue Management</h2>
          <p className="text-muted-foreground text-sm">
            Monitor availability, capacity limits, facilities, and active event allocations.
          </p>
        </div>
        {isOrganizer && (
          <Button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="gradient-primary text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Venue
          </Button>
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gradient-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase">
            <Building className="w-4 h-4" /> Total Venues
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 not-italic">{venues.length}</p>
          <p className="text-xs text-muted-foreground">Campus-wide facilities</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
            <CheckCircle2 className="w-4 h-4" /> Available Now
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2 not-italic">
            {venues.filter((v) => v.status === 'available').length}
          </p>
          <p className="text-xs text-muted-foreground">Ready for allocation</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase">
            <AlertTriangle className="w-4 h-4" /> Currently Occupied
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2 not-italic">
            {venues.filter((v) => v.status === 'occupied').length}
          </p>
          <p className="text-xs text-muted-foreground">Active event sessions</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase">
            <Users className="w-4 h-4" /> Total Seating Capacity
          </div>
          <p className="text-2xl font-bold text-primary mt-2 not-italic">
            {venues.reduce((acc, v) => acc + (v.capacity || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Across all halls & labs</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gradient-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search venue by name, room, building..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" /> Type:
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-secondary border-border h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENUE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary border-border h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((v) => {
          const venueEvents = events.filter(
            (e) => e.venue === v.name && !['cancelled', 'completed'].includes(e.status)
          );

          return (
            <div
              key={v.id}
              className="gradient-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-primary">{v.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5" /> {v.building} · {v.floor} Fl · Room {v.room}
                    </p>
                  </div>
                  <Badge
                    className={
                      v.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : v.status === 'occupied'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-destructive/20 text-destructive border-destructive/30'
                    }
                  >
                    {v.status === 'available'
                      ? 'Available'
                      : v.status === 'occupied'
                      ? 'Occupied'
                      : 'Maintenance'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="bg-secondary/40 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-lg font-bold text-foreground not-italic">{v.capacity} seats</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{v.type}</p>
                  </div>
                </div>

                {/* Facilities */}
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-semibold">Facilities:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {v.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="text-[11px] bg-secondary px-2 py-0.5 rounded text-foreground/80 border border-border/60"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Utilization meter */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-muted-foreground">Utilization rate</span>
                    <span className="text-primary font-semibold">{v.utilization}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${v.utilization}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleVenue(v)}
                  className="text-xs h-8 border-border hover:border-primary text-foreground"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1 text-primary" /> Schedule ({venueEvents.length})
                </Button>

                {isOrganizer && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMaintenance(v)}
                      title={v.status === 'maintenance' ? 'Set Available' : 'Set Maintenance'}
                      className="h-8 px-2 text-muted-foreground hover:text-amber-400"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(v)}
                      className="h-8 px-2 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(v)}
                      className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Venue Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="gradient-card border border-border rounded-xl p-6 max-w-lg w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-primary">
                {editingVenue ? 'Edit Venue' : 'Register New Venue'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="vname">Venue Name</Label>
                <Input
                  id="vname"
                  placeholder="e.g. Einstein Seminar Hall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VENUE_TYPES.filter((t) => t !== 'All Types').map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vcap">Capacity (Seats)</Label>
                  <Input
                    id="vcap"
                    type="number"
                    min="10"
                    max="5000"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="vbuild">Building</Label>
                  <Input
                    id="vbuild"
                    placeholder="Block name"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="bg-secondary border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vfloor">Floor</Label>
                  <Input
                    id="vfloor"
                    placeholder="Ground / 1st"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="bg-secondary border-border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vroom">Room #</Label>
                  <Input
                    id="vroom"
                    placeholder="e.g. S-204"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="bg-secondary border-border text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vfac">Facilities (comma-separated)</Label>
                <Input
                  id="vfac"
                  placeholder="Projector, AC, High-speed Wi-Fi, Mic system"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground font-semibold">
                  {editingVenue ? 'Save Changes' : 'Add Venue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Venue Schedule Modal */}
      {scheduleVenue && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="gradient-card border border-border rounded-xl p-6 max-w-lg w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-xl font-heading font-bold text-primary">
                  {scheduleVenue.name} — Schedule
                </h3>
                <p className="text-xs text-muted-foreground">
                  {scheduleVenue.building} · Capacity {scheduleVenue.capacity} seats
                </p>
              </div>
              <button
                onClick={() => setScheduleVenue(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {events.filter((e) => e.venue === scheduleVenue.name).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No active events currently scheduled in this venue.
                </div>
              ) : (
                events
                  .filter((e) => e.venue === scheduleVenue.name)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="border border-border rounded-lg p-3 bg-secondary/30 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ev.date} · {ev.time} – {ev.endTime}
                        </p>
                        <p className="text-xs text-primary/80 mt-0.5">Organizer: {ev.organizer}</p>
                      </div>
                      <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                        {ev.status}
                      </Badge>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleVenue(null)}
                className="border-border text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;
