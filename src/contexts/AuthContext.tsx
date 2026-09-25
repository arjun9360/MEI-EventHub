import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'hod' | 'staff' | 'organizer' | 'student' | 'external' | 'volunteer';
  institutionalId?: string;
  department?: string;
  institution?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: (preferredRole?: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  setUserRole: (role: UserProfile['role'], extra?: { institutionalId?: string; department?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // New user registration in Firestore
            const initialRole = (sessionStorage.getItem('mei_preferred_role') as UserProfile['role']) || 'student';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Campus User',
              photoURL: firebaseUser.photoURL || '',
              role: initialRole,
              institutionalId: 'MEI-' + firebaseUser.uid.substring(0, 6).toUpperCase(),
              department: 'Computer Science',
              institution: 'MEC',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (preferredRole?: string): Promise<FirebaseUser> => {
    if (preferredRole) {
      sessionStorage.setItem('mei_preferred_role', preferredRole);
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (!snap.exists()) {
        const role = (preferredRole as UserProfile['role']) || 'student';
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Campus User',
          photoURL: user.photoURL || '',
          role,
          institutionalId: 'MEI-' + user.uid.substring(0, 6).toUpperCase(),
          department: 'Computer Science',
          institution: 'MEC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, profile);
        setUserProfile(profile);
      } else if (preferredRole && snap.data().role !== preferredRole) {
        await updateDoc(userDocRef, {
          role: preferredRole,
          updatedAt: new Date().toISOString(),
        });
        setUserProfile({
          ...(snap.data() as UserProfile),
          role: preferredRole as UserProfile['role'],
        });
      }
      return user;
    } catch (err) {
      console.error('Login with Google failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  };

  const setUserRole = async (
    role: UserProfile['role'],
    extra?: { institutionalId?: string; department?: string }
  ) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const updates: Partial<UserProfile> = {
      role,
      updatedAt: new Date().toISOString(),
      ...(extra?.institutionalId ? { institutionalId: extra.institutionalId } : {}),
      ...(extra?.department ? { department: extra.department } : {}),
    };
    try {
      await updateDoc(userDocRef, updates);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithGoogle,
        logout,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
