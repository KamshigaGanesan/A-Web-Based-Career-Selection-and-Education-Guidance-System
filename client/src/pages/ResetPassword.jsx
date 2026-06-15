import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => nav("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
        <motion.div
          className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Password Reset!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your password has been reset successfully. You will be redirected to the login page in a few seconds.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-sm">
            🛡️
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set New Password</h2>
          <p className="text-slate-500 font-medium">Reset your account password to regain access.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-glow w-full py-4 rounded-2xl font-bold transition-all disabled:opacity-70"
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
