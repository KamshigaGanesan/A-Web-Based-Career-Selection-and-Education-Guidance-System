import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api, API_URL } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setToken, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const authError = params.get("authError");
    if (authError === "google_not_configured") {
      setError("Google sign-up is not configured yet. Please contact support or register with email.");
      return;
    }
    if (authError === "google_auth_failed") {
      setError("Google authentication failed. Please try again.");
    }
  }, [params]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      nav("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function googleAuth() {
    window.location.href = `${API_URL}/auth/google?mode=register`;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row border border-slate-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Illustration/Branding */}
        <div className="md:w-5/12 bg-indigo-600 px-10 py-16 text-white flex flex-col justify-center relative overflow-hidden text-center md:text-left">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl opacity-30" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto md:mx-0 backdrop-blur-md border border-white/10 shadow-xl">
              🚀
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tight leading-tight">Start Your Journey</h2>
              <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                Create an account to discover personalized career paths and opportunities.
              </p>
            </div>
            <div className="pt-8 flex flex-col gap-4">
               <div className="flex items-center gap-3 text-sm text-indigo-100">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">✨</span>
                  Free Career Assessment
               </div>
               <div className="flex items-center gap-3 text-sm text-indigo-100">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">✨</span>
                  AI Skill Analysis
               </div>
               <div className="flex items-center gap-3 text-sm text-indigo-100">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">✨</span>
                  Verified Certifications
               </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-slate-500 font-medium">Join thousands of students finding their path</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    👤
                  </span>
                  <input
                    className="input pl-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    📧
                  </span>
                  <input
                    className="input pl-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    🔒
                  </span>
                  <input
                    className="input pl-11 pr-12"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="text-lg">⚠️</span>
                  {error}
                </motion.div>
              )}

              <button
                className="btn-glow w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed group transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest leading-none">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              onClick={googleAuth}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Account
            </button>

            <p className="text-center text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4 decoration-2">
                Sign in instead
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
