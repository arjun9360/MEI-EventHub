import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventsStore, useRegistrationsStore } from '@/lib/store';
import { type Event, type Registration } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  ExternalLink,
  MessageSquare,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const MyTickets = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const { events } = useEventsStore();
  const { registrations } = useRegistrationsStore();

  const [activePass, setActivePass] = useState<{ reg: Registration; ev: Event } | null>(null);

  // Map registrations to event details
  const myRegistrations = registrations.map((r) => {
    const ev = events.find((e) => e.id === r.eventId);
    return {
      registration: r,
      event: ev,
    };
  });

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      <div>
        <p className="text-sm text-primary font-semibold">Student Portal</p>
        <h2 className="text-3xl font-heading font-bold text-foreground">My Registrations & QR Passes</h2>
        <p className="text-muted-foreground text-sm">
          Access your digital admission passes, check attendance confirmations, and view certificates.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myRegistrations.length === 0 ? (
          <div className="col-span-full gradient-card border border-border rounded-xl p-12 text-center text-muted-foreground">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
            <p className="font-semibold text-foreground">No event registrations found</p>
            <p className="text-xs mt-1">Browse upcoming events and register to claim your digital pass.</p>
            <Button
              onClick={() => navigate(`/dashboard/${role}`)}
              className="mt-4 gradient-primary text-primary-foreground text-xs"
            >
              Browse Events
            </Button>
          </div>
        ) : (
          myRegistrations.map(({ registration: r, event: ev }) => {
            if (!ev) return null;
            const isAttended = r.status === 'attended';
            const isCompleted = ev.status === 'completed';

            return (
              <div
                key={r.id}
                className="gradient-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                      {ev.category}
                    </Badge>
                    <Badge
                      className={`text-[10px] ${
                        isAttended
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : r.status === 'confirmed'
                          ? 'bg-primary/20 text-primary border-primary/30'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isAttended ? 'Attended' : r.status === 'confirmed' ? 'Confirmed' : r.status}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-bold text-foreground text-lg">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ev.department} · {ev.institution}
                  </p>

                  <div className="space-y-1.5 my-3.5 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {ev.date}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {ev.time} – {ev.endTime}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {ev.venue}
                    </p>
                  </div>

                  <div className="bg-secondary/40 rounded p-2.5 text-xs flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Participant</p>
                      <p className="font-semibold text-foreground">{r.name}</p>
                    </div>
                    <div className="text-right font-mono text-primary text-xs font-semibold">
                      {r.regId}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
                  <Button
                    onClick={() => setActivePass({ reg: r, ev })}
                    className="w-full gradient-primary text-primary-foreground text-xs font-semibold h-8"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5" /> View Digital Entry Pass
                  </Button>

                  {isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/${role}/event/${ev.id}/feedback`)}
                      className="w-full text-xs h-8 border-border text-foreground hover:border-primary"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" /> Give Event Feedback
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Entry Pass Modal */}
      {activePass && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="gradient-card border border-primary/40 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-slide-up text-center relative shadow-2xl">
            <button
              onClick={() => setActivePass(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Official Event Admission Pass
              </span>
              <h3 className="font-heading font-bold text-xl text-foreground mt-1">
                {activePass.ev.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activePass.ev.venue} · {activePass.ev.date}
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl mx-auto shadow-md border border-border inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=MEI-PASS-${activePass.reg.regId}-${activePass.ev.id}`}
                alt="Ticket QR"
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="bg-secondary/40 rounded-lg p-3 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attendee:</span>
                <span className="font-semibold text-foreground">{activePass.reg.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reg ID:</span>
                <span className="font-mono text-primary font-semibold">{activePass.reg.regId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize text-emerald-400 font-semibold">{activePass.reg.status}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                toast.success('Digital pass saved to downloads');
              }}
              variant="outline"
              className="w-full border-border text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-primary" /> Save Pass / Badge
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
