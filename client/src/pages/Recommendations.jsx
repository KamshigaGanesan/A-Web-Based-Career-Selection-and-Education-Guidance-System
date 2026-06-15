import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];
const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];
const CAREER_TAGS = [
  "Software", "Engineering", "IT", "Data Science", "Healthcare", "Nursing",
  "Medicine", "Business", "Marketing", "Finance", "Management", "Teaching",
  "Agriculture", "Tourism", "Hospitality", "Cybersecurity", "Research",
  "Manufacturing", "Construction", "Journalism",
];

const TYPE_COLORS = {
  private: { bg: "#eef2ff", color: "#4f46e5", label: "Private" },
  diploma: { bg: "#f0fdf4", color: "#16a34a", label: "Diploma" },
  vocational: { bg: "#fffbeb", color: "#d97706", label: "Vocational" },
  foreign: { bg: "#fdf2f8", color: "#db2777", label: "Foreign" },
  foundation: { bg: "#f0f9ff", color: "#0284c7", label: "Foundation" },
};

export default function Recommendations() {
  const [stream, setStream] = useState("Maths");
  const [district, setDistrict] = useState("Colombo");
  const [budgetLKR, setBudgetLKR] = useState("300000");
  const [preferredDurationMonths, setPreferredDurationMonths] = useState("24");
  const [selectedTags, setSelectedTags] = useState(["Software", "Engineering"]);
  const [govEligibility, setGovEligibility] = useState(false);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await api.post("/api/recommendations/alternatives", {
        stream,
        district,
        budgetLKR: Number(budgetLKR),
        preferredDurationMonths: Number(preferredDurationMonths),
        quizCareerTags: selectedTags,
        eligiblePrograms: govEligibility ? ["mock-program"] : [],
        govEligibility,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score) {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#d97706";
    return "#dc2626";
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Pathway Recommendations</h2>
        <Link to="/alternatives" className="btn secondary">Browse All Pathways</Link>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px" }}>Your Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="small"><strong>A/L Stream</strong></label>
              <select className="input" value={stream} onChange={(e) => setStream(e.target.value)}>
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="small"><strong>District</strong></label>
              <select className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="small"><strong>Budget (LKR)</strong></label>
              <input className="input" type="number" value={budgetLKR} onChange={(e) => setBudgetLKR(e.target.value)} min="0" />
            </div>

            <div className="form-group">
              <label className="small"><strong>Preferred Duration (months)</strong></label>
              <input className="input" type="number" value={preferredDurationMonths} onChange={(e) => setPreferredDurationMonths(e.target.value)} min="1" />
            </div>

            <div className="form-group full-width">
              <label className="small"><strong>Government University Eligible?</strong></label>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  className={`filter-chip ${govEligibility ? "filter-chip-active" : ""}`}
                  onClick={() => setGovEligibility(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`filter-chip ${!govEligibility ? "filter-chip-active" : ""}`}
                  onClick={() => setGovEligibility(false)}
                >
                  No
                </button>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="small"><strong>Career Interests</strong> (select multiple)</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {CAREER_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`filter-chip ${selectedTags.includes(tag) ? "filter-chip-active" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 20, width: "100%" }}>
            {loading ? "Analyzing..." : "Get Recommendations"}
          </button>
        </form>
      </div>

      {error && <div className="card"><p className="error">{error}</p></div>}

      {results && (
        <div>
          <h3 style={{ marginBottom: 16 }}>
            Top {results.count} Recommendations
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {results.recommendations.map(({ path: p, finalScore, reasons }, idx) => {
              const tc = TYPE_COLORS[p.type] || TYPE_COLORS.private;
              return (
                <div key={p._id} className="card rec-card" style={{ animation: `fadeInUp 0.4s ease ${idx * 0.06}s both` }}>
                  <div className="rec-card-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <span className="rec-rank">#{idx + 1}</span>
                      <div>
                        <span className="path-type-badge" style={{ background: tc.bg, color: tc.color, marginBottom: 6, display: "inline-block" }}>
                          {tc.label}
                        </span>
                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{p.title}</h3>
                        <p className="small" style={{ margin: "2px 0 0" }}>{p.provider}</p>
                      </div>
                    </div>

                    <div className="rec-score" style={{ borderColor: scoreColor(finalScore) }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: scoreColor(finalScore) }}>{finalScore}</span>
                      <span className="small">/ 100</span>
                    </div>
                  </div>

                  <div className="rec-meta">
                    <span>{p.durationMonths} months</span>
                    <span>LKR {p.feesLKR.toLocaleString()}</span>
                    {p.ratingAvg > 0 && <span>★ {p.ratingAvg.toFixed(1)}</span>}
                  </div>

                  {reasons.length > 0 && (
                    <div className="rec-reasons">
                      {reasons.map((r, i) => (
                        <div key={i} className="rec-reason">
                          <span className="rec-reason-icon">✓</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <Link to={`/alternatives/${p._id}`} className="btn secondary" style={{ fontSize: 13 }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
