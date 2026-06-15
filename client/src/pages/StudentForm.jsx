import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

const INITIAL = { fullName: "", email: "", stream: "", district: "", zScore: "", year: "2023" };

export default function StudentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
    setApiError("");
  }

  function validateForm() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.stream) e.stream = "Select a stream.";
    if (!form.district) e.district = "Select a district.";
    const z = Number(form.zScore);
    if (!form.zScore || Number.isNaN(z)) e.zScore = "Enter a valid Z-score.";
    else if (z < 0 || z > 4) e.zScore = "Z-score must be between 0.0 and 4.0.";
    if (!form.year) e.year = "Year is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setApiError("");
    try {
      const userId = user?._id || user?.id || localStorage.getItem("eligibility_userId") || "guest";
      const body = { ...form, zScore: Number(form.zScore), year: Number(form.year), userId };
      const { data } = await api.post("/api/eligibility/student", body);
      localStorage.setItem("eligibility_userId", userId);
      localStorage.setItem("eligibility_student", JSON.stringify(data.student));
      navigate("/eligibility/check");
    } catch (err) {
      setApiError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="elig-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="card elig-form-card">
        <div className="elig-form-header">
          <span className="elig-form-icon">✅</span>
          <h2>Eligibility Analyzer</h2>
          <p className="small">
            Enter your details below to check your qualification and eligibility for university programs.
          </p>
        </div>

        {apiError && <div className="elig-error-banner">{apiError}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="small"><strong>Full Name</strong></label>
            <input className="input" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Kamal Perera" />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="small"><strong>Email</strong></label>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="small"><strong>Stream</strong></label>
            <select className="input" name="stream" value={form.stream} onChange={handleChange}>
              <option value="">— Select Stream —</option>
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.stream && <span className="error">{errors.stream}</span>}
          </div>

          <div className="form-group">
            <label className="small"><strong>District</strong></label>
            <select className="input" name="district" value={form.district} onChange={handleChange}>
              <option value="">— Select District —</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <span className="error">{errors.district}</span>}
          </div>

          <div className="form-group">
            <label className="small"><strong>Z-Score</strong></label>
            <input className="input" name="zScore" type="number" step="0.0001" min="0" max="4" value={form.zScore} onChange={handleChange} placeholder="e.g. 1.55" />
            {errors.zScore && <span className="error">{errors.zScore}</span>}
          </div>

          <div className="form-group">
            <label className="small"><strong>Exam Year</strong></label>
            <select className="input" name="year" value={form.year} onChange={handleChange}>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
            {errors.year && <span className="error">{errors.year}</span>}
          </div>

          <div className="form-group full-width" style={{ marginTop: 8 }}>
            <motion.button
              className="btn btn-full"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" /> Analyzing...
                </span>
              ) : "Save & Check Eligibility →"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
