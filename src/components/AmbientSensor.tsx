import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind, Radio, Smartphone, AlertTriangle, ShieldCheck, Thermometer, Droplets, BellRing, Mail, Smartphone as PhoneIcon, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface SensorData {
  aqi: number;
  temp: number;
  humidity: number;
  status: 'optimal' | 'moderate' | 'unhealthy';
  lastUpdated: Date;
}

export default function AmbientSensor({ globalAqi }: { globalAqi: number }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [localData, setLocalData] = useState<SensorData | null>(null);
  
  // Notification States
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);

  const simulateBoardConnection = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setDeviceConnected(true);
      setLocalData({
        aqi: Math.floor(Math.random() * 30) + 15,
        temp: 22.4,
        humidity: 45,
        status: 'optimal',
        lastUpdated: new Date()
      });
      setIsSyncing(false);
    }, 2000);
  };

  // Simulate deterioration for testing or real monitoring
  useEffect(() => {
    if (!deviceConnected || !localData || !alertsEnabled) return;

    // Check if AQI is unhealthy (threshold of 100 for this exercise)
    if (localData.aqi > 100 || globalAqi > 100) {
      const now = Date.now();
      // Throttle alerts to once every 10 minutes for simulation
      if (now - lastAlertTime > 600000) {
        sendAlerts();
        setLastAlertTime(now);
      }
    }
  }, [localData, globalAqi, alertsEnabled]);

  const sendAlerts = () => {
    const message = `ALERT: Air Quality Deterioration detected at your location. AQI: ${localData?.aqi}. Please take necessary precautions.`;
    
    if (contactInfo.email) {
      console.log(`[SIMULATION] Email sent to ${contactInfo.email}: ${message}`);
      toast.success("Emergency Email Alert Despatched", {
        description: `Sent to ${contactInfo.email}`,
        icon: <Mail className="w-4 h-4 text-emerald-500" />
      });
    }

    if (contactInfo.phone) {
      console.log(`[SIMULATION] SMS sent to ${contactInfo.phone}: ${message}`);
      toast.success("Emergency SMS Alert Despatched", {
        description: `Sent to ${contactInfo.phone}`,
        icon: <PhoneIcon className="w-4 h-4 text-emerald-500" />
      });
    }
  };

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setAlertsEnabled(true);
      toast.success("Notification settings saved", {
        description: "You will now receive alerts for air quality changes."
      });
    }, 800);
  };

  const getAqiColor = (val: number) => {
    if (val <= 50) return "text-emerald-500";
    if (val <= 100) return "text-amber-500";
    return "text-rose-500";
  };

  const aqiDiff = localData ? localData.aqi - globalAqi : 0;

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${deviceConnected ? 'text-primary' : 'text-slate-300'}`} />
            <CardTitle className="text-lg font-serif">Environmental Health</CardTitle>
          </div>
          {deviceConnected ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none flex gap-1 items-center">
              <ShieldCheck className="w-3 h-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-100 text-slate-400 border-none">
              Disconnected
            </Badge>
          )}
        </div>
        <CardDescription>Real-time sync with Nano 33 BLE Sense board</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {!deviceConnected ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center relative">
              <Smartphone className="w-8 h-8 text-slate-300" />
              {isSyncing && (
                <motion.div 
                  className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">No sensors detected</p>
              <p className="text-xs text-slate-500 max-w-[200px]">Ensure your Nano 33 BLE is powered and within range.</p>
            </div>
            <Button 
              onClick={simulateBoardConnection} 
              disabled={isSyncing}
              variant="outline" 
              className="rounded-xl"
            >
              {isSyncing ? "Searching..." : "Pair with Device"}
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Local AQI</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${getAqiColor(localData?.aqi || 0)}`}>{localData?.aqi}</span>
                  <span className="text-[10px] text-slate-400">PM2.5</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Regional Variance</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${aqiDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {aqiDiff > 0 ? `+${aqiDiff}` : aqiDiff}
                  </span>
                  <span className="text-[10px] text-slate-400">vs Global</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Air Quality Comparison</span>
                <span className="text-slate-900">{aqiDiff < 0 ? "Indoor is safer" : "Caution needed"}</span>
              </div>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((localData?.aqi || 0) / 1.5, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-slate-600">{localData?.temp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-600">{localData?.humidity}%</span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-slate-900 font-serif">Alert Notifications</span>
                </div>
                {alertsEnabled && (
                  <Badge className="bg-emerald-100 text-emerald-600 border-none text-[10px]">Active</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email for Alerts</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <Input 
                      placeholder="email@example.com"
                      className="h-9 pl-9 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/30"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Phone for SMS Alerts</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                    <Input 
                      placeholder="+1 (555) 000-0000"
                      className="h-9 pl-9 bg-slate-50/50 border-none text-xs rounded-xl focus-visible:ring-primary/30"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings || (!contactInfo.email && !contactInfo.phone)}
                  className="h-9 rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSavingSettings ? "Saving..." : (alertsEnabled ? "Update Alerts" : "Enable Alerts")}
                </Button>
              </div>

              {/* Developer Bypass: Deteriorate AQI to trigger alert */}
              <button 
                onClick={() => setLocalData(prev => prev ? {...prev, aqi: 150} : null)}
                className="w-full py-1 text-[8px] text-slate-300 hover:text-rose-500 font-bold uppercase tracking-widest transition-colors"
              >
                [Simulation] Trigger Deterioration Alert
              </button>
            </div>

            <div className="flex justify-center pt-2">
              <button onClick={() => setDeviceConnected(false)} className="text-[10px] text-slate-400 font-bold hover:text-rose-500 transition-colors uppercase">
                Disconnect Nano 33 Sense
              </button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
