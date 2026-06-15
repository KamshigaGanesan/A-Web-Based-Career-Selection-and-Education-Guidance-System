import React from "react";
import { Link } from "react-router-dom";

const CAREER_INFO = {
  IT: { title: "Information Technology", desc: "Software development, cybersecurity, data science, cloud computing, and AI.", color: "#3b82f6", icon: "💻" },
  Engineering: { title: "Engineering", desc: "Mechanical, civil, electrical, and systems engineering.", color: "#8b5cf6", icon: "⚙️" },
  Medicine: { title: "Medicine & Healthcare", desc: "Doctors, pharmacists, biotech researchers, and healthcare professionals.", color: "#ef4444", icon: "🏥" },
  Business: { title: "Business & Finance", desc: "Entrepreneurship, accounting, finance, marketing, and management.", color: "#22c55e", icon: "📊" },
  Design: { title: "Design & Creative Arts", desc: "Graphic design, UX/UI, architecture, animation, and visual media.", color: "#f59e0b", icon: "🎨" },
  Law: { title: "Law & Governance", desc: "Legal practice, policy making, human rights, and corporate law.", color: "#6366f1", icon: "⚖️" },
  Education: { title: "Education & Social Work", desc: "Teaching, counseling, community development, and social services.", color: "#ec4899", icon: "📚" },
};

export default function CareerSuggestion({ topCareers }) {
  if (!topCareers || topCareers.length === 0) return null;

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center gap-4 justify-center">
         <div className="h-px flex-grow bg-slate-200"></div>
         <h3 className="text-2xl font-black text-slate-800 tracking-tight">Top Career Matches</h3>
         <div className="h-px flex-grow bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topCareers.map((career, idx) => {
          const info = CAREER_INFO[career.careerTag] || {
            title: career.careerTag,
            desc: "Explore this career path to learn more.",
            color: "#6366f1",
            icon: "🎯",
          };

          return (
            <div
              key={career.careerTag}
              className="group relative flex flex-col items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300"
              style={{ borderTop: `4px solid ${info.color}` }}
            >
              <div 
                 className="absolute top-4 right-6 text-3xl font-black italic opacity-5 group-hover:opacity-10 transition-opacity"
                 style={{ color: info.color }}
              >
                 #{idx + 1}
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
                {info.icon}
              </div>
              
              <h4 className="text-xl font-bold tracking-tight mb-2 text-center" style={{ color: info.color }}>
                {info.title}
              </h4>
              <p className="text-sm text-slate-500 font-medium text-center line-clamp-2 min-h-[2.5rem]">
                {info.desc}
              </p>
              
              <div className="w-full mt-8 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Aptitude Match</span>
                  <span>{career.score} / {topCareers[0]?.score}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((career.score / (topCareers[0]?.score || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    style={{ background: info.color }}
                  />
                </div>
              </div>
              
              <Link 
                to="/courses" 
                className="btn-secondary w-full py-3 mt-8 font-bold text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"
              >
                Discover Courses
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
