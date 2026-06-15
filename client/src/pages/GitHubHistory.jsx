import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

export default function GitHubHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/github/history", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="page-header"><h2>Loading History...</h2></div>;

  return (
    <div className="github-history-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Link to="/github-analyzer" className="btn btn-outline">&larr; Back to Analyzer</Link>
        <h1 className="gradient-text">Analysis History</h1>
      </div>

      <div className="dashboard-grid">
        {history.map((item) => (
          <motion.div key={item._id} className="card" whileHover={{ y: -5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
               <strong>{item.username}</strong>
               <span className="small">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
               <div className="status-badge info">Score: {item.stats.profileStrength}</div>
               <div className="status-badge active">{item.aiInsights.developerPersonality}</div>
            </div>
            <Link to="/github-analyzer" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
               View Full Report
            </Link>
          </motion.div>
        ))}
        {history.length === 0 && <p>No saved analyses found.</p>}
      </div>
    </div>
  );
}
