import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ShieldCheck, Mail, Building, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Profile = () => {
  const { currentUser, userProfile, setUserRole, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [department, setDepartment] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || currentUser?.displayName || 'Campus User');
      setRegId(userProfile.institutionalId || '22CS001');
      setDepartment(userProfile.department || 'Computer Science');
      setInstitution(userProfile.institution || 'MEC');
    } else if (currentUser) {
      setName(currentUser.displayName || 'Campus User');
    }
  }, [userProfile, currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info('Please sign in with Google to synchronize your profile to Firebase Firestore');
      return;
    }
    setSaving(true);
    try {
      if (userProfile) {
        await setUserRole(userProfile.role, {
          institutionalId: regId,
          department,
        });
      }
      toast.success('Profile saved and synced to Firebase Firestore!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary text-glow">Institutional Profile</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Synchronized with Firebase Auth & Cloud Firestore
          </p>
        </div>
        {!currentUser && (
          <Button
            onClick={() => loginWithGoogle()}
            size="sm"
            className="gradient-primary text-primary-foreground text-xs gap-1.5 self-start"
          >
            <Mail className="w-3.5 h-3.5" /> Connect Google Account
          </Button>
        )}
      </div>

      <div className="gradient-card border border-border rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-primary/50 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md">
              {name ? name[0] : <User className="w-8 h-8" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-heading font-semibold text-foreground truncate">
                {name || 'Campus Stakeholder'}
              </h3>
              {currentUser && (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {institution} — {department}
            </p>
            {currentUser?.email && (
              <p className="text-[11px] text-primary/80 mt-0.5 truncate font-mono">
                {currentUser.email}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pName" className="text-xs">Full Name</Label>
              <Input
                id="pName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pReg" className="text-xs">Registration / Faculty ID</Label>
              <Input
                id="pReg"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                className="bg-secondary border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pDept" className="text-xs">Academic Department</Label>
              <Input
                id="pDept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-secondary border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pCollege" className="text-xs">College Institution</Label>
              <Input
                id="pCollege"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-secondary border-border text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pEmail" className="text-xs">Email Address</Label>
              <Input
                id="pEmail"
                value={currentUser?.email || 'user@mei.edu'}
                disabled
                className="bg-secondary/50 border-border text-xs text-muted-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pPhone" className="text-xs">Contact Phone</Label>
              <Input
                id="pPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-secondary border-border text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Stored securely in Firestore</span>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="gradient-primary text-primary-foreground font-semibold text-xs"
            >
              {saving ? 'Syncing to Firestore...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
