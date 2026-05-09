import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, Clock, Video, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { PatientProfile } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface AppointmentBookingProps {
  doctors: PatientProfile[];
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  onSuccess?: () => void;
}

export default function AppointmentBooking({ doctors, patientId, patientName, patientAvatar, onSuccess }: AppointmentBookingProps) {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'Telemedicine' | 'In-Person'>('Telemedicine');
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorId || !date || !time) {
      toast.error("Please fill in all fields.");
      return;
    }

    const doctor = doctors.find(d => d.uid === doctorId);
    if (!doctor) return;

    setIsBooking(true);
    try {
      // Create a combined Date object or just store strings for simplicity in this demo
      // Most production apps store them as Firestore Timestamps or ISO strings
      const appointmentDate = new Date(`${date}T${time}`);
      
      await addDoc(collection(db, "appointments"), {
        patientId,
        patientName,
        patientAvatar,
        doctorId,
        doctorName: doctor.name,
        doctorAvatar: doctor.avatar,
        specialty: doctor.specialty,
        date: appointmentDate.toISOString(),
        type,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      toast.success("Appointment scheduled successfully!");
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "appointments");
      toast.error("Failed to schedule appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-none shadow-sm bg-white overflow-hidden text-center py-12">
        <CardContent className="space-y-6">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Success!</h3>
            <p className="text-slate-500">Your appointment has been scheduled and is awaiting doctor confirmation.</p>
          </div>
          <Button variant="outline" className="rounded-xl" onClick={() => setIsSuccess(false)}>
            Book Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Schedule New Appointment</CardTitle>
        <CardDescription>Book a consultation with our certified specialists.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-900 ml-1">Select Specialist</Label>
              <Select onValueChange={setDoctorId} value={doctorId}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary/20">
                  <SelectValue placeholder="Choose a specialist..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.uid} value={doctor.uid}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 italic flex items-center justify-center text-[10px] text-slate-400">
                          {doctor.avatar ? <img src={doctor.avatar} /> : doctor.name.charAt(0)}
                        </div>
                        <span>{doctor.name} - {doctor.specialty || 'General'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-900 ml-1">Preferred Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-900 ml-1">Preferred Time</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-900 ml-1">Consultation Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('Telemedicine')}
                  className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all ${
                    type === 'Telemedicine' 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm font-bold">Telemedicine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('In-Person')}
                  className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all ${
                    type === 'In-Person' 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-bold">In-Person</span>
                </button>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isBooking}
            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25"
          >
            {isBooking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scheduling...
              </div>
            ) : "Schedule Appointment Now"}
          </Button>
          
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
            Secure HIPAA-compliant scheduling
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
