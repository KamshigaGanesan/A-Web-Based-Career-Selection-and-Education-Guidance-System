import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import ResultCard from "../components/ResultCard.jsx";
import TrendChart from "../components/TrendChart.jsx";

export default function EligibilityHistory() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || localStorage.getItem("eligibility_userId");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [trendProgram, setTrendProgram] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get(`/api/eligibility/history/${userId}`);
        setHistory(data.history || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ textAlign: "center", marginTop: 60, animation: "fadeIn 0.4s ease" }}>
        <h2>No History Available</h2>
        <p className="small">Please complete an eligibility check first.</p>
        <Link to="/eligibility" className="btn" style={{ marginTop: 16 }}>Go to Student Form</Link>
      </div>
    );
  }

  return (
    <div className="elig-page" style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Eligibility History</h2>
        <Link to="/eligibility/check" className="btn secondary" style={{ fontSize: 13 }}>New Check</Link>
      </div>

      {error && <div className="elig-error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div className="quiz-spinner" />
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ margin: 0 }}>No eligibility checks recorded yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {history.map((item, idx) => {
            const isOpen = expanded === item._id;
            const topResults = item.results?.slice(0, 3) || [];
            return (
              <div key={item._id} className="card elig-history-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}
                  onClick={() => setExpanded(isOpen ? null : item._id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="pill" style={{ fontSize: 12 }}>{item.stream}</span>
                      <span className="pill" style={{ fontSize: 12 }}>{item.district}</span>
                      <span className="small">Z: <strong>{item.zScore}</strong></span>
                      <span className="small">Year: <strong>{item.year}</strong></span>
                    </div>
                    <p className="small" style={{ margin: "6px 0 0" }}>
                      {new Date(item.createdAt).toLocaleString()} — {item.results?.length || 0} programs found
                    </p>
                    {!isOpen && topResults.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {topResults.map((r, i) => (
                          <span key={i} className={`elig-badge elig-badge-${r.probabilityLabel?.toLowerCase()}`} style={{ fontSize: 11 }}>
                            {r.programName} ({r.probabilityPercent}%)
                          </span>
                        ))}
                        {item.results.length > 3 && <span className="small">+{item.results.length - 3} more</span>}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: "1.3rem", color: "#9ca3af", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                    &#9660;
                  </span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <div className="elig-results-grid">
                      {item.results.map((r, i) => (
                        <ResultCard
                          key={i}
                          programName={r.programName}
                          universityName={r.universityName}
                          latestCutoff={r.latestCutoff}
                          diff={r.diff}
                          zScore={item.zScore}
                          probabilityPercent={r.probabilityPercent}
                          probabilityLabel={r.probabilityLabel}
                          cutoffs3Years={r.cutoffs3Years}
                          onViewTrend={() => setTrendProgram({ ...r, zScore: item.zScore })}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {trendProgram && (
        <div className="elig-modal-overlay" onClick={() => setTrendProgram(null)}>
          <div className="elig-modal card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Cutoff Trend — {trendProgram.programName}</h3>
              <button className="btn secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setTrendProgram(null)}>Close</button>
            </div>
            <TrendChart
              cutoffs={trendProgram.cutoffs3Years}
              studentZScore={trendProgram.zScore}
              programName={trendProgram.programName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
