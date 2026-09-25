import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MeiLogo } from '@/components/MeiLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  hod: 'HOD & Management',
  staff: 'Staff & Faculty',
  organizer: 'Event Organizer',
  student: 'MEI Student',
  external: 'External Participant',
  volunteer: 'Volunteer Desk',
};

const defaultCredentials: Record<string, { id: string; name: string }> = {
  hod: { id: 'HOD-CSE-01', name: 'Dr. K. Ramesh' },
  staff: { id: 'STF-CS-04', name: 'Dr. S. Anand' },
  organizer: { id: 'ORG-EV-2026', name: 'Prof. Anitha R (Organizer)' },
  student: { id: '22CS001', name: 'Abishek R' },
  external: { id: 'EXT-GUEST-09', name: 'Karthik V' },
  volunteer: { id: '23CS041', name: 'Priya M' },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile, loginWithGoogle, setUserRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const def = defaultCredentials[role || 'student'] || { id: '22CS001', name: 'User' };

  const [id, setId] = useState(def.id);
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState(def.name);

  const activeRole = (role as UserProfile['role']) || 'student';

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(activeRole);
      toast.success(`Signed in successfully with Google as ${roleLabels[activeRole] || activeRole}`);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      console.error(err);
      toast.error('Google Sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await setUserRole(activeRole, { institutionalId: id, department: 'Computer Science' });
    }
    toast.success(`Logged in as ${roleLabels[activeRole] || activeRole}`);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative py-12">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Portals
      </button>

      <div className="gradient-card border border-border rounded-2xl p-8 w-full max-w-md animate-slide-up shadow-xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-2 flex items-center justify-center p-1">
            <MeiLogo className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-primary">
            {roleLabels[role || ''] || 'Institutional Login'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isRegister ? 'Register your account on EventHub' : 'Sign in to access your role dashboard'}
          </p>
        </div>

        {/* Current logged in banner if already authenticated with Firebase */}
        {currentUser && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center gap-3 text-xs">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-9 h-9 rounded-full border border-primary/40 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{currentUser.displayName || currentUser.email}</p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
              <div className="flex items-center gap-1 text-[10px] text-primary mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Connected with Firebase Auth
              </div>
            </div>
          </div>
        )}

        {/* Google Sign In Button */}
        <div>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            variant="outline"
            className="w-full border-border hover:bg-secondary/70 flex items-center justify-center gap-3 py-5 text-xs font-semibold relative shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google Account'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">or campus credentials</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-secondary border-border"
                required
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="id" className="text-xs">Institutional ID / Roll Number</Label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. 22CS001 or Faculty ID"
              className="bg-secondary border-border"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-secondary border-border"
              required
            />
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold text-xs mt-2">
            {isRegister ? (
              <><UserPlus className="w-4 h-4 mr-2" /> Register Account</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" /> Enter {roleLabels[role || ''] || 'Dashboard'}</>
            )}
          </Button>
        </form>

        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-xs text-muted-foreground">
            {isRegister ? 'Already registered?' : 'New student or faculty?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-primary hover:underline font-semibold"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        <div className="pt-2 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground/80 font-medium">
            © 2026 MEI EventHub — Mahendra Educational Institutions. All Rights Reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/60 font-mono">
            Version 2.4.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
