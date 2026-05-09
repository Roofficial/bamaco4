import { motion } from "motion/react";
import { Activity, Shield, Zap, Heart, MessageSquare, Video, ArrowRight, CheckCircle, Smartphone, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header"; // assuming we might want a simple header but let's build it inline for stability

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">PurePulse</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            <Button onClick={onGetStarted} className="rounded-full px-6 shadow-lg shadow-primary/20">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              The Future of Healthcare
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] text-slate-900">
              Personalized health care <span className="text-primary italic">at your fingertips.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-serif italic">
              Experience a new era of medical consultation through PurePulse. Real-time monitoring, instant specialist access, and AI-powered assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={onGetStarted} size="lg" className="rounded-2xl h-16 px-8 text-lg shadow-xl shadow-primary/20">
                Start Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl h-16 px-8 text-lg border-slate-200">
                View All Doctors
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-8 border-t border-slate-100">
              <div>
                <p className="text-3xl font-bold text-slate-900 font-serif">15k+</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Patients</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 font-serif">200+</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Specialists</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 font-serif">4.9/5</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">User Rating</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur-3xl -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173599211d0?auto=format&fit=crop&q=80&w=1200" 
              alt="Medical Professional" 
              className="rounded-[2.5rem] shadow-2xl w-full h-[600px] object-cover ring-8 ring-white/50"
            />
            {/* Floating elements */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4 max-w-xs animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <Heart className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Stable Condition</p>
                <p className="text-xs text-slate-500">Pulse: 72 BPM</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-slate-900">Our Premium Services</h2>
            <p className="text-slate-500 italic font-serif">Comprehensive healthcare solutions designed for modern living.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: "Telemedicine",
                desc: "High-definition video consultations with top-tier medical specialists from the comfort of your home.",
                color: "bg-indigo-50 text-indigo-500"
              },
              {
                icon: MessageSquare,
                title: "Instant Chat",
                desc: "Secure, encrypted messaging with your designated healthcare team for non-emergency inquiries.",
                color: "bg-emerald-50 text-emerald-500"
              },
              {
                icon: Shield,
                title: "Electronic Records",
                desc: "All your medical history, prescriptions, and lab results in one highly secured location.",
                color: "bg-rose-50 text-rose-500"
              },
              {
                icon: Smartphone,
                title: "Health Monitoring",
                desc: "Seamless integration with wearable devices to monitor your vitals in real-time.",
                color: "bg-amber-50 text-amber-500"
              },
              {
                icon: Globe,
                title: "Global Reach",
                desc: "Access specialized second opinions from worldwide medical centers of excellence.",
                color: "bg-primary/10 text-primary"
              },
              {
                icon: Zap,
                title: "AI Assessment",
                desc: "Preliminary symptom checking powered by advanced diagnostic intelligence.",
                color: "bg-slate-100 text-slate-900"
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-lg transition-all group cursor-default"
              >
                <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 ${service.color}`}>
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
             <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
              alt="Medical Team" 
              className="rounded-[2.5rem] shadow-2xl w-full h-[500px] object-cover"
            />
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-1 lg:order-2"
          >
            <h2 className="text-4xl font-serif font-bold text-slate-900">We prioritize your health above all else.</h2>
            <p className="text-slate-600 leading-relaxed font-serif italic text-lg">
              "PurePulse was founded on the belief that healthcare should be accessible, empathetic, and technologically superior. We bridge the gap between patients and practitioners through seamless digital integration."
            </p>
            <ul className="space-y-4">
              {[
                "Certified Specialists only",
                "End-to-end data encryption",
                "24/7 Priority support for members",
                "AI-driven diagnostic assistance"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-bold">Contact Our Support Team</h2>
              <p className="text-slate-400">Have questions about our platform or need assistance with your account? Our team is here to help 24/7.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Email</p>
                    <p className="font-bold">support@purepulse.healthcare</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Emergency Line</p>
                    <p className="font-bold">1-800-PURE-PULSE</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Headquarters</p>
                    <p className="font-bold">Medical Plaza 5, London, UK</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem]">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                  <textarea className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="How can we help you?" />
                </div>
                <Button className="w-full h-14 rounded-xl text-lg shadow-xl shadow-primary/20">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-serif font-bold tracking-tight">PurePulse</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 PurePulse Healthcare. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
