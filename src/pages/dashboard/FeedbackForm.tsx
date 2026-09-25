import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore, useFeedbacksStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ratingCategories = [
  { key: 'contentQuality', label: 'Content Quality & Clarity' },
  { key: 'organization', label: 'Event Organization & Timing' },
  { key: 'venueRating', label: 'Venue & Facilities Experience' },
  { key: 'overallExperience', label: 'Overall Experience' },
];

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-110 p-0.5"
      >
        <Star
          className={`w-6 h-6 ${star <= value ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
        />
      </button>
    ))}
  </div>
);

const FeedbackForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEventsStore();
  const { addFeedback } = useFeedbacksStore();

  const event = events.find((e) => e.id === eventId);

  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [dept, setDept] = useState('');
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({
    contentQuality: 5,
    organization: 5,
    venueRating: 5,
    overallExperience: 5,
  });

  if (!event || event.status !== 'completed') {
    return (
      <div className="text-center py-20 text-muted-foreground animate-slide-up space-y-3">
        <p className="text-base font-semibold">Feedback Not Available</p>
        <p className="text-xs">Feedback can only be submitted for completed events.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="border-border text-xs">
          Back
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regId || !dept) {
      toast.error('Please fill in your name, registration ID, and department');
      return;
    }
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error('Please provide a rating for all evaluation categories');
      return;
    }

    const avgRating = Math.round(
      Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
    );

    addFeedback({
      eventId: event.id,
      studentName: name,
      regId,
      department: dept,
      rating: avgRating,
      contentQuality: ratings.contentQuality,
      organization: ratings.organization,
      venueRating: ratings.venueRating,
      overallExperience: ratings.overallExperience,
      comment: comment || 'Constructive session with practical takeaways.',
    });

    toast.success('Feedback recorded successfully! Thank you for rating.');
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-slide-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Event
      </button>

      <div className="gradient-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <span className="text-xs font-semibold text-primary uppercase">Participant Evaluation</span>
          <h2 className="text-2xl font-heading font-bold text-primary text-glow mt-1">
            Event Feedback
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {event.title} — {event.department} ({event.institution})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abishek R"
                className="bg-secondary border-border text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Registration ID</Label>
              <Input
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                placeholder="e.g. 22CS001"
                className="bg-secondary border-border text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Department</Label>
              <Input
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                placeholder="e.g. CSE"
                className="bg-secondary border-border text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/60">
            <h3 className="text-base font-heading font-semibold text-foreground">
              Rate Your Experience
            </h3>
            {ratingCategories.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center justify-between bg-secondary/40 border border-border/60 rounded-xl p-3.5"
              >
                <span className="text-xs font-semibold text-foreground">{cat.label}</span>
                <StarRating
                  value={ratings[cat.key]}
                  onChange={(v) => setRatings((prev) => ({ ...prev, [cat.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-1">
            <Label className="text-xs">Comments & Suggestions for Improvement</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What went well? Any suggestions for future institutional workshops?"
              className="bg-secondary border-border min-h-[90px] text-xs"
            />
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold text-xs h-10">
            Submit Feedback Review
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
