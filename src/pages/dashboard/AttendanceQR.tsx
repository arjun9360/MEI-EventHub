import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useRegistrationsStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Check,
  Calendar,
  MapPin,
  Clock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const AttendanceQR = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  const { registrations, updateRegistrationStatus } = useRegistrationsStore();

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '1');
  const [scanInput, setScanInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (role !== 'hod' && role !== 'organizer' && role !== 'volunteer') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Attendance QR Scanner and verification console is restricted to Event Organizers, designated Volunteers, and HOD administrators.
        </p>
        <Button onClick={() => navigate(`/dashboard/${role}`)} variant="outline" className="border-border text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const eventRegistrations = registrations.filter((r) => r.eventId === selectedEvent?.id);

  const attendedCount = eventRegistrations.filter((r) => r.status === 'attended').length;
  const confirmedCount = eventRegistrations.filter((r) => r.status === 'confirmed').length;
  const waitlistedCount = eventRegistrations.filter((r) => r.status === 'waitlisted').length;
  const noShowCount = eventRegistrations.filter((r) => r.status === 'no-show').length;

  const attendanceRate = eventRegistrations.length
    ? Math.round((attendedCount / eventRegistrations.length) * 100)
    : 0;

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) {
      toast.error('Please enter a Registration ID or Student Name');
      return;
    }

    const reg = eventRegistrations.find(
      (r) =>
        r.regId.toLowerCase() === scanInput.trim().toLowerCase() ||
        r.name.toLowerCase() === scanInput.trim().toLowerCase()
    );

    if (!reg) {
      toast.error(`No registration found matching "${scanInput}" for this event.`);
      return;
    }

    if (reg.status === 'attended') {
      toast.warning(`Duplicate Scan: ${reg.name} (${reg.regId}) is already marked as Attended!`);
      return;
    }

    updateRegistrationStatus(reg.id, 'attended');
    toast.success(`Verified & Checked-in: ${reg.name} (${reg.regId}) marked Attended!`);
    setScanInput('');
  };

  const toggleStatus = (id: string, current: string) => {
    const nextStatus = (current === 'attended' ? 'confirmed' : 'attended') as 'confirmed' | 'attended';
    updateRegistrationStatus(id, nextStatus);
    toast.success(`Participant status updated to ${nextStatus}`);
  };

  const filteredRegistrations = eventRegistrations.filter(
    (r) =>
      r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.regId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.department.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // SVG QR Code generator representation
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MEI-EVENT-${selectedEvent?.id}-${selectedEvent?.title.replace(
    /\s+/g,
    '-'
  )}`;

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">Attendance Verification</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">QR-Based Attendance</h2>
          <p className="text-muted-foreground text-sm">
            Generate digital QR passes, verify student arrivals, and prevent duplicate check-ins in real time.
          </p>
        </div>

        {/* Select Event dropdown */}
        <div className="w-full sm:w-72">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="bg-secondary border-border text-xs">
              <SelectValue placeholder="Choose event..." />
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase">Total Registered</p>
          <p className="text-2xl font-bold text-foreground mt-2 not-italic">{eventRegistrations.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed or Waitlisted</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-emerald-400 font-semibold uppercase">Attended (Present)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2 not-italic">{attendedCount}</p>
          <p className="text-xs text-emerald-400/70 mt-1">{attendanceRate}% of registered total</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-amber-400 font-semibold uppercase">Pending Check-in</p>
          <p className="text-2xl font-bold text-amber-400 mt-2 not-italic">{confirmedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Expected at registration desk</p>
        </div>
        <div className="gradient-card border border-border rounded-xl p-4">
          <p className="text-xs text-destructive font-semibold uppercase">No-Show / Cancelled</p>
          <p className="text-2xl font-bold text-destructive mt-2 not-italic">{noShowCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Marked absent</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.9fr] gap-6">
        {/* Left: Venue QR Code Display */}
        <div className="gradient-card border border-border rounded-xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <QrCode className="w-5 h-5 text-primary" />
            <span>Official Event Attendance QR</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Project this code at the venue entry desk or display it for participant self check-in.
          </p>

          <div className="p-4 bg-white rounded-xl shadow-lg border border-border">
            <img
              src={qrDataUrl}
              alt="Event Attendance QR"
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="space-y-1 w-full pt-2 border-t border-border text-left">
            <h4 className="font-heading font-bold text-foreground text-base">{selectedEvent?.title}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {selectedEvent?.date}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> {selectedEvent?.time} – {selectedEvent?.endTime}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedEvent?.venue}
            </p>
          </div>

          <div className="flex gap-2 w-full pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success('Attendance badge sent to printer preview');
              }}
              className="w-full border-border text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-primary" /> Print Desk Sign
            </Button>
          </div>
        </div>

        {/* Right: Check-in Scanner Console & Live Attendee List */}
        <div className="space-y-4">
          {/* Quick Check-in form */}
          <div className="gradient-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Barcode / Student ID Check-In Scanner</span>
            </div>
            <form onSubmit={handleManualCheckIn} className="flex gap-2">
              <Input
                placeholder="Scan or enter Reg ID (e.g. 22CS001) or Name..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="bg-secondary border-border"
              />
              <Button type="submit" className="gradient-primary text-primary-foreground font-semibold shrink-0">
                <Check className="w-4 h-4 mr-1" /> Verify & Mark
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground">
              Tip: Pressing Enter after hardware barcode scanning triggers instant verification.
            </p>
          </div>

          {/* Attendee Registry Table */}
          <div className="gradient-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-heading font-bold text-foreground text-lg flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Registered Participants ({eventRegistrations.length})
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search attendee by ID or name..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-8 bg-secondary border-border h-8 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-2.5">Participant</th>
                    <th className="pb-2.5">Reg ID</th>
                    <th className="pb-2.5">Department</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No participant registrations found for this event.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{reg.name}</td>
                        <td className="py-3 font-mono text-primary">{reg.regId}</td>
                        <td className="py-3 text-muted-foreground">{reg.department} ({reg.institution})</td>
                        <td className="py-3">
                          <Badge
                            className={`text-[10px] ${
                              reg.status === 'attended'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : reg.status === 'confirmed'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : reg.status === 'waitlisted'
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(reg.id, reg.status)}
                            className={`text-[11px] h-7 px-2.5 border-border ${
                              reg.status === 'attended'
                                ? 'text-muted-foreground hover:text-amber-400'
                                : 'text-emerald-400 hover:border-emerald-400'
                            }`}
                          >
                            {reg.status === 'attended' ? 'Revoke' : 'Mark Present'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceQR;
