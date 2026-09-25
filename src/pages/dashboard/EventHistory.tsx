import { events } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users } from 'lucide-react';

const completedEvents = events.filter((e) => e.status === 'completed');

const EventHistory = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
    <h2 className="text-3xl font-heading font-bold text-primary text-glow">Event History</h2>
    <p className="text-muted-foreground">Past events with details and winners</p>

    {completedEvents.length === 0 ? (
      <div className="text-center py-16 text-muted-foreground">No past events yet.</div>
    ) : (
      completedEvents.map((event) => (
        <div key={event.id} className="gradient-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-heading font-semibold text-foreground">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.department} — {event.institution}</p>
            </div>
            <Badge className="bg-muted text-muted-foreground">Completed</Badge>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {event.date}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {event.registeredCount} participants</span>
          </div>

          {/* Mock winners */}
          <div className="border-t border-border pt-3">
            <h4 className="text-sm font-heading font-semibold text-primary flex items-center gap-1.5 mb-2">
              <Trophy className="w-4 h-4" /> Prize Winners
            </h4>
            <div className="space-y-1 text-sm">
              {['🥇 Ravi M — CSE, MEC (2023-2027)', '🥈 Divya K — IT, MIT (2022-2026)', '🥉 Suresh P — ECE, MCE (2023-2027)'].map((w) => (
                <p key={w} className="text-muted-foreground">{w}</p>
              ))}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default EventHistory;
