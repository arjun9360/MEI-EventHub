import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useRegistrationsStore } from '@/lib/store';
import { type Registration } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  TrendingUp,
  Timer,
  FileText,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Download,
  Trophy,
  UserCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const EventDetail = () => {
  const { eventId, role } = useParams();
  const navigate = useNavigate();
  const { events, updateEvent } = useEventsStore();
  const { registrations, registerUser } = useRegistrationsStore();

  const event = events.find((e) => e.id === eventId);
  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [dept, setDept] = useState('');
  const [institution, setInstitution] = useState('MEC');
  const [countdown, setCountdown] = useState('');
  const [showPassModal, setShowPassModal] = useState<Registration | null>(null);

  // Check if current user is already registered in store
  const isAlreadyRegistered = registrations.some(
    (r) => r.eventId === eventId && (r.regId === '22CS001' || r.regId === regId)
  );

  useEffect(() => {
    if (!event) return;
    const target = new Date(
      `${event.lastRegistrationDate}T${
        event.lastRegistrationTime === '11:59 PM' ? '23:59:00' : '17:00:00'
      }`
    );
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Registration Closed');
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m remaining`);
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up">
        <p className="text-lg font-semibold">Event Not Found</p>
        <Button onClick={() => navigate(-1)} className="mt-4 gradient-primary text-primary-foreground">
          Return to Events
        </Button>
      </div>
    );
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regId.trim() || !dept.trim()) {
      toast.error('Please enter Name, Registration ID, and Department');
      return;
    }

    const regRecord = registerUser({
      eventId: event.id,
      name,
      regId,
      department: dept,
      institution,
      status: 'confirmed',
    });

    // Increment registeredCount on the event
    updateEvent(event.id, {
      registeredCount: (event.registeredCount || 0) + 1,
    });

    toast.success(`Registration Confirmed for ${name}! Admission pass generated.`);
    setShowPassModal(regRecord);
  };

  const isCompleted = event.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto pb-28 space-y-6 animate-slide-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to events
      </button>

      {/* Main Card */}
      <div className="gradient-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                {event.category}
              </Badge>
              <Badge variant="outline" className="border-border text-xs uppercase">
                {event.mode} Mode
              </Badge>
              {event.fee === 0 ? (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                  Free Registration
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                  ₹{event.fee} Entry Fee
                </Badge>
              )}
            </div>
            <h2 className="text-3xl font-heading font-bold text-primary text-glow mt-1">
              {event.title}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Organized by {event.organizer} · {event.department} ({event.institution})
            </p>
          </div>

          <Badge
            className={`text-xs capitalize ${
              event.status === 'registration_open'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : event.status === 'completed'
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/20 text-primary border-primary/30'
            }`}
          >
            {event.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: 'Date', value: event.date },
            { icon: Clock, label: 'Time Window', value: `${event.time} – ${event.endTime}` },
            { icon: MapPin, label: 'Venue Location', value: event.venue },
            {
              icon: Users,
              label: 'Slot Capacity',
              value: `${event.registeredCount} / ${event.totalSlots}`,
            },
          ].map((item) => (
            <div key={item.label} className="bg-secondary/40 border border-border/60 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <item.icon className="w-3.5 h-3.5 text-primary" /> {item.label}
              </div>
              <p className="text-sm text-foreground font-semibold not-italic">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Registration Deadline & Popularity */}
        <div className="grid sm:grid-cols-2 gap-4 bg-secondary/30 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2.5 text-xs">
            <Timer className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-primary font-semibold">{countdown || 'Open for registration'}</p>
              <p className="text-muted-foreground text-[11px]">
                Deadline: {event.lastRegistrationDate} at {event.lastRegistrationTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Interest Rating</span>
                <span className="text-primary font-semibold">{event.popularity}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full"
                  style={{ width: `${event.popularity}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            {event.collegeAccess === 'all_colleges'
              ? '🌐 Open to All Engineering & Arts Colleges'
              : event.collegeAccess === 'mei_only'
              ? '🏫 Mahendra Educational Institutions Only'
              : `🏫 ${event.specifiedColleges?.join(', ')}`}
          </Badge>
          <Badge variant="outline" className="border-accent text-accent-foreground text-xs">
            {event.openTo === 'all_departments'
              ? '📚 All Academic Departments Eligible'
              : `📚 Specific Departments: ${event.specifiedDepartments?.join(', ')}`}
          </Badge>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">About This Event</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
        </div>

        {/* Speakers / Resource Persons */}
        {event.speakers && event.speakers.length > 0 && (
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Keynote Speakers & Resource Persons
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {event.speakers.map((spk, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/40 border border-border rounded-lg p-3 text-xs text-foreground font-semibold flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {spk.charAt(0)}
                  </div>
                  {spk}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions & Agenda Timeline */}
        {event.sessions && event.sessions.length > 0 && (
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Event Agenda & Session Timelines
            </h3>
            <div className="space-y-2 border-l-2 border-primary/30 pl-4">
              {event.sessions.map((sess, idx) => (
                <div key={sess.id || idx} className="bg-secondary/40 border border-border rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary not-italic">
                      {sess.start} – {sess.end}
                    </span>
                    <span className="text-muted-foreground">{sess.venue}</span>
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{sess.title}</h4>
                  <div className="flex gap-4 text-muted-foreground mt-1 text-[11px]">
                    {sess.speaker && <span>Lead: {sess.speaker}</span>}
                    {sess.coordinator && <span>Coordinator: {sess.coordinator}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents & Downloads */}
        {event.documents && event.documents.length > 0 && (
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Event Brochures & Official Documents
            </h3>
            <div className="flex flex-wrap gap-3">
              {event.documents.map((doc, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Downloading ${doc.name} (${doc.type})`)}
                  className="border-border text-xs text-foreground"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {doc.name} ({doc.type})
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Rules & Guidelines */}
        {event.rules && event.rules.length > 0 && (
          <div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Rules & Participation Guidelines
            </h3>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 bg-secondary/30 p-4 rounded-xl border border-border">
              {event.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results for Completed Events */}
        {isCompleted && (
          <div className="border border-primary/30 bg-primary/10 rounded-xl p-5 space-y-3">
            <h3 className="text-xl font-heading font-semibold text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Competition Results & Prize Winners
            </h3>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-background/60 border border-primary/30 p-3 rounded-lg">
                <p className="font-bold text-amber-300">🥇 1st Place (Winner)</p>
                <p className="font-semibold text-foreground mt-1">Ravi M & Team</p>
                <p className="text-[11px] text-muted-foreground">Computer Science, MEC</p>
              </div>
              <div className="bg-background/60 border border-primary/30 p-3 rounded-lg">
                <p className="font-bold text-slate-300">🥈 2nd Place (Runner-up)</p>
                <p className="font-semibold text-foreground mt-1">Divya K & Team</p>
                <p className="text-[11px] text-muted-foreground">Information Tech, MIT</p>
              </div>
              <div className="bg-background/60 border border-primary/30 p-3 rounded-lg">
                <p className="font-bold text-amber-600">🥉 3rd Place</p>
                <p className="font-semibold text-foreground mt-1">Suresh P</p>
                <p className="text-[11px] text-muted-foreground">ECE, MCE</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/dashboard/${role}/event/${event.id}/feedback`)}
              className="w-full mt-2 gradient-primary text-primary-foreground font-semibold text-xs"
            >
              📝 Submit Participant Feedback
            </Button>
          </div>
        )}
      </div>

      {/* Registration Section for Active Events */}
      {!isCompleted && (
        <div className="gradient-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-heading font-bold text-primary">Participant Registration</h3>
              <p className="text-xs text-muted-foreground">
                {event.registrationType === 'external'
                  ? 'This event requires external form registration.'
                  : 'Instant digital registration via MEI EventHub with digital QR admission pass.'}
              </p>
            </div>
            {isAlreadyRegistered && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Already Registered
              </Badge>
            )}
          </div>

          {event.registrationType === 'external' ? (
            <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-3">
              <p className="text-xs text-foreground">
                The organizer has configured an external registration portal (Google Forms / Institutional Portal).
              </p>
              <Button
                onClick={() => {
                  if (event.registrationUrl) {
                    window.location.href = event.registrationUrl;
                  } else {
                    toast.info('External link opened');
                  }
                }}
                className="gradient-primary text-primary-foreground font-semibold text-xs"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open External Registration Form
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pname" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="pname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abishek R"
                    className="bg-secondary border-border h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pregId" className="text-xs">
                    Registration ID / Roll #
                  </Label>
                  <Input
                    id="pregId"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="e.g. 22CS001"
                    className="bg-secondary border-border h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pdept" className="text-xs">
                    Department
                  </Label>
                  <Input
                    id="pdept"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="bg-secondary border-border h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pinst" className="text-xs">
                    Institution
                  </Label>
                  <Input
                    id="pinst"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. MEC"
                    className="bg-secondary border-border h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-muted-foreground">
                  By registering, you confirm attendance for the scheduled date ({event.date}).
                </p>
                <Button
                  type="submit"
                  className="gradient-primary text-primary-foreground font-semibold text-xs px-6"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Registration
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Instant Digital Pass Modal upon registration */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="gradient-card border border-primary/50 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-slide-up text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-foreground">Registration Successful!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Here is your official digital entry pass for {event.title}.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl inline-block border border-border shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MEI-PASS-${showPassModal.regId}-${event.id}`}
                alt="Ticket QR"
                className="w-36 h-36 object-contain"
              />
            </div>

            <div className="bg-secondary/40 rounded-lg p-3 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participant:</span>
                <span className="font-semibold text-foreground">{showPassModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reg ID:</span>
                <span className="font-mono text-primary font-semibold">{showPassModal.regId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue:</span>
                <span className="text-foreground">{event.venue}</span>
              </div>
            </div>

            <Button
              onClick={() => setShowPassModal(null)}
              className="w-full gradient-primary text-primary-foreground font-semibold text-xs"
            >
              Done & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
