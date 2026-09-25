import { developers } from '@/data/mockData';
import { Code2 } from 'lucide-react';

const Developers = () => (
  <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
    <h2 className="text-3xl font-heading font-bold text-primary text-glow">Developers</h2>
    <p className="text-muted-foreground">The team behind MEI EventHub</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {developers.map((dev, i) => (
        <div
          key={dev.name}
          className="gradient-card border border-border rounded-xl p-5 flex items-center gap-4
                     hover:border-primary/40 hover:glow-teal transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
        >
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">{dev.name}</h3>
            <p className="text-sm text-muted-foreground">{dev.dept}</p>
            <p className="text-xs text-muted-foreground">{dev.college} — Batch {dev.batch}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Developers;
