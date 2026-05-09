import React from 'react';
import { motion } from 'motion/react';
import { Shield, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  const loadingText = "Initializing secure healthcare ecosystem...";
  
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Decorative atmospheric background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-12"
        >
          <Shield className="w-10 h-10" />
        </motion.div>

        {/* Animated Text */}
        <div className="space-y-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-serif font-bold text-slate-900 italic"
          >
            VitalPoint E-Clinic
          </motion.h2>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-1">
              {loadingText.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5 + i * 0.1,
                    ease: "easeOut" 
                  }}
                  className="text-slate-500 text-sm font-medium tracking-tight"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 mt-4"
            >
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Check Active
              </span>
            </motion.div>
          </div>
        </div>

        {/* Technical touch - progress line */}
        <div className="mt-16 w-48 h-px bg-slate-100 relative overflow-hidden">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
