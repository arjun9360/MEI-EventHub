import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useFeedbacksStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, Users, BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const COLORS = ['hsl(174,73%,47%)', 'hsl(210,78%,40%)', 'hsl(205,55%,50%)', 'hsl(0,84%,60%)', 'hsl(40,90%,55%)'];

const FeedbackAnalytics = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  const { feedbacks } = useFeedbacksStore();

  if (role !== 'hod' && role !== 'staff' && role !== 'organizer') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-4">
        <p className="text-xl font-heading font-semibold text-destructive">Access Restricted</p>
        <p className="text-sm max-w-md mx-auto">
          Feedback Analytics and survey evaluation data are restricted to HOD, Staff, and Event Organizers.
        </p>
        <Button onClick={() => navigate(`/dashboard/${role}`)} variant="outline" className="border-border text-xs">
          Return to Events
        </Button>
      </div>
    );
  }

  // Group feedback by event
  const completedEvents = events.filter((e) => e.status === 'completed');

  const eventFeedbackMap = completedEvents.map((event) => {
    const fb = feedbacks.filter((f) => f.eventId === event.id);
    const avg = (key: 'rating' | 'contentQuality' | 'organization' | 'venueRating' | 'overallExperience') =>
      fb.length ? +(fb.reduce((s, f) => s + f[key], 0) / fb.length).toFixed(1) : 0;
    return {
      event,
      feedbacks: fb,
      avgRating: avg('rating'),
      avgContent: avg('contentQuality'),
      avgOrganization: avg('organization'),
      avgVenue: avg('venueRating'),
      avgOverall: avg('overallExperience'),
      count: fb.length,
    };
  });

  // Aggregate for all events
  const allFb = feedbacks;
  const totalAvg = allFb.length
    ? +(allFb.reduce((s, f) => s + f.rating, 0) / allFb.length).toFixed(1)
    : 0;

  // Dept distribution
  const deptCounts: Record<string, number> = {};
  allFb.forEach((f) => {
    deptCounts[f.department] = (deptCounts[f.department] || 0) + 1;
  });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r}★`,
    count: allFb.filter((f) => f.rating === r).length,
  }));

  // Radar data (aggregate)
  const radarData = [
    { subject: 'Content', value: allFb.length ? +(allFb.reduce((s, f) => s + f.contentQuality, 0) / allFb.length).toFixed(1) : 0 },
    { subject: 'Organization', value: allFb.length ? +(allFb.reduce((s, f) => s + f.organization, 0) / allFb.length).toFixed(1) : 0 },
    { subject: 'Venue', value: allFb.length ? +(allFb.reduce((s, f) => s + f.venueRating, 0) / allFb.length).toFixed(1) : 0 },
    { subject: 'Overall', value: allFb.length ? +(allFb.reduce((s, f) => s + f.overallExperience, 0) / allFb.length).toFixed(1) : 0 },
  ];

  const exportFeedbackCSV = () => {
    if (allFb.length === 0) {
      toast.error('No feedback records available for CSV export.');
      return;
    }

    const headers = [
      'Feedback ID',
      'Event ID',
      'Event Title',
      'Student Name',
      'Registration ID',
      'Department',
      'Overall Rating (1-5)',
      'Content Quality',
      'Organization',
      'Venue Rating',
      'Overall Experience',
      'Comment',
      'Submitted At',
    ];

    const rows = allFb.map((f) => {
      const ev = events.find((e) => e.id === f.eventId);
      const title = ev ? ev.title : `Event #${f.eventId}`;
      return [
        `"${f.id}"`,
        `"${f.eventId}"`,
        `"${title.replace(/"/g, '""')}"`,
        `"${f.studentName.replace(/"/g, '""')}"`,
        `"${f.regId.replace(/"/g, '""')}"`,
        `"${f.department.replace(/"/g, '""')}"`,
        f.rating,
        f.contentQuality,
        f.organization,
        f.venueRating,
        f.overallExperience,
        `"${(f.comment || '').replace(/"/g, '""')}"`,
        `"${f.submittedAt || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `mei_eventhub_feedback_analytics_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Feedback analytics CSV downloaded successfully!');
  };

  return (
    <div className="space-y-6 pb-20 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">Institutional Insights</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">Feedback Analytics</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Student survey responses, satisfaction indicators, and facility feedback across completed events.
          </p>
        </div>

        <Button
          onClick={exportFeedbackCSV}
          className="gradient-primary text-primary-foreground font-semibold text-xs shrink-0"
        >
          <Download className="w-4 h-4 mr-2" /> Export to CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: MessageSquare, label: 'Total Responses', value: allFb.length },
          { icon: Star, label: 'Average Rating', value: `${totalAvg} / 5` },
          { icon: Users, label: 'Events Reviewed', value: completedEvents.length },
          { icon: BarChart3, label: 'Departments', value: Object.keys(deptCounts).length },
        ].map((card) => (
          <div key={card.label} className="gradient-card border border-border rounded-xl p-4">
            <card.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground not-italic">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating distribution bar chart */}
        <div className="gradient-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingDist}>
              <XAxis dataKey="rating" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(209,40%,18%)', border: '1px solid hsl(210,30%,25%)', borderRadius: 8 }}
                labelStyle={{ color: 'hsl(200,40%,80%)' }}
              />
              <Bar dataKey="count" fill="hsl(174,73%,47%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dept pie chart */}
        <div className="gradient-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Responses by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {deptData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(209,40%,18%)', border: '1px solid hsl(210,30%,25%)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="gradient-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Quality Metrics Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(210,30%,25%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
              <Radar dataKey="value" stroke="hsl(174,73%,47%)" fill="hsl(174,73%,47%)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-event breakdown */}
        <div className="gradient-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Per-Event Evaluation</h3>
          <div className="space-y-3">
            {eventFeedbackMap.map(({ event, count, avgOverall }) => (
              <div key={event.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{count} student responses</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">{avgOverall} ★</Badge>
              </div>
            ))}
            {eventFeedbackMap.length === 0 && (
              <p className="text-muted-foreground text-sm">No completed events with feedback yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent comments */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recent Participant Reviews</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {allFb.map((f) => (
            <div key={f.id} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{f.studentName}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= f.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{f.comment}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{f.department} • {f.regId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
