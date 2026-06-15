import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import CareerSuggestion from "../components/CareerSuggestion.jsx";

export default function QuizResult() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) return;
    async function fetchResult() {
      try {
        const { data } = await api.get(`/api/quiz/result/${id}`);
        setResult(data.result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id, result]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-premium text-center space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Calculating Results</h3>
            <p className="text-slate-500 font-medium">Analyzing your responses to find the perfect career match...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-premium text-center space-y-6">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-2">
             <h3 className="text-xl font-bold text-slate-900">Oops!</h3>
             <p className="text-rose-500 font-bold">{error || "Result not found"}</p>
          </div>
          <button 
            className="btn-secondary w-full py-4 rounded-2xl" 
            onClick={() => navigate("/quiz")}
          >
            Back to Career Quiz
          </button>
        </div>
      </div>
    );
  }

  const scoreBreakdown = result.scoreBreakdown instanceof Map
    ? Object.fromEntries(result.scoreBreakdown)
    : result.scoreBreakdown || {};

  const maxScore = Math.max(...Object.values(scoreBreakdown), 1);

  const TAG_COLORS = {
    IT: "#3b82f6", Engineering: "#8b5cf6", Medicine: "#ef4444",
    Business: "#22c55e", Design: "#f59e0b", Law: "#6366f1", Education: "#ec4899",
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div 
        className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border-t-8"
        style={{ borderTopColor: TAG_COLORS[result.topCareers?.[0]?.careerTag] || "#6366f1" }}
      >
        <div className="p-8 sm:p-12 space-y-12 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-sm border border-slate-100">
              🎯
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Career Assessment Results</h2>
            {result.stream && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold tracking-wide">
                {result.stream} Stream
              </span>
            )}
          </div>

          <div className="max-w-2xl mx-auto space-y-8 text-left bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-3">
               <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-sm ring-1 ring-slate-200">📊</span>
               Aptitude Breakdown
            </h3>
            <div className="space-y-6">
              {Object.entries(scoreBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, score]) => (
                  <div className="space-y-2" key={tag}>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-700">{tag}</span>
                      <span className="text-slate-500 font-black">{score}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        className="h-full rounded-full shadow-sm"
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / maxScore) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                          backgroundColor: TAG_COLORS[tag] || "#6366f1",
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100">
             <CareerSuggestion topCareers={result.topCareers || []} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <button 
               className="btn px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200" 
               onClick={() => navigate(`/quiz/review/${result._id}`)}
            >
              Review My Answers
            </button>
            <button 
               className="btn-secondary px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all" 
               onClick={() => navigate("/quiz")}
            >
              Retake Assessment
            </button>
            {user && (
              <button
                className="btn-secondary px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all"
                onClick={() => navigate(`/quiz/history/${user.id || user.sub || user._id}`)}
              >
                View Quest History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
