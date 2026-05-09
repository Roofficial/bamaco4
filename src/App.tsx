import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu,
  ChevronLeft,
  Activity, 
  Calendar, 
  Stethoscope, 
  User, 
  Wind, 
  Shield, 
  Bell, 
  Search,
  Plus,
  ChevronRight,
  Heart,
  Zap,
  Moon,
  Video,
  Users,
  MessageSquare
} from "lucide-react";

import DashboardView from "./components/DashboardView";
import AppointmentsView from "./components/AppointmentsView";
import ContactsView from "./components/ContactsView";
import ChatView from "./components/ChatView";
import ProfileView from "./components/ProfileView";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { LogIn, LogOut, Lock, Phone, X, PhoneCall, PhoneOff } from "lucide-react";
import io from "socket.io-client";

import AmbientSensor from "./components/AmbientSensor";
import PatientProfile from "./components/PatientProfile";
import ConsultationRoom from "./components/ConsultationRoom";
import RoleSelection from "./components/RoleSelection";
import PendingApproval from "./components/PendingApproval";
import AdminDashboard from "./components/AdminDashboard";
import AuthScreen from "./components/AuthScreen";
import LoadingScreen from "./components/LoadingScreen";
import LandingPage from "./components/LandingPage";
import PatientOnboarding from "./components/PatientOnboarding";
import DoctorOnboarding from "./components/DoctorOnboarding";
import AppointmentBooking from "./components/AppointmentBooking";
import { MOCK_HEALTH_DATA } from "./constants";
import { analyzeSymptoms, getHealthInsights } from "./services/geminiService";
import { PatientProfile as PatientProfileType, Appointment } from "./types";
import { useAuth } from "./context/AuthContext";
import { handleFirestoreError, OperationType } from "./lib/firestore-errors";

export default function App() {
  const { user, profile, login, logout, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const isConsultingRef = useRef(isConsulting);
  useEffect(() => { isConsultingRef.current = isConsulting; }, [isConsulting]);
  const [doctors, setDoctors] = useState<PatientProfileType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isBookingNew, setIsBookingNew] = useState(false);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'incoming' | 'in-call' | 'ended'>('idle');
  const callStateRef = useRef(callState);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  const [currentConsultation, setCurrentConsultation] = useState<any>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const currentCallIdRef = useRef(currentCallId);
  useEffect(() => { currentCallIdRef.current = currentCallId; }, [currentCallId]);

  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [globalAqi, setGlobalAqi] = useState(42);
  const [selectedChatContact, setSelectedChatContact] = useState<PatientProfileType | undefined>(undefined);
  const socketRef = useRef<any>(null);

  const [incomingCall, setIncomingCall] = useState<any>(null);
  const incomingCallRef = useRef(incomingCall);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io();

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register-user", user.uid);
      console.log("Socket connected and registered:", user.uid);
      // Update online status
      updateDoc(doc(db, "users", user.uid), { isOnline: true }).catch((error) => {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      updateDoc(doc(db, "users", user.uid), { isOnline: false }).catch((error) => {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      });
    });

    socketRef.current.on("incoming-call", (data: any) => {
      // If already in a call, we still show the notification but don't force full screen unless they switch
      if (isConsultingRef.current) {
        toast.info(`New Incoming Consultation from ${data.fromUserName}`, {
          description: "Click to switch calls (Current call will end)",
          action: {
            label: "Switch",
            onClick: () => {
              setIncomingCall(data);
              setCurrentCallId(data.callId);
              setCallState('incoming');
            }
          },
          duration: 10000
        });
      } else {
        setIncomingCall(data);
        setCurrentCallId(data.callId);
        setCallState('incoming');
        // We removed the toast here as we'll show a full-screen overlay
      }
    });

    socketRef.current.on("call-response", (data: any) => {
      if (data.accepted) {
        toast.success("Call accepted! Connecting...");
        setCallState('in-call');
        setCallStartTime(Date.now());
        setIsConsulting(true);
      } else {
        toast.error("Call declined or user is busy.");
        setCallState('idle');
        setOutgoingCall(null);
        setCurrentConsultation(null);
        // If they declined, update record to 'declined' (already handled in rejectCall but good to be sure)
      }
    });

    socketRef.current.on("call-cancelled", async () => {
      // If we were in 'incoming' state, this means we missed the call
      if (callStateRef.current === 'incoming' && currentCallIdRef.current) {
        try {
          await updateDoc(doc(db, "calls", currentCallIdRef.current), {
            status: "missed"
          });
          toast.error("Missed call from " + incomingCallRef.current?.fromUserName);
        } catch (e) {
          console.error("Error updating missed call status:", e);
        }
      } else {
        toast.info("Call cancelled by the other user.");
      }
      setCallState('idle');
      setIncomingCall(null);
      setOutgoingCall(null);
      setCurrentCallId(null);
    });

    const q = query(collection(db, "users"), where("onboardingCompleted", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          ...doc.data()
        }))
        .filter(u => u.uid !== user.uid) as PatientProfileType[];
      setDoctors(usersList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "users (contacts query)");
    });

    // Fetch call logs for notifications
    const logsQuery = query(
      collection(db, "calls"),
      where("recipientId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCallLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "calls (logs query)");
    });

    // Fetch appointments
    const appointmentsQuery = profile?.role === 'doctor' 
      ? query(collection(db, "appointments"), where("doctorId", "==", user.uid), orderBy("date", "asc"))
      : query(collection(db, "appointments"), where("patientId", "==", user.uid), orderBy("date", "asc"));

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      setAppointments(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "appointments");
    });

    return () => {
      unsubscribe();
      unsubLogs();
      unsubAppointments();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  if (loading) return <LoadingScreen />;

  if (!user) {
    if (showAuth) {
      return <AuthScreen onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Onboarding & Approval Flow
  if (profile && !profile.role) {
    return <RoleSelection />;
  }

  if (profile && !profile.onboardingCompleted) {
    if (profile.role === 'patient') return <PatientOnboarding />;
    if (profile.role === 'doctor') return <DoctorOnboarding />;
  }

  if (profile?.role === 'doctor' && !profile.isConfirmed) {
    return <PendingApproval />;
  }

  const handleSymptomCheck = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms first.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptoms(symptoms, profile?.medicalHistory || "");
      setAnalysis(result);
      toast.success("AI Analysis complete.");
    } catch (error) {
      toast.error("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initiateCall = async (targetUser: PatientProfileType) => {
    const roomId = `room-${user?.uid}-${targetUser.uid}`;
    setOutgoingCall(targetUser);
    setCallState('calling');
    setCurrentConsultation({
      roomId,
      doctorName: targetUser.name,
      doctorUid: targetUser.uid
    });
    
    let callId = "";
    // Log call initiation to Firestore
    try {
      const docRef = await addDoc(collection(db, "calls"), {
        initiatorId: user?.uid,
        initiatorName: profile?.name || user?.displayName || "User",
        recipientId: targetUser.uid,
        recipientName: targetUser.name,
        status: "initiated",
        timestamp: serverTimestamp(),
        roomId
      });
      callId = docRef.id;
      setCurrentCallId(callId);
    } catch (e) {
      console.error("Error logging call:", e);
    }
    
    if (socketRef.current) {
      socketRef.current.emit("initiate-call", {
        toUserId: targetUser.uid,
        fromUserName: profile?.name || user?.displayName || "User",
        fromUserId: user?.uid,
        roomId,
        callId
      });
    }

    toast.info(`Calling ${targetUser.name}...`);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    
    if (socketRef.current) {
      socketRef.current.emit("respond-call", {
        toUserId: incomingCall.fromUserId,
        accepted: true,
        roomId: incomingCall.roomId,
        callId: incomingCall.callId
      });
    }

    // Update log status
    if (incomingCall.callId) {
      try {
        await updateDoc(doc(db, "calls", incomingCall.callId), {
          status: "accepted"
        });
      } catch (e) {
        console.error("Error updating log:", e);
      }
    }
    
    setCurrentConsultation({
      roomId: incomingCall.roomId,
      doctorName: incomingCall.fromUserName,
      doctorUid: incomingCall.fromUserId
    });
    
    setCallState('in-call');
    setCallStartTime(Date.now());
    setIncomingCall(null);
    setIsConsulting(true);
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    
    if (socketRef.current) {
      socketRef.current.emit("respond-call", {
        toUserId: incomingCall.fromUserId,
        accepted: false,
        roomId: incomingCall.roomId,
        callId: incomingCall.callId
      });
    }
    
    // Update log status
    if (incomingCall.callId) {
      try {
        await updateDoc(doc(db, "calls", incomingCall.callId), {
          status: "rejected"
        });
      } catch (e) {
        console.error("Error updating log:", e);
      }
    }

    setCallState('idle');
    setIncomingCall(null);
  };

  const cancelOutgoingCall = async () => {
    if (outgoingCall) {
      if (socketRef.current) {
        socketRef.current.emit("cancel-call", { toUserId: outgoingCall.uid });
      }
      
      // Update log status
      if (currentCallId) {
        try {
          await updateDoc(doc(db, "calls", currentCallId), {
            status: "cancelled"
          });
        } catch (e) {
          console.error("Error updating log:", e);
        }
      }
    }
    setCallState('idle');
    setOutgoingCall(null);
    setCurrentConsultation(null);
    setCurrentCallId(null);
  };

  const handleUpdateAppointmentStatus = async (appId: string, status: string) => {
    try {
      await updateDoc(doc(db, "appointments", appId), { status });
      toast.success(`Appointment ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${appId}`);
      toast.error("Failed to update appointment status");
    }
  };

  const handleJoinAppointmentCall = (app: Appointment) => {
    const targetUserId = profile?.role === 'doctor' ? app.patientId : app.doctorId;
    const targetUserName = profile?.role === 'doctor' ? app.patientName : app.doctorName;
    const targetAvatar = profile?.role === 'doctor' ? app.patientAvatar : app.doctorAvatar;

    initiateCall({
      uid: targetUserId,
      name: targetUserName,
      avatar: targetAvatar
    } as any);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <Toaster position="top-center" />

      {/* Outgoing Call Overlay */}
      <AnimatePresence>
        {callState === 'calling' && outgoingCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-sm w-full">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse scale-125" />
                <Avatar className="w-40 h-40 mx-auto ring-8 ring-white/10 relative z-10">
                  <AvatarImage src={outgoingCall.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${outgoingCall.name}`} />
                  <AvatarFallback>{outgoingCall.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-white">Calling {outgoingCall.name}</h2>
                <p className="text-primary-foreground/60 animate-pulse">Waiting for answer...</p>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={cancelOutgoingCall}
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full w-20 h-20 shadow-2xl shadow-destructive/40 hover:scale-110 transition-transform flex flex-col gap-1"
                >
                  <PhoneOff className="w-8 h-8" />
                  <span className="text-[10px] font-bold">CANCEL</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Call Overlay - FULL SCREEN */}
      <AnimatePresence>
        {callState === 'incoming' && incomingCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] bg-emerald-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-sm w-full">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-150" />
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse scale-125" />
                <Avatar className="w-40 h-40 mx-auto ring-8 ring-white/10 relative z-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.fromUserName}`} />
                  <AvatarFallback>{incomingCall.fromUserName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-white">Incoming Call</h2>
                <h3 className="text-xl text-primary-foreground/80">{incomingCall.fromUserName}</h3>
                <p className="text-emerald-400 animate-pulse font-medium tracking-widest text-xs">IS CALLING YOU</p>
              </div>
              
              <div className="flex gap-8 justify-center pt-8">
                <Button 
                  onClick={rejectCall}
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full w-20 h-20 shadow-2xl shadow-destructive/40 hover:scale-110 transition-transform flex flex-col gap-1"
                >
                  <PhoneOff className="w-8 h-8" />
                  <span className="text-[10px] font-bold">DECLINE</span>
                </Button>
                <Button 
                  onClick={acceptCall}
                  className="rounded-full w-20 h-20 bg-emerald-500 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-transform flex flex-col gap-1 border-none"
                >
                  <PhoneCall className="w-8 h-8 text-white" />
                  <span className="text-[10px] font-bold text-white">ACCEPT</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar / Navigation Rail */}
      <motion.nav 
        initial={false}
        animate={{ width: isSidebarCollapsed ? "80px" : "240px" }}
        className="fixed left-0 top-0 h-full bg-white border-r border-slate-200 flex flex-col py-8 z-50 overflow-hidden shadow-sm"
      >
        <div className="flex items-center px-4 mb-10 overflow-hidden min-h-[48px]">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-4"
            >
              <h2 className="text-xl font-serif font-bold text-primary tracking-tight">PurePulse</h2>
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 px-4">
          {[
            { id: "dashboard", icon: Activity, label: "Dashboard" },
            { id: "appointments", icon: Calendar, label: "Appointments" },
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "doctors", icon: Users, label: "Contacts" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? "text-white" : "group-hover:text-primary"}`} />
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-4 font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
          
          {profile?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab("admin")}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                activeTab === "admin" 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <Shield className={`w-5 h-5 shrink-0 ${activeTab === "admin" ? "text-white" : "group-hover:text-primary"}`} />
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-4 font-medium whitespace-nowrap"
                >
                  Admin
                </motion.span>
              )}
            </button>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 px-4">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center p-3 rounded-xl transition-all duration-200 relative group ${
              showNotifications ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
            }`}
          >
            <Bell className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-4 font-medium whitespace-nowrap"
              >
                Notifications
              </motion.span>
            )}
            {callLogs.length > 0 && (
              <span className={`absolute top-2 ${isSidebarCollapsed ? 'right-2' : 'left-6'} w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white`}>
                {callLogs.length}
              </span>
            )}
          </button>
          <button 
            onClick={logout}
            className="flex items-center p-3 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-4 font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </button>
          
          <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <Avatar className="w-10 h-10 border-2 border-slate-100 ring-2 ring-primary/5 shadow-sm">
              <AvatarImage src={profile?.avatar || user?.photoURL || ""} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 overflow-hidden"
              >
                <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{profile?.name || user?.displayName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{profile?.role || 'Patient'}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-24 top-20 bottom-8 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[49] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-slate-900 border-none">Notifications</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {callLogs.length > 0 ? (
                  callLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                      <div className="flex gap-4 items-start">
                        <div className={`p-2 rounded-xl mx-0 ${
                          log.status === 'accepted' ? 'bg-emerald-100/50 text-emerald-600' : 
                          log.status === 'rejected' || log.status === 'cancelled' ? 'bg-rose-100/50 text-rose-600' :
                          'bg-slate-200/50 text-slate-400'
                        }`}>
                          {log.status === 'accepted' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {log.initiatorId === user?.uid ? `Call to ${log.recipientName}` : `Call from ${log.initiatorName}`}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                              log.status === 'accepted' ? 'text-emerald-500' : 
                              log.status === 'missed' ? 'text-rose-500' : 'text-slate-400'
                            }`}>
                              {log.status === 'initiated' ? 'Missed' : log.status}
                            </p>
                            {(log.status === 'missed' || log.status === 'rejected' || log.status === 'cancelled' || (log.status === 'initiated' && log.recipientId === user.uid)) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/5"
                                onClick={() => {
                                  // Call back the person
                                  const targetId = log.initiatorId === user.uid ? log.recipientId : log.initiatorId;
                                  const targetName = log.initiatorId === user.uid ? log.recipientName : log.initiatorName;
                                  initiateCall({ uid: targetId, name: targetName } as any);
                                  setShowNotifications(false);
                                }}
                              >
                                <PhoneCall className="w-3 h-3 mr-1" />
                                CALL BACK
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-sm font-medium text-slate-400">No new notifications</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        initial={false}
        animate={{ paddingLeft: isSidebarCollapsed ? "80px" : "240px" }}
        className="min-h-screen transition-all duration-300"
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 hidden md:block uppercase tracking-tight">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search health records, doctors..." 
                className="bg-transparent border-none text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none w-64"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-slate-900 leading-none">{profile?.name || user?.displayName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{profile?.role || 'Patient'}</span>
              </div>
              <Avatar className="w-10 h-10 border-2 border-white ring-2 ring-primary/5">
                <AvatarImage src={profile?.avatar || user?.photoURL || ""} />
                <AvatarFallback>{(profile?.name || user?.displayName || "U").charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <DashboardView 
                profile={profile}
                globalAqi={globalAqi}
                setGlobalAqi={setGlobalAqi}
                appointments={appointments}
                doctors={doctors}
                onNavigate={(tab) => setActiveTab(tab)}
                onNewAppointment={() => {
                  setActiveTab("appointments");
                  setIsBookingNew(true);
                }}
                onInitiateCall={initiateCall}
              />
            )}

            {activeTab === "appointments" && (
              <AppointmentsView 
                profile={profile}
                appointments={appointments}
                doctors={doctors}
                user={user}
                isBookingNew={isBookingNew}
                setIsBookingNew={setIsBookingNew}
                onUpdateStatus={handleUpdateAppointmentStatus}
                onJoinCall={handleJoinAppointmentCall}
              />
            )}

            {activeTab === "messages" && (
              <ChatView 
                onInitiateCall={initiateCall}
                selectedContact={selectedChatContact}
                allUsers={doctors}
              />
            )}

            {activeTab === "doctors" && (
              <ContactsView 
                doctors={doctors}
                onInitiateCall={initiateCall}
                onOpenChat={(doctor) => {
                  setSelectedChatContact(doctor);
                  setActiveTab("messages");
                }}
              />
            )}

            {activeTab === "profile" && (
              <ProfileView 
                profile={profile}
                onLogout={logout}
              />
            )}

            {activeTab === "admin" && profile?.role === "admin" && (
              <AdminDashboard />
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      {isConsulting && currentConsultation && (
        <ConsultationRoom
          socket={socketRef.current}
          roomId={currentConsultation.roomId}
          userName={profile?.name || user?.displayName || "Patient"}
          doctorName={currentConsultation.doctorName}
          callId={currentCallId}
          onClose={async () => {
            if (currentCallId && callStartTime) {
              const duration = Math.floor((Date.now() - callStartTime) / 1000);
              try {
                await updateDoc(doc(db, "calls", currentCallId), {
                  status: "completed",
                  duration
                });
              } catch (e) {
                console.error("Error finalizing call log:", e);
              }
            }
            setIsConsulting(false);
            setCallState('ended');
            setTimeout(() => setCallState('idle'), 3000);
            setCurrentConsultation(null);
            setCurrentCallId(null);
            setCallStartTime(null);
          }}
        />
      )}

      {/* Floating Call Status Indicator */}
      <AnimatePresence>
        {callState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1002] pointer-events-none"
          >
            <div className={`px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              callState === 'calling' ? 'bg-amber-500/90 text-white border-amber-400' :
              callState === 'incoming' ? 'bg-emerald-500/90 text-white border-emerald-400' :
              callState === 'in-call' ? 'bg-primary/90 text-white border-primary/50' :
              'bg-slate-500/90 text-white border-slate-400'
            }`}>
              <div className="flex gap-1 items-center">
                <div className={`w-2 h-2 rounded-full bg-white ${callState !== 'ended' ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {callState}: {currentConsultation?.doctorName || outgoingCall?.name || incomingCall?.fromUserName || "Status"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

