import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

const QUICK_LINKS = [
  { to: "/careers", icon: "🎯", title: "Explore Careers", desc: "Browse career paths and opportunities" },
  { to: "/courses", icon: "📚", title: "View Courses", desc: "Discover courses to build your skills" },
  { to: "/quiz", icon: "✍️", title: "Take a Quiz", desc: "Find your ideal career match" },
  { to: "/eligibility", icon: "✅", title: "Check Eligibility", desc: "See which programs you qualify for" },
  { to: "/alternatives", icon: "🗺️", title: "Career Pathways", desc: "Explore alternative routes" },
  { to: "/careers/saved", icon: "❤️", title: "Saved Careers", desc: "Your bookmarked career paths" },
  { to: "/github-analyzer", icon: "🐙", title: "GitHub Analyzer", desc: "Analyze your GitHub profile and repos" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { token, user } = useAuth();
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMe(res.data))
      .catch(() => setError("Failed to load profile."));
  }, [token]);

  return (
    <div className="space-y-12 pb-12">
      {/* Dashboard Hero */}
      <motion.div
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-200 border border-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full -translate-x-1/4 translate-y-1/4 blur-3xl opacity-50" />
        
        <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <motion.div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-2xl shadow-indigo-500/40 border-4 border-white/10"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </motion.div>
          
          <div className="space-y-4 flex-grow">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-indigo-400">{user?.name?.split(" ")[0] || "Student"}!</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium mt-2">
                Ready to continue your career exploration? Here's your hub.
              </p>
            </motion.div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8 pt-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">📧</div>
                  <div className="text-left">
                     <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Email Address</div>
                     <div className="text-white text-sm font-semibold">{me?.email || "—"}</div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🛡️</div>
                  <div className="text-left">
                     <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Provider</div>
                     <div className="text-white text-sm font-semibold capitalize">{me?.provider || "Local"}</div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl border border-emerald-500/20">✅</div>
                  <div className="text-left">
                     <div className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Status</div>
                     <div className="text-white text-sm font-semibold">Active</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-bold flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quick Actions</h2>
          <div className="h-px flex-grow bg-slate-200 ml-6 hidden sm:block"></div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {QUICK_LINKS.map((link) => (
            <motion.div key={link.to} variants={item}>
              <Link 
                to={link.to} 
                className="group relative block p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 h-full flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform">
                  {link.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">
                  {link.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed flex-grow">
                  {link.desc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  Open 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                {/* Subtle corner accent */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
