import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, API_URL } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

const FEATURES = [
  {
    icon: "🎯",
    title: "Career Assessment",
    desc: "Discover your strengths, interests, and ideal career paths with guided assessments.",
    color: "#6366f1",
  },
  {
    icon: "📚",
    title: "Course Explorer",
    desc: "Browse curated courses across engineering, medicine, arts, IT and more.",
    color: "#06b6d4",
  },
  {
    icon: "🗺️",
    title: "Career Roadmaps",
    desc: "Step-by-step guides to help you plan your academic and professional journey.",
    color: "#8b5cf6",
  },
  {
    icon: "✅",
    title: "Eligibility Checker",
    desc: "Instantly check if you qualify for university programs based on Z-scores.",
    color: "#10b981",
  },
  {
    icon: "⚡",
    title: "Smart Recommendations",
    desc: "Get AI-powered personalized career and course recommendations.",
    color: "#f59e0b",
  },
  {
    icon: "📊",
    title: "Compare & Decide",
    desc: "Compare careers, pathways and programs side by side to make informed decisions.",
    color: "#ec4899",
  },
];

const STATS = [
  { label: "Courses Available", end: 50, suffix: "+", icon: "📚" },
  { label: "Students Guided", end: 1200, suffix: "+", icon: "🎓" },
  { label: "Career Paths", end: 25, suffix: "", icon: "🛤️" },
  { label: "Universities", end: 15, suffix: "+", icon: "🏛️" },
];

function AnimatedCounter({ end, suffix, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / 40));
    const interval = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(interval); }
      else setCount(start);
    }, 30);
    return () => clearInterval(interval);
  }, [end, inView]);

  return <>{count}{suffix}</>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    api.get("/courses").then((r) => setCourses(r.data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-24 sm:px-16 lg:py-32"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              Your Future Starts Here
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
              Shape Your Future<br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                with the Right Career
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Explore 500+ courses, discover 25+ career paths, and get AI-powered guidance to make confident decisions about your professional journey.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                to="/courses"
                className="btn-glow px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Explore Courses
              </Link>
              <Link
                to="/quiz"
                className="px-8 py-4 rounded-2xl font-bold text-lg text-white border border-slate-700 hover:bg-slate-800 transition-all backdrop-blur-sm"
              >
                Take Career Quiz
              </Link>
            </div>
          </motion.div>

          <div className="flex-1 w-full max-w-lg relative">
             <div className="aspect-square relative flex items-center justify-center">
                {/* Visual elements representing success/guidance */}
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-full"
                />
                <motion.div 
                   animate={{ y: [0, -20, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="w-48 h-48 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-center text-8xl"
                >
                  🚀
                </motion.div>
                <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl animate-float">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-xl">✅</div>
                      <div>
                         <div className="text-white font-bold text-sm">Path Found</div>
                         <div className="text-slate-400 text-xs">Software Engineer</div>
                      </div>
                   </div>
                </div>
                <div className="absolute bottom-10 left-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl animate-float-delayed">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-xl">🎯</div>
                      <div>
                         <div className="text-white font-bold text-sm">Target Set</div>
                         <div className="text-slate-400 text-xs">CS Degree</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 -mt-32 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-all"
              variants={fadeUpItem}
              whileInView="show"
              initial="hidden"
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                <AnimatedCounter end={s.end} suffix={s.suffix} inView={statsVisible} />
              </div>
              <div className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Why Career Guidance?
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to make confident career decisions in one place.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
              variants={fadeUpItem}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform" 
                style={{ backgroundColor: `${f.color}15` }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Latest Courses Section */}
      {courses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Latest Courses</h2>
              <p className="text-slate-600 mt-2">Recently added learning opportunities</p>
            </div>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
            >
              View All Courses
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c) => (
              <motion.div
                key={c._id}
                variants={fadeUpItem}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <Link 
                  to={`/courses/${c._id}`} 
                  className="group block bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {c.image ? (
                      <img 
                        src={`${API_URL}${c.image}`} 
                        alt={c.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
                        📚
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-indigo-600 shadow-sm uppercase tracking-wider">
                        {c.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {c.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="text-lg">⏱️</span> {c.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-lg">💰</span> {c.fees}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div
          className="relative rounded-[3rem] bg-indigo-600 px-8 py-20 text-center overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-50" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl animate-bounce mx-auto flex items-center justify-center text-4xl">
              🎓
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                Ready to Find Your Path?
              </h2>
              <p className="text-indigo-100 text-lg leading-relaxed">
                Join 1,200+ students discovering their ideal careers. Browse courses, take assessments, and plan your future today.
              </p>
            </div>
            <div>
              <Link 
                to={user ? "/courses" : "/register"} 
                className="inline-flex h-16 items-center justify-center px-10 rounded-2xl bg-white text-indigo-600 font-bold text-lg hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                {user ? "Browse Courses Now" : "Get Started For Free →"}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
