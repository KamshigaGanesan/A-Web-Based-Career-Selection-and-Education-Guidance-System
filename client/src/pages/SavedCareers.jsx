import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import CareerCard from "../components/CareerCard.jsx";

export default function SavedCareers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) { navigate("/login"); return; }
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/careers/saved/${user._id}`);
        setCareers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load saved careers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  const removeSaved = async (careerId) => {
    try {
      await api.delete(`/api/careers/${careerId}/save?userId=${user._id}`);
      setCareers((prev) => prev.filter((c) => c._id !== careerId));
    } catch {}
  };

  return (
    <div className="careers-page" style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Saved Careers</h1>
        <Link to="/careers" className="btn secondary">← Back to Careers</Link>
      </div>

      {error && <div className="elig-error-banner">{error}</div>}

      {loading ? (
        <div className="career-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="career-skeleton card" />
          ))}
        </div>
      ) : careers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>♡</p>
          <h3 style={{ margin: "0 0 8px" }}>No saved careers yet</h3>
          <p className="small">Browse careers and save the ones that interest you.</p>
          <Link to="/careers" className="btn" style={{ marginTop: 16 }}>
            Browse Careers
          </Link>
        </div>
      ) : (
        <div className="career-grid">
          {careers.map((c) => (
            <CareerCard
              key={c._id}
              career={c}
              onToggleSave={removeSaved}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
