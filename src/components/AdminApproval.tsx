import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PatientProfile as PatientProfileType } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, Mail, UserCheck } from "lucide-react";
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function AdminApproval() {
  const [pendingDoctors, setPendingDoctors] = useState<PatientProfileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"), 
      where("role", "==", "doctor"), 
      where("isConfirmed", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctors = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as PatientProfileType[];
      setPendingDoctors(doctors);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "users (doctor query)");
    });

    return () => unsubscribe();
  }, []);

  const handleApproval = async (uid: string, approve: boolean) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      if (approve) {
        await updateDoc(userDocRef, { isConfirmed: true });
        toast.success("Doctor approved successfully.");
      } else {
        // Revert role to patient if rejected
        await updateDoc(userDocRef, { role: 'patient', onboardingCompleted: false });
        toast.info("Doctor registration rejected.");
      }
    } catch (error) {
      console.error('Error updating doctor status:', error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 italic">Loading pending registrations...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Credential Verification</h2>
          <p className="text-sm text-slate-500">Review and verify medical specialist registrations.</p>
        </div>
      </div>

      {pendingDoctors.length === 0 ? (
        <Card className="border-none shadow-sm bg-white/50 border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <UserCheck className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-medium">No pending doctor registrations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingDoctors.map((doctor) => (
            <Card key={doctor.uid} className="border-none shadow-lg bg-white overflow-hidden group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Avatar className="w-16 h-16 border-2 border-primary/10">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">{doctor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {doctor.email}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-2">
                  <p><span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Specialty</span> {doctor.specialty || 'General Physician'}</p>
                  <p><span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Experience</span> {doctor.experience || 'N/A'} years</p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
                    onClick={() => handleApproval(doctor.uid, true)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => handleApproval(doctor.uid, false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
