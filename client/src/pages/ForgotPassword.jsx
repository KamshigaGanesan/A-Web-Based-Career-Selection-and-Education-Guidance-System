import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-sm">
            🔑
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            No worries, it happens! Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn-glow w-full py-4 rounded-2xl font-bold transition-all disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-8 text-center font-medium text-slate-500">
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
