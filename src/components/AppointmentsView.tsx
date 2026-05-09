import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Video, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppointmentBooking from "./AppointmentBooking";
import { PatientProfile, Appointment } from "../types";

interface AppointmentsViewProps {
  profile: any;
  appointments: Appointment[];
  doctors: PatientProfile[];
  user: any;
  isBookingNew: boolean;
  setIsBookingNew: (val: boolean) => void;
  onUpdateStatus: (appointmentId: string, newStatus: string) => void;
  onJoinCall: (appointment: Appointment) => void;
}

export default function AppointmentsView({
  profile,
  appointments,
  doctors,
  user,
  isBookingNew,
  setIsBookingNew,
  onUpdateStatus,
  onJoinCall
}: AppointmentsViewProps) {
  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Your Appointments</h2>
          <p className="text-sm text-slate-500">Manage your upcoming and past consultations.</p>
        </div>
        {profile?.role === 'patient' && (
          <Button 
            onClick={() => setIsBookingNew(!isBookingNew)}
            className="rounded-xl px-6 bg-primary shadow-lg shadow-primary/20"
          >
            {isBookingNew ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Schedule New
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isBookingNew && profile?.role === 'patient' ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AppointmentBooking 
              doctors={doctors.filter(u => u.role === 'doctor')}
              patientId={user.uid}
              patientName={profile?.name || user?.displayName || "Patient"}
              patientAvatar={profile?.avatar}
              onSuccess={() => setIsBookingNew(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="appointments-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <Card key={app.id} className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Badge className={`${
                        app.status === 'confirmed' ? "bg-emerald-100 text-emerald-600" :
                        app.status === 'pending' ? "bg-amber-100 text-amber-600" :
                        app.status === 'completed' ? "bg-blue-100 text-blue-600" :
                        "bg-rose-100 text-rose-600"
                      } border-none text-[10px] uppercase font-bold tracking-wider`}>
                        {app.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {app.type === 'Telemedicine' ? <Video className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {app.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/5">
                        <AvatarImage src={profile?.role === 'doctor' ? app.patientAvatar : app.doctorAvatar} />
                        <AvatarFallback>{(profile?.role === 'doctor' ? app.patientName : app.doctorName).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-serif">{profile?.role === 'doctor' ? app.patientName : app.doctorName}</CardTitle>
                        <CardDescription>{profile?.role === 'doctor' ? "Patient" : (app.specialty || "Specialist")}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {app.status === 'confirmed' && app.type === 'Telemedicine' && (
                      <Button 
                        onClick={() => onJoinCall(app)}
                        className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Consultation
                      </Button>
                    )}

                    {(app.status === 'pending' || app.status === 'confirmed') && profile?.role === 'patient' && (
                      <Button 
                        variant="ghost" 
                        className="w-full rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                        onClick={() => onUpdateStatus(app.id, 'cancelled')}
                      >
                        Cancel Appointment
                      </Button>
                    )}
                    
                    {app.status === 'pending' && profile?.role === 'doctor' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50"
                          onClick={() => onUpdateStatus(app.id, 'cancelled')}
                        >
                          Reject
                        </Button>
                        <Button 
                          className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
                          onClick={() => onUpdateStatus(app.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-slate-900">No Appointments</h3>
                  <p className="text-sm text-slate-500">You don't have any scheduled consultations at the moment.</p>
                </div>
                {profile?.role === 'patient' && (
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setIsBookingNew(true)}
                  >
                    Book Your First One
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
