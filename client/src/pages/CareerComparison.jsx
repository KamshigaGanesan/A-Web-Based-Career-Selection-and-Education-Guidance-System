import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import ComparisonTable from "../components/ComparisonTable.jsx";

export default function CareerComparison() {
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("compareCareerIds") || "[]"); }
    catch { return []; }
  });
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("compareCareerIds", JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    if (compareIds.length < 2) {
      setCareers([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.post("/api/careers/compare", { ids: compareIds });
        setCareers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load comparison");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [compareIds]);

  const handleRemove = (id) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  };

  const handleClearAll = () => {
    setCompareIds([]);
    setCareers([]);
  };

  return (
    <div className="careers-page" style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link to="/careers" className="btn secondary">← Back to Careers</Link>
      </div>

      {compareIds.length < 2 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>⚖</p>
          <h3 style={{ margin: "0 0 8px" }}>Select at least 2 careers to compare</h3>
          <p className="small">Go to the career listing and add careers using the compare button.</p>
          <Link to="/careers" className="btn" style={{ marginTop: 16 }}>
            Browse Careers
          </Link>
        </div>
      ) : loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div className="quiz-spinner" />
          <p className="small" style={{ marginTop: 16 }}>Loading comparison...</p>
        </div>
      ) : error ? (
        <div className="elig-error-banner">{error}</div>
      ) : (
        <ComparisonTable
          careers={careers}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
