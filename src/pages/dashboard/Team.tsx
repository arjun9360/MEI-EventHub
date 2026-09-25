import { Users } from 'lucide-react';

const Team = () => (
  <div className="max-w-2xl mx-auto text-center py-20 animate-slide-up">
    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
      <Users className="w-10 h-10 text-primary-foreground" />
    </div>
    <h2 className="text-3xl font-heading font-bold text-primary text-glow mb-3">My Team</h2>
    <p className="text-muted-foreground text-lg">Coming Soon</p>
    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
      Connect with team members, share registration details, and collaborate for hackathons and group events.
    </p>
  </div>
);

export default Team;
