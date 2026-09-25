import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useVenuesStore } from '@/lib/store';
import { type EventSession } from '@/data/mockData';
import { detectConflicts, suggestAlternatives, overlaps, type Alternative, type Conflict } from '@/lib/conflicts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Sparkles,
  ChevronRight,
  User,
  X,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const Schedule = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isOrganizer = role === 'hod' || role === 'staff' || role === 'organizer';
  const { events, updateEvent } = useEventsStore();
  const { venues } = useVenuesStore();

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '1');

  // Add session modal state
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionStart, setSessionStart] = useState('10:00');
  const [sessionEnd, setSessionEnd] = useState('11:00');
  const [sessionSpeaker, setSessionSpeaker] = useState('');
  const [sessionCoordinator, setSessionCoordinator] = useState('');
  const [sessionVenue, setSessionVenue] = useState('');

  // Conflict scanner
  const activeEvents = events.filter((e) => !['cancelled'].includes(e.status));
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Global schedule conflicts on the selected date
  const dayEvents = activeEvents.filter((e) => e.date === selectedDate);
  const detectedConflicts: { eventA: string; eventB: string; venue: string; time: string; conflict: Conflict }[] = [];

  for (let i = 0; i < dayEvents.length; i++) {
    for (let j = i + 1; j < dayEvents.length; j++) {
      const a = dayEvents[i];
      const b = dayEvents[j];
      if (overlaps(a.time, a.endTime, b.time, b.endTime)) {
        if (a.venue === b.venue) {
          detectedConflicts.push({
            eventA: a.title,
            eventB: b.title,
            venue: a.venue,
            time: `${a.time} - ${a.endTime} vs ${b.time} - ${b.endTime}`,
            conflict: {
              type: 'venue',
              message: `Venue conflict: "${a.title}" and "${b.title}" both booked at ${a.venue} concurrently.`,
            },
          });
        }
      }
    }
  }

  // Candidate conflict for selected event
  const currentCandidateConflicts = selectedEvent
    ? detectConflicts(
        {
          date: selectedEvent.date,
          start: selectedEvent.time,
          end: selectedEvent.endTime,
          venue: selectedEvent.venue,
          organizer: selectedEvent.organizer,
          capacity: selectedEvent.totalSlots,
          excludeEventId: selectedEvent.id,
        },
        events,
        venues
      )
    : [];

  const alternatives: Alternative[] =
    selectedEvent && currentCandidateConflicts.length > 0
      ? suggestAlternatives(
          {
            date: selectedEvent.date,
            start: selectedEvent.time,
            end: selectedEvent.endTime,
            venue: selectedEvent.venue,
            organizer: selectedEvent.organizer,
            capacity: selectedEvent.totalSlots,
            excludeEventId: selectedEvent.id,
          },
          events,
          venues
        )
      : [];

  const handleApplyAlternative = (alt: Alternative) => {
    if (!selectedEvent) return;
    updateEvent(selectedEvent.id, {
      venue: alt.venue,
      time: alt.start,
      endTime: alt.end,
    });
    toast.success(`Schedule resolved! Moved to ${alt.venue} (${alt.start} – ${alt.end})`);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!sessionTitle.trim()) {
      toast.error('Session title required');
      return;
    }

    const newSession: EventSession = {
      id: `s_${Date.now()}`,
      title: sessionTitle,
      start: sessionStart,
      end: sessionEnd,
      speaker: sessionSpeaker || 'Guest Speaker',
      coordinator: sessionCoordinator || selectedEvent.organizer,
      venue: sessionVenue || selectedEvent.venue,
    };

    const updatedSessions = [...(selectedEvent.sessions || []), newSession];
    updateEvent(selectedEvent.id, { sessions: updatedSessions });
    toast.success(`Session "${sessionTitle}" added to schedule`);
    setIsAddSessionOpen(false);
    setSessionTitle('');
    setSessionSpeaker('');
    setSessionCoordinator('');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!selectedEvent) return;
    const updatedSessions = selectedEvent.sessions.filter((s) => s.id !== sessionId);
    updateEvent(selectedEvent.id, { sessions: updatedSessions });
    toast.success('Session removed');
  };

  // Unique dates from events
  const allDates = Array.from(new Set(events.map((e) => e.date))).sort();

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">Institutional Timetable</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">Schedule Management</h2>
          <p className="text-muted-foreground text-sm">
            Coordinate sessions, resolve venue allocations, and maintain conflict-free timelines.
          </p>
        </div>
        {isOrganizer && (
          <Button
            onClick={() => navigate(`/dashboard/${role}/create-event`)}
            className="gradient-primary text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" /> Schedule New Event
          </Button>
        )}
      </div>

      {/* Date selector tabs */}
      <div className="gradient-card border border-border rounded-xl p-3 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-muted-foreground font-semibold px-2 shrink-0 flex items-center gap-1">
          <Calendar className="w-4 h-4 text-primary" /> Dates:
        </span>
        {allDates.map((d) => {
          const count = events.filter((e) => e.date === d).length;
          const isSelected = selectedDate === d;
          return (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {d} <span className="opacity-70 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Conflict Alert Banner if any conflicts on this day */}
      {detectedConflicts.length > 0 && (
        <div className="border border-destructive/40 bg-destructive/10 rounded-xl p-4 text-foreground space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>⚠ Automated Conflict Detected on {selectedDate}</span>
          </div>
          {detectedConflicts.map((dc, idx) => (
            <div
              key={idx}
              className="text-xs bg-background/50 border border-destructive/20 rounded p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold text-destructive">{dc.conflict.message}</p>
                <p className="text-muted-foreground">Overlap Window: {dc.time}</p>
              </div>
              <Badge className="bg-destructive/20 text-destructive border-destructive/30 shrink-0">
                Action Required
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Main Schedule Workspace */}
      <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-6">
        {/* Left: Events on Selected Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-semibold text-foreground">
              Events on {selectedDate}
            </h3>
            <span className="text-xs text-muted-foreground">{dayEvents.length} events scheduled</span>
          </div>

          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="gradient-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No events scheduled on this date.
              </div>
            ) : (
              dayEvents.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id;
                const hasConflict = detectConflicts(
                  {
                    date: ev.date,
                    start: ev.time,
                    end: ev.endTime,
                    venue: ev.venue,
                    organizer: ev.organizer,
                    capacity: ev.totalSlots,
                    excludeEventId: ev.id,
                  },
                  events,
                  venues
                ).length > 0;

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`gradient-card border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary/40 shadow-md'
                        : 'border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-heading font-semibold text-primary text-lg">{ev.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ev.department} · {ev.institution}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          className={`text-[10px] ${
                            hasConflict
                              ? 'bg-destructive/20 text-destructive border-destructive/30'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {hasConflict ? 'Conflict' : 'Verified'}
                        </Badge>
                      </div>
                    </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {ev.time} – {ev.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {ev.venue}
                        </span>
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Event Detailed Session Breakdown & Conflict Inspector */}
        {selectedEvent ? (
          <div className="space-y-5">
            {/* Event Header Card */}
            <div className="gradient-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Organizer: {selectedEvent.organizer} · Mode: {selectedEvent.mode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isOrganizer && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSessionVenue(selectedEvent.venue);
                        setIsAddSessionOpen(true);
                      }}
                      className="gradient-primary text-primary-foreground text-xs font-semibold h-8"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Session
                    </Button>
                  )}
                </div>
              </div>

              {/* Status / Conflict Card for this event */}
              {currentCandidateConflicts.length > 0 ? (
                <div className="border border-destructive/40 bg-destructive/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Scheduling Conflict Detected</span>
                  </div>
                  {currentCandidateConflicts.map((c, i) => (
                    <p key={i} className="text-xs text-foreground bg-destructive/15 rounded p-2 border border-destructive/20">
                      {c.message}
                    </p>
                  ))}

                  {/* Suggest alternatives button / choices */}
                  {alternatives.length > 0 && (
                    <div className="pt-2 border-t border-destructive/20 space-y-2">
                      <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested Suitable Alternatives:
                      </p>
                      <div className="grid gap-2">
                        {alternatives.map((alt, i) => (
                          <div
                            key={i}
                            className="bg-card border border-border rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-foreground">
                                {i + 1}. {alt.venue} ({alt.start} – {alt.end})
                              </p>
                              <p className="text-[11px] text-muted-foreground">{alt.reason}</p>
                            </div>
                            {isOrganizer && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplyAlternative(alt)}
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[11px] h-7 shrink-0"
                              >
                                Apply Alternative
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-lg p-3 flex items-center gap-2 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Conflict-free schedule! Venue and organizer allocations verified.</span>
                </div>
              )}

              {/* Sessions Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Sessions & Milestones
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedEvent.sessions?.length || 0} scheduled sessions
                  </span>
                </div>

                {(!selectedEvent.sessions || selectedEvent.sessions.length === 0) ? (
                  <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    No sessions defined yet. Click "Add Session" to add agenda items.
                  </div>
                ) : (
                  <div className="space-y-2.5 relative pl-4 border-l-2 border-primary/30">
                    {selectedEvent.sessions.map((sess, idx) => (
                      <div
                        key={sess.id || idx}
                        className="bg-secondary/40 border border-border rounded-lg p-3.5 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary not-italic">
                            {sess.start} – {sess.end}
                          </span>
                          {isOrganizer && (
                            <button
                              onClick={() => handleDeleteSession(sess.id)}
                              className="text-muted-foreground hover:text-destructive text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <h5 className="font-semibold text-foreground text-sm">{sess.title}</h5>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                          {sess.speaker && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-primary/70" /> Speaker: {sess.speaker}
                            </span>
                          )}
                          {sess.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary/70" /> {sess.venue}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Add Session Modal */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="gradient-card border border-border rounded-xl p-6 max-w-md w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-primary">Add Event Session</h3>
              <button onClick={() => setIsAddSessionOpen(false)} className="text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSession} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="stitle">Session Title</Label>
                <Input
                  id="stitle"
                  placeholder="e.g. Keynote Address / Hands-on Lab"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sstart">Start Time</Label>
                  <Input
                    id="sstart"
                    type="time"
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="send">End Time</Label>
                  <Input
                    id="send"
                    type="time"
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="sspeaker">Speaker / Lead</Label>
                <Input
                  id="sspeaker"
                  placeholder="e.g. Dr. Kavya Menon"
                  value={sessionSpeaker}
                  onChange={(e) => setSessionSpeaker(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="scoord">Session Coordinator</Label>
                <Input
                  id="scoord"
                  placeholder="e.g. Priya M"
                  value={sessionCoordinator}
                  onChange={(e) => setSessionCoordinator(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1">
                <Label>Venue Room</Label>
                <Select value={sessionVenue} onValueChange={setSessionVenue}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="border-border text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary text-primary-foreground font-semibold text-xs">
                  Save Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
