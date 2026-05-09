import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ClipboardCheck, GraduationCap, Building, Loader2, Send } from "lucide-react";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function DoctorOnboarding() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialty: '',
    experience: '',
    bio: '',
    licenseNumber: '',
    hospitalAffiliation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        onboardingCompleted: true, // They finished the SUBMISSION state
        isConfirmed: false, // But they still need to be confirmed by admin
        rating: 5.0, // Initial rating
        updatedAt: new Date().toISOString()
      });
      toast.success("Credentials submitted! Our verification team will review your profile shortly.");
    } catch (error) {
      console.error('Error submitting credentials:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Stethoscope className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-slate-900">Professional Verification</h1>
            <p className="text-slate-500 max-w-xl">
              To ensure patient safety, all specialists must undergo clinical verification. 
              Please provide your professional credentials to join the VitalPoint network.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-xl">Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Specialty</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="e.g. Cardiologist" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Experience (Years)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="e.g. 12" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Medical License Number</Label>
                  <div className="relative">
                    <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="e.g. ML-998877" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hospital Affiliation</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="e.g. Central Health Research" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl"
                      value={formData.hospitalAffiliation}
                      onChange={(e) => setFormData({...formData, hospitalAffiliation: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Bio</Label>
                <textarea 
                  placeholder="Describe your medical philosophy and clinical background..." 
                  className="flex min-h-[150px] w-full rounded-xl border-none bg-slate-50 p-4 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="border-none shadow-lg bg-primary text-white p-6">
              <h4 className="font-serif font-bold text-xl mb-4">Verification Steps</h4>
              <ul className="space-y-4">
                {[
                  "Submit Credentials",
                  "Background Verification",
                  "Clinical License Validation",
                  "System Onboarding"
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <span className="opacity-90">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-white text-primary border-2 border-primary/20 hover:bg-slate-50 transition-all font-bold text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Documents...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Request Verification
                </div>
              )}
            </Button>
          </aside>
        </form>
      </motion.div>
    </div>
  );
}
