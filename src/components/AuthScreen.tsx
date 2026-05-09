import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, LogIn, Mail, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AuthScreen({ onBack }: { onBack?: () => void }) {
  const { login, loginEmail, signupEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await loginEmail(email, password);
        toast.success('Signed in successfully.');
      } else {
        await signupEmail(email, password);
        toast.success('Account created successfully.');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'Authentication failed.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already in use. Try signing in instead.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/weak-password') {
        message = 'The password is too weak.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-2xl bg-white">
        {/* Left Side: Brand & Visual */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8 backdrop-blur-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold italic mb-4">VitalPoint</h1>
            <p className="text-primary-foreground/80 leading-relaxed max-w-xs">
              Secure Healthcare Access. HIPAA Compliant, End-to-End Encrypted, and AI-Powered.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm font-medium">Join 2,000+ patients and doctors today.</p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center relative">
          {/* Back Button */}
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Back to home"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="mb-8 block md:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 italic">VitalPoint</h1>
          </div>

          <div className="space-y-2 mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-slate-500">{isLogin ? 'Access your medical dashboard.' : 'Start your health journey with us.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isLogin ? 'Sign In' : 'Sign Up'}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-all" />}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={login}
            className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLogin ? 'Create one now' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
