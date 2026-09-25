import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventsStore } from '@/lib/store';
import { Calendar, Clock, MapPin, Users, TrendingUp, Search, Filter, Sparkles, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  'All Categories',
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
];

const INSTITUTIONS = ['All Institutions', 'MEC', 'MIT', 'MCE', 'MECW'];
const MODES = ['All Modes', 'offline', 'online', 'hybrid'];

const EventList = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const isOrganizer = role === 'hod' || role === 'staff' || role === 'organizer';
  const { events } = useEventsStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');
  const [selectedMode, setSelectedMode] = useState('All Modes');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'slots'>('date');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Role access filter: external users only see events open to all colleges
      if (role === 'external' && e.collegeAccess !== 'all_colleges') return false;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.institution.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All Categories' || e.category === selectedCategory;
      const matchesInst =
        selectedInstitution === 'All Institutions' || e.institution === selectedInstitution;
      const matchesMode = selectedMode === 'All Modes' || e.mode === selectedMode;

      return matchesSearch && matchesCat && matchesInst && matchesMode;
    }).sort((a, b) => {
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === 'slots') return (b.totalSlots - b.registeredCount) - (a.totalSlots - a.registeredCount);
      return a.date.localeCompare(b.date);
    });
  }, [events, role, search, selectedCategory, selectedInstitution, selectedMode, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'published':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'ongoing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-slide-up">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary text-glow">
            {role === 'external' ? 'Open Institutional Events' : 'Event Discovery'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover academic symposiums, hackathons, guest lectures, and institutional workshops across MEI campuses.
          </p>
        </div>

        {isOrganizer && (
          <Button
            onClick={() => navigate(`/dashboard/${role}/create-event`)}
            className="gradient-primary text-primary-foreground font-semibold shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {/* Search and Filters Card */}
      <div className="gradient-card border border-border rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by event title, organizer, department, category, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-secondary border-border h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
            <SelectTrigger className="bg-secondary border-border h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INSTITUTIONS.map((inst) => (
                <SelectItem key={inst} value={inst}>
                  {inst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="bg-secondary border-border h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === 'All Modes' ? m : m.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: 'date' | 'popularity' | 'slots') => setSortBy(v)}>
            <SelectTrigger className="bg-secondary border-border h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: Upcoming Date</SelectItem>
              <SelectItem value="popularity">Sort: Highest Popularity</SelectItem>
              <SelectItem value="slots">Sort: Available Slots</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>Showing {filteredEvents.length} events</span>
        <span>Click any event card to view full schedule, speakers & register</span>
      </div>

      {/* Event Cards Grid */}
      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <div className="gradient-card border border-border rounded-xl p-12 text-center text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary opacity-40" />
            <p className="font-semibold text-foreground text-sm">No matching events found</p>
            <p className="text-xs mt-1">Try clearing filters or search terms.</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const slotsLeft = Math.max(0, event.totalSlots - event.registeredCount);
            const fillPercent = Math.min(100, Math.round((event.registeredCount / event.totalSlots) * 100));

            return (
              <button
                key={event.id}
                onClick={() => navigate(`/dashboard/${role}/event/${event.id}`)}
                className="gradient-card border border-border rounded-xl p-5 text-left 
                           hover:border-primary/50 hover:glow-teal transition-all duration-200 
                           animate-slide-up w-full group relative"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="text-xl font-heading font-semibold text-primary group-hover:text-glow transition-all">
                        {event.title}
                      </h3>
                      <Badge className={`text-xs capitalize ${getStatusColor(event.status)}`}>
                        {event.status.replace('_', ' ')}
                      </Badge>
                      {event.featured && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                          ⭐ Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] uppercase border-border">
                        {event.mode}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      Organized by {event.organizer} · {event.department} ({event.institution})
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {event.time} – {event.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {event.venue}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
                        {event.category}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] border-border text-foreground/80">
                        {event.collegeAccess === 'all_colleges'
                          ? '🌐 Open to All Colleges'
                          : event.collegeAccess === 'mei_only'
                          ? '🏫 MEI Only'
                          : `🏫 ${event.specifiedColleges?.join(', ')}`}
                      </Badge>
                      {event.fee === 0 ? (
                        <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-400">
                          Free Entry
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-400">
                          ₹{event.fee} Entry Fee
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Right slot gauge */}
                  <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 border-border/60 pt-3 md:pt-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-foreground font-bold">{event.registeredCount}</span>
                      <span className="text-muted-foreground">/ {event.totalSlots} registered</span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold">{slotsLeft} slots remaining</p>
                    <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full transition-all"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {event.popularity}% interest rating
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventList;
