import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function RoleSelection() {
  const { profile, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRole = async (role: 'patient' | 'doctor') => {
    if (!profile) return;
    
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        role,
        onboardingCompleted: false, // Ensure they go to the specific setup screen next
        isConfirmed: false // Both start as unconfirmed until onboarding is done
      });
      toast.success(`Role selected: ${role}. Proceeding to setup...`);
    } catch (error) {
      console.error('Error setting role:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-slate-900">Welcome to VitalPoint</h1>
            <p className="text-slate-500 text-lg">Please select your primary role to customize your experience.</p>
          </div>
          <Button variant="ghost" onClick={logout} className="w-fit text-slate-400 hover:text-slate-600 px-0">
            Sign in with a different account
          </Button>
        </div>

        <div className="space-y-4">
          <Card 
            className={`cursor-pointer transition-all duration-300 border-2 hover:border-primary/50 group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => selectRole('patient')}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                <User className="w-6 h-6 text-blue-600 group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">I am a Patient</CardTitle>
                <CardDescription>Book appointments and access your medical records.</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 border-2 hover:border-primary/50 group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => selectRole('doctor')}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                <Stethoscope className="w-6 h-6 text-emerald-600 group-hover:text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">I am a Doctor</CardTitle>
                <CardDescription>Join our network of specialists. (Requires admin verification)</CardDescription>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </CardHeader>
          </Card>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up your profile...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
