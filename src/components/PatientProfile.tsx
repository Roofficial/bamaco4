import { PatientProfile as PatientProfileType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Droplets, AlertCircle, History, Shield, Mail } from "lucide-react";
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface PatientProfileProps {
  profile: PatientProfileType;
}

export default function PatientProfile({ profile }: PatientProfileProps) {
  const handleSetRole = async (role: 'patient' | 'doctor') => {
    try {
      const userDocRef = doc(db, "users", profile.uid);
      if (role === 'patient') {
        await updateDoc(userDocRef, { 
          role: 'patient',
          onboardingCompleted: true,
          isConfirmed: true 
        });
      } else {
        await updateDoc(userDocRef, { 
          role: 'doctor',
          onboardingCompleted: true,
          isConfirmed: true,
          specialty: 'General Physician',
          experience: 10,
          rating: 5.0,
          bio: 'I am a certified medical professional dedicated to digital health.'
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-none shadow-lg bg-white/50 backdrop-blur-md">
      <CardHeader className="bg-primary/5 pb-8">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-2 ring-primary/5">
            <AvatarImage src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-3xl font-serif font-bold text-primary">{profile.name}</CardTitle>
              <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[10px] uppercase tracking-wider">
                {profile.role}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {profile.email}
              </span>
              <div className="flex items-center gap-4 mt-1">
                {profile.age && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {profile.age} years old
                  </span>
                )}
                {profile.bloodType && (
                  <span className="flex items-center gap-1 text-red-500 font-semibold">
                    <Droplets className="w-4 h-4" />
                    Type {profile.bloodType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3>Allergies & Sensitivities</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((allergy) => (
                <Badge key={allergy} variant="destructive" className="px-3 py-1 text-sm">
                  {allergy}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground italic text-sm">No known allergies recorded</span>
            )}
          </div>
        </section>

        <Separator className="bg-primary/10" />

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <History className="w-5 h-5" />
            <h3>Medical History</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border border-primary/5 italic uppercase tracking-tighter">
            {profile.role === 'patient' ? "Professional Summary" : "Professional Bio"}
          </p>
          <p className="text-muted-foreground leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {profile.medicalHistory || profile.bio || "No summary available."}
          </p>
        </section>
        
        {profile.role === 'admin' && (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Administrative Control Panel</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white"
                onClick={() => handleSetRole('patient')}
              >
                Set as Patient
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white"
                onClick={() => handleSetRole('doctor')}
              >
                Set as Doctor
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

