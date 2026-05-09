import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { logout, profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-serif font-bold text-slate-900">Account Pending Verification</CardTitle>
            <CardDescription className="text-slate-500">Thank you for joining VitalPoint as a medical specialist.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-slate-900 italic uppercase tracking-tighter mb-1">Onboarding Received</p>
              <p className="text-slate-600">Our administrators are currently reviewing your credentials. This process typically takes 24-48 hours.</p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-slate-500">
              We'll notify you via <span className="font-semibold text-slate-900">{profile?.email}</span> once your account has been approved.
            </p>
            <Button onClick={logout} variant="outline" className="w-full rounded-xl">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
            <ShieldAlert className="w-3 h-3" />
            Security & Verification Protocol Active
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
