import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Droplets, AlertCircle, History, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function PatientOnboarding() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    bloodType: '',
    allergies: '',
    medicalHistory: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        ...formData,
        age: parseInt(formData.age) || null,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a !== ''),
        onboardingCompleted: true,
        isConfirmed: true, // Patients are auto-confirmed after onboarding
        updatedAt: new Date().toISOString()
      });
      toast.success("Profile setup complete! Welcome to VitalPoint.");
    } catch (error) {
      console.error('Error during onboarding:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Personalize Your Care</h1>
          <p className="text-slate-500 max-w-md mx-auto">Help our specialists provide better care by completing your medical profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-serif">Basic Information</CardTitle>
              <CardDescription>Essential details for your medical identification.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Age</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="e.g. 28" 
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Blood Type</Label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Select 
                      value={formData.bloodType} 
                      onValueChange={(val) => setFormData({...formData, bloodType: val})}
                    >
                      <SelectTrigger className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-primary">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Allergies (Comma separated)
                </Label>
                <Input 
                  placeholder="e.g. Peanuts, Penicillin, Latex" 
                  className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Medical History Summary
                </Label>
                <textarea 
                  placeholder="Tell us about any past surgeries, chronic conditions, or medications you're currently taking..." 
                  className="flex min-h-[150px] w-full rounded-xl border-none bg-slate-50 p-4 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing your experience...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Complete Setup
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
