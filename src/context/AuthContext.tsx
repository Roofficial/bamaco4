import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout, loginWithEmail, signupWithEmail } from '../firebase';
import { PatientProfile as PatientProfileType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

import LoadingScreen from '../components/LoadingScreen';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: PatientProfileType | null;
  loading: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  signupEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<PatientProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLoginEmail = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
  };

  const handleSignupEmail = async (email: string, pass: string) => {
    await signupWithEmail(email, pass);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listen for profile changes
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as PatientProfileType);
          } else {
            // Initial profile creation if not exists
            const isAdmin = currentUser.email === 'ronnexpro65@gmail.com';
            const initialProfile: any = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
              email: currentUser.email || '',
              role: isAdmin ? 'admin' : 'patient',
              onboardingCompleted: isAdmin,
              isConfirmed: isAdmin,
              avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
              bloodType: 'O+',
              allergies: [],
              medicalHistory: isAdmin ? 'System Administrator profile.' : 'New patient profile initialized.'
            };
            setDoc(userDocRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`));
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login: loginWithGoogle, 
      loginEmail: handleLoginEmail,
      signupEmail: handleSignupEmail,
      logout 
    }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
