import { motion } from "motion/react";
import { User, Mail, Shield, Activity, Edit2, Camera, Calendar, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";

interface ProfileViewProps {
  profile: any;
  onLogout: () => void;
}

export default function ProfileView({ profile, onLogout }: ProfileViewProps) {
  const { user } = useAuth();

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="relative h-48 bg-slate-100 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20" />
        <div className="absolute -bottom-12 left-10 flex items-end gap-6">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-primary/5">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback>{(profile?.name || user?.displayName || "U").charAt(0)}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-500 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="pb-14">
            <h2 className="text-3xl font-serif font-bold text-slate-900">{profile?.name || user?.displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="rounded-full bg-white/50 border-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                {profile?.role?.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Joined April 2024</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-6 right-6 rounded-xl bg-white/50 backdrop-blur-sm border-white/20"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-4">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-serif">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <Activity className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Blood Type</span>
                </div>
                <span className="font-bold text-slate-900">{profile?.bloodType || "O+"}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Shield className="w-4 h-4 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Verification</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-none rounded-full text-[10px] uppercase">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Last Checkup</span>
                </div>
                <span className="text-xs font-bold text-slate-900">2 weeks ago</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-14"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out Account
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="font-serif">Account Information</CardTitle>
              <CardDescription>Personal details and contact information linked to your health identity.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{profile?.name || user?.displayName}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biography / Primary Goal</p>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    {profile?.bio || profile?.medicalHistory || "Dedicated to maintaining a healthy lifestyle and staying proactive about wellness through PurePulse monitoring."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white pb-6">
              <CardTitle className="font-serif text-white">Advanced Medical Data</CardTitle>
              <CardDescription className="text-slate-400">Restricted information accessible only by your authorized physicians.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">Encrypted Records</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    All medical data points including allergens, chronic history, and biometric trends are encrypted end-to-end. Only you and your assigned specialists can decrypt this information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
