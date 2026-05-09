import { motion } from "motion/react";
import { Users, Heart, Video, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PatientProfile } from "../types";

interface ContactsViewProps {
  doctors: PatientProfile[];
  onInitiateCall: (user: PatientProfile) => void;
  onOpenChat: (user: PatientProfile) => void;
}

export default function ContactsView({
  doctors,
  onInitiateCall,
  onOpenChat
}: ContactsViewProps) {
  return (
    <motion.div
      key="doctors"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {doctors.length > 0 ? (
        doctors.map((doctor) => (
          <Card key={doctor.uid} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardHeader className="relative pb-0 pt-10">
              <div className="absolute top-0 left-0 w-full h-24 bg-slate-50">
                {doctor.avatar && <img src={doctor.avatar} className="w-full h-full object-cover blur-[2px] opacity-50" referrerPolicy="no-referrer" />}
              </div>
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg relative z-10">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {doctor.isOnline && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full z-20 animate-pulse" />
                )}
              </div>
              <div className="pt-2 text-center">
                <CardTitle className="text-xl font-serif">{doctor.name}</CardTitle>
                <CardDescription className="text-primary font-medium">{doctor.role === 'doctor' ? (doctor.specialty || "Certified Specialist") : "Patient User"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4 pt-4">
              <p className="text-sm text-slate-500 line-clamp-2 text-center">{doctor.bio || doctor.medicalHistory || "Registered user on the platform."}</p>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{doctor.role === 'doctor' ? 'Exp.' : 'Joined'}</p>
                  <p className="font-bold text-slate-900">{doctor.experience || "1"}{doctor.role === 'doctor' ? '+ y' : ''}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Rating</p>
                  <div className="flex items-center gap-1 justify-center">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <p className="font-bold text-slate-900">{doctor.rating || "5.0"}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Status</p>
                  <Badge variant="outline" className={`border-none ${doctor.isOnline ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                    {doctor.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => onOpenChat(doctor)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button 
                  className="flex-1 rounded-xl" 
                  onClick={() => onInitiateCall(doctor)}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-slate-900">No Users Found</h3>
            <p className="text-sm text-slate-500">We couldn't find any registered users at the moment.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
