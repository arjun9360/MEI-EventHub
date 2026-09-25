import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventsStore, useVenuesStore } from '@/lib/store';
import { detectConflicts, suggestAlternatives, type Alternative } from '@/lib/conflicts';
import { type Event, type EventMode, type EventStatus } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Building,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const EVENT_CATEGORIES = [
  'Seminar',
  'Workshop',
  'Webinar',
  'Hackathon',
  'Symposium',
  'Technical Event',
  'Cultural Event',
  'Competition',
  'Conference',
  'Guest Lecture',
  'FDP',
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const { events, addEvent } = useEventsStore();
  const { venues } = useVenuesStore();

  const [form, setForm] = useState({
    title: 'AI & Emerging Technologies Seminar',
    category: 'Seminar',
    department: 'Computer Science',
    institution: 'MEC',
    organizer: 'Dr. S. Anand',
    date: '2026-10-15',
    start: '10:00',
    end: '12:00',
    venue: 'Main Auditorium',
    capacity: '120',
    mode: 'offline' as EventMode,
    deadline: '2026-10-12',
    deadlineTime: '11:59 PM',
    contact: 'events@mec.edu · +91 98765 43010',
    fee: '0',
    participationType: 'individual' as 'individual' | 'team',
    collegeAccess: 'all_colleges' as 'all_colleges' | 'mei_only' | 'specific_college',
    openTo: 'all_departments' as 'all_departments' | 'specific_department',
    registrationType: 'internal' as 'internal' | 'external',
    registrationUrl: '',
    speakers: 'Dr. S. Anand, CTO — Nexa Labs',
    description: 'A comprehensive seminar on artificial intelligence applications, deep learning advances, and emerging industry paradigms.',
  });

  const [hasChecked, setHasChecked] = useState(true);
  const [selectedAlt, setSelectedAlt] = useState<Alternative | null>(null);

  const candidate = useMemo(
    () => ({
      date: form.date,
      start: form.start,
      end: form.end,
      venue: form.venue,
      organizer: form.organizer,
      capacity: Number(form.capacity) || 50,
    }),
    [form.date, form.start, form.end, form.venue, form.organizer, form.capacity]
  );

  const conflicts = useMemo(
    () => detectConflicts(candidate, events, venues),
    [candidate, events, venues]
  );

  const alternatives = useMemo(
    () => (conflicts.length > 0 ? suggestAlternatives(candidate, events, venues) : []),
    [conflicts, candidate, events, venues]
  );

  if (role !== 'hod' && role !== 'organizer') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Event creation and smart scheduling is reserved for Event Organizers and HOD / Management. Staff & Faculty can review departmental schedules and monitor events.
        </p>
        <Button onClick={() => navigate(`/dashboard/${role}`)} variant="outline" className="border-border text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const setField = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSelectedAlt(null);
    setHasChecked(true);
  };

  const handleApplyAlternative = (alt: Alternative) => {
    setSelectedAlt(alt);
    setForm((f) => ({
      ...f,
      venue: alt.venue,
      start: alt.start,
      end: alt.end,
    }));
    toast.success(`Applied alternative: ${alt.venue} (${alt.start} – ${alt.end})`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasChecked(true);

    const freshConflicts = detectConflicts(candidate, events, venues);
    if (freshConflicts.length > 0) {
      toast.error('Cannot publish while scheduling conflicts exist! Please resolve or apply a suggested alternative.');
      return;
    }

    const newEvent: Event = {
      id: `ev_${Date.now()}`,
      title: form.title,
      department: form.department,
      institution: form.institution,
      organizer: form.organizer,
      category: form.category,
      mode: form.mode,
      date: form.date,
      time: form.start,
      endTime: form.end,
      venue: form.venue,
      lastRegistrationDate: form.deadline,
      lastRegistrationTime: form.deadlineTime,
      totalSlots: Number(form.capacity) || 100,
      registeredCount: 0,
      openTo: form.openTo,
      collegeAccess: form.collegeAccess,
      description: form.description,
      status: 'registration_open' as EventStatus,
      popularity: 80,
      fee: Number(form.fee) || 0,
      participationType: form.participationType,
      contact: form.contact,
      registrationType: form.registrationType,
      registrationUrl: form.registrationUrl || undefined,
      featured: true,
      speakers: form.speakers ? form.speakers.split(',').map((s) => s.trim()) : [],
      rules: ['Valid student ID required', 'Report 15 minutes before session time', 'Certificates awarded upon full attendance'],
      documents: [{ name: 'Event Brochure & Guidelines', type: 'PDF', url: '#' }],
      sessions: [
        {
          id: `s_inaug_${Date.now()}`,
          title: 'Opening & Welcome Keynote',
          start: form.start,
          end: `${form.start.split(':')[0]}:30`,
          speaker: form.speakers?.split(',')[0] || form.organizer,
          coordinator: form.organizer,
          venue: form.venue,
        },
        {
          id: `s_core_${Date.now()}`,
          title: `${form.title} — Main Session`,
          start: `${form.start.split(':')[0]}:30`,
          end: form.end,
          speaker: form.speakers?.split(',')[0] || form.organizer,
          coordinator: form.organizer,
          venue: form.venue,
        },
      ],
    };

    addEvent(newEvent);
    toast.success(`Event "${form.title}" published successfully without conflicts!`);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-slide-up">
      <div>
        <p className="text-sm text-primary font-semibold">Event Lifecycle & Allocation</p>
        <h2 className="text-3xl font-heading font-bold text-foreground">Create & Schedule Event</h2>
        <p className="text-muted-foreground text-sm">
          Define event parameters, automatically detect venue/time overlaps, and resolve conflicts instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="gradient-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Mode</Label>
              <Select value={form.mode} onValueChange={(v) => setField('mode', v as EventMode)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline (In-Person)</SelectItem>
                  <SelectItem value="online">Online (Virtual)</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="organizer">Lead Organizer / Faculty</Label>
              <Input
                id="organizer"
                value={form.organizer}
                onChange={(e) => setField('organizer', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dept">Department</Label>
              <Input
                id="dept"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="inst">Institution</Label>
              <Select value={form.institution} onValueChange={(v) => setField('institution', v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEC">MEC — Mahendra Engineering College</SelectItem>
                  <SelectItem value="MIT">MIT — Mahendra Institute of Technology</SelectItem>
                  <SelectItem value="MCE">MCE — Mahendra College of Engineering</SelectItem>
                  <SelectItem value="MECW">MECW — Mahendra Engineering College for Women</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="capacity">Max Seating Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={form.capacity}
                onChange={(e) => setField('capacity', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="deadline">Registration Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setField('deadline', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={form.start}
                onChange={(e) => setField('start', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="time"
                value={form.end}
                onChange={(e) => setField('end', e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            {/* Venue selection */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="venue">Venue Allocation</Label>
              <Select value={form.venue} onValueChange={(v) => setField('venue', v)}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.name}>
                      {v.name} ({v.capacity} seats · {v.building})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Eligibility & Access */}
            <div className="space-y-1">
              <Label>College Eligibility</Label>
              <Select
                value={form.collegeAccess}
                onValueChange={(v) => setField('collegeAccess', v)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_colleges">Open to All Colleges (Public)</SelectItem>
                  <SelectItem value="mei_only">MEI Institutions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Registration Method</Label>
              <Select
                value={form.registrationType}
                onValueChange={(v) => setField('registrationType', v)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal MEI EventHub Registration</SelectItem>
                  <SelectItem value="external">External Form (Google Forms / Website)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.registrationType === 'external' && (
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="regUrl">External Registration Link</Label>
                <Input
                  id="regUrl"
                  placeholder="https://forms.google.com/..."
                  value={form.registrationUrl}
                  onChange={(e) => setField('registrationUrl', e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="speakers">Guest Speakers / Resource Persons</Label>
              <Input
                id="speakers"
                placeholder="Names separated by comma"
                value={form.speakers}
                onChange={(e) => setField('speakers', e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="desc">Event Description & Abstract</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setHasChecked(true);
                if (conflicts.length === 0) {
                  toast.success('No conflicts detected! Venue and timing are verified.');
                } else {
                  toast.warning(`${conflicts.length} conflict(s) detected. Check suggestions.`);
                }
              }}
              className="border-border text-xs"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 text-primary" /> Check Conflicts Now
            </Button>

            <Button
              type="submit"
              className="gradient-primary text-primary-foreground font-semibold text-xs ml-auto"
            >
              Validate & Publish Event <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </form>

        {/* Smart Validation & Alternatives Side Panel */}
        <div className="space-y-4">
          <div className="gradient-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-lg font-bold text-foreground">Smart Conflict Detection</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated validation checks venue double-booking, organizer overlap, and hall seating limits.
            </p>

            {hasChecked && conflicts.length === 0 && (
              <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-400">Zero Conflicts Detected</p>
                  <p className="text-muted-foreground mt-0.5">
                    {form.venue} is completely free on {form.date} from {form.start} to {form.end}.
                  </p>
                </div>
              </div>
            )}

            {hasChecked && conflicts.length > 0 && (
              <div className="space-y-2.5">
                <div className="border border-destructive/40 bg-destructive/10 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-destructive font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Scheduling Conflict Detected</span>
                  </div>
                  {conflicts.map((c, idx) => (
                    <p key={idx} className="bg-destructive/15 p-2 rounded text-foreground border border-destructive/20">
                      {c.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suitable Alternatives Panel */}
          {alternatives.length > 0 && (
            <div className="gradient-card border border-primary/40 rounded-xl p-5 space-y-3 animate-slide-up shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-foreground text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Suggested Suitable Alternatives
                </h4>
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono">
                  {alternatives.length} Found
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                One-click schedule resolution matches available halls and suitable time slots:
              </p>

              <div className="space-y-2 pt-1">
                {alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="border border-border/80 hover:border-primary rounded-lg p-3 bg-secondary/30 transition-all text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-primary text-sm">
                          {idx + 1}. {alt.venue}
                        </p>
                        <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-primary" /> {alt.start} – {alt.end}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApplyAlternative(alt)}
                        className="gradient-primary text-primary-foreground text-[11px] h-7 font-semibold"
                      >
                        Apply Alternative
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-secondary/50 p-1.5 rounded">
                      {alt.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
