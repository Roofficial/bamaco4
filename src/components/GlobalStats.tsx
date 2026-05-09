import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, Calendar, Activity, TrendingUp, UserPlus, ArrowUpRight, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function GlobalStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingVerifications: 0
  });

  useEffect(() => {
    // Basic collection listeners for counters
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const all = snapshot.docs.map(d => d.data());
      setStats({
        totalUsers: all.length,
        totalDoctors: all.filter(u => u.role === 'doctor').length,
        totalPatients: all.filter(u => u.role === 'patient').length,
        pendingVerifications: all.filter(u => u.role === 'doctor' && !u.isConfirmed).length
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "users");
    });

    return () => unsubUsers();
  }, []);

  const chartData = [
    { name: 'Patients', value: stats.totalPatients, color: '#3b82f6' },
    { name: 'Verified Doctors', value: stats.totalDoctors - stats.pendingVerifications, color: '#10b981' },
    { name: 'Pending Drs', value: stats.pendingVerifications, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Ecosystem</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              Growth Active
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Doctors</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.totalDoctors}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">{stats.pendingVerifications} in verification queue</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Appointments</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">--</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-primary-foreground/70">Health Checks</p>
                <h3 className="text-3xl font-bold mt-1">Active</h3>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Demographics Distribution</CardTitle>
            <CardDescription>Network breakdown by user role</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-serif">System Integrity</CardTitle>
            <CardDescription className="text-slate-400">Security & Operational Status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">E2E Encryption</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none">NOMINAL</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Verification Queue</span>
                </div>
                <span className="text-sm font-bold">{stats.pendingVerifications} Task(s)</span>
              </div>
              <Button variant="secondary" className="w-full rounded-xl mt-4">
                Run Diagnostic
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
