import { motion } from "motion/react";
import { Heart, Zap, Moon, Activity, Calendar, Wind, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AmbientSensor from "./AmbientSensor";
import { MOCK_HEALTH_DATA } from "../constants";
import { useAuth } from "../context/AuthContext";
import { PatientProfile, Appointment } from "../types";

interface DashboardViewProps {
  profile: any;
  globalAqi: number;
  setGlobalAqi: (aqi: number) => void;
  appointments: Appointment[];
  doctors: PatientProfile[];
  onNavigate: (tab: string) => void;
  onNewAppointment: () => void;
  onInitiateCall: (user: PatientProfile) => void;
}

export default function DashboardView({ 
  profile, 
  globalAqi, 
  setGlobalAqi,
  appointments, 
  doctors, 
  onNavigate, 
  onNewAppointment,
  onInitiateCall
}: DashboardViewProps) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
            Good morning, {(profile?.name || user?.displayName || "").split(' ')[0]}
          </h1>
          <p className="text-slate-500 flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-500" />
            Air Quality is <span className={`font-semibold ${globalAqi <= 50 ? "text-emerald-600" : "text-amber-600"}`}>
              {globalAqi <= 50 ? "Good" : "Moderate"} ({globalAqi} AQI)
            </span> in your area.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full px-6">
              <Search className="w-4 h-4 mr-2" />
              Search Records
            </Button>
            <Button 
              onClick={onNewAppointment}
              className="rounded-full px-6 shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-rose-50 rounded-lg">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">Heart Rate</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">72</span>
                  <span className="text-sm text-slate-400">bpm</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">Activity</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">8.4k</span>
                  <span className="text-sm text-slate-400">steps</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-500">Sleep</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">7.2</span>
                  <span className="text-sm text-slate-400">hours</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div>
                 <CardTitle className="text-xl font-serif">Activity Insights</CardTitle>
                 <p className="text-sm text-slate-500">Your health indicators over the last 24 hours.</p>
               </div>
               <Badge variant="outline" className="rounded-full px-4 border-slate-100">Weekly View</Badge>
            </CardHeader>
            <CardContent className="h-[300px] p-0 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HEALTH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <AmbientSensor globalAqi={globalAqi} />
          
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Upcoming</CardTitle>
              <button onClick={() => onNavigate("appointments")} className="text-xs text-primary font-bold hover:underline">See All</button>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments.slice(0, 2).map((app) => (
                  <div key={app.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-center min-w-[50px] group-hover:scale-105 transition-transform">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {new Date(app.date).toLocaleDateString(undefined, { month: 'short' })}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {new Date(app.date).toLocaleDateString(undefined, { day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{app.doctorName || app.patientName}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">{app.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-3 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Calendar className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500">No appointments scheduled</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-lg"
                    onClick={onNewAppointment}
                  >
                    Book Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
