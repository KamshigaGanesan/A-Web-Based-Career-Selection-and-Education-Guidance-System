import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import ResultCard from "../components/ResultCard.jsx";
import TrendChart from "../components/TrendChart.jsx";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];
const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle",
];

export default function EligibilityCheck() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStream, setFilterStream] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [trendProgram, setTrendProgram] = useState(null);
  const [meta, setMeta] = useState(null);

  const stored = JSON.parse(localStorage.getItem("eligibility_student") || "null");
  const userId = user?._id || user?.id || localStorage.getItem("eligibility_userId");

  const fetchEligibility = useCallback(async (streamOverride, districtOverride) => {
    if (!stored) return;
    setLoading(true);
    setError("");
    try {
      const body = {
        userId,
        stream: stored.stream,
        district: stored.district,
        zScore: stored.zScore,
        year: stored.year,
        filters: {
          stream: streamOverride || stored.stream,
          district: districtOverride || stored.district,
        },
      };
      const { data } = await api.post("/api/eligibility/check-eligibility", body);
      setResults(data.results);
      setInput(data.input);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch eligibility results.");
    } finally {
      setLoading(false);
    }
  }, [stored, userId]);

  useEffect(() => {
    fetchEligibility();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilterApply() {
    fetchEligibility(filterStream, filterDistrict);
  }

  function handleReset() {
    setFilterStream("");
    setFilterDistrict("");
    fetchEligibility("", "");
  }

  if (!stored) {
    return (
      <div style={{ textAlign: "center", marginTop: 60, animation: "fadeIn 0.4s ease" }}>
        <h2>No Student Data</h2>
        <p className="small">Please fill in your details first.</p>
        <Link to="/eligibility" className="btn" style={{ marginTop: 16 }}>Go to Student Form</Link>
      </div>
    );
  }

  return (
    <div className="elig-page" style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Eligibility Results</h2>
          {input && (
            <p className="small" style={{ margin: "4px 0 0" }}>
              Stream: <strong>{input.stream}</strong> &nbsp;|&nbsp; District: <strong>{input.district}</strong> &nbsp;|&nbsp;
              Z-Score: <strong>{input.zScore}</strong> &nbsp;|&nbsp; Year: <strong>{input.year}</strong>
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/eligibility" className="btn secondary" style={{ fontSize: 13 }}>Edit Info</Link>
          <Link to="/eligibility/history" className="btn secondary" style={{ fontSize: 13 }}>History</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span className="small" style={{ fontWeight: 600 }}>Filters:</span>
          <select className="input" value={filterStream} onChange={(e) => setFilterStream(e.target.value)} style={{ maxWidth: 160, padding: "8px 12px", fontSize: 13 }}>
            <option value="">All Streams</option>
            {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} style={{ maxWidth: 170, padding: "8px 12px", fontSize: 13 }}>
            <option value="">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn" onClick={handleFilterApply} style={{ fontSize: 13, padding: "8px 16px" }}>Apply</button>
          <button className="btn secondary" onClick={handleReset} style={{ fontSize: 13, padding: "8px 16px" }}>Reset</button>
        </div>
      </div>

      {error && <div className="elig-error-banner">{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div className="quiz-spinner" />
          <p className="small" style={{ marginTop: 14 }}>Analyzing eligibility...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: "2rem", margin: 0 }}>No matching programs found.</p>
          <p className="small">Try adjusting your filters or check your Z-score input.</p>
        </div>
      ) : (
        <>
          {meta && (
            <p className="small" style={{ marginBottom: 10 }}>
              Found <strong>{meta.count}</strong> eligible program{meta.count !== 1 ? "s" : ""}
            </p>
          )}
          <div className="elig-results-grid">
            {results.map((r, i) => (
              <ResultCard
                key={r.degreeProgramId + "-" + i}
                programName={r.programName}
                universityName={r.universityName}
                universityCode={r.universityCode}
                degreeType={r.degreeType}
                durationYears={r.durationYears}
                careerTags={r.careerTags}
                latestCutoff={r.latestCutoff}
                diff={r.diff}
                zScore={input?.zScore}
                probabilityPercent={r.probabilityPercent}
                probabilityLabel={r.probabilityLabel}
                cutoffs3Years={r.cutoffs3Years}
                onViewTrend={() => setTrendProgram(r)}
                index={i}
              />
            ))}
          </div>
        </>
      )}

      {/* Trend modal */}
      {trendProgram && (
        <div className="elig-modal-overlay" onClick={() => setTrendProgram(null)}>
          <div className="elig-modal card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                Cutoff Trend — {trendProgram.programName}
              </h3>
              <button className="btn secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setTrendProgram(null)}>Close</button>
            </div>
            <TrendChart
              cutoffs={trendProgram.cutoffs3Years}
              studentZScore={input?.zScore}
              programName={trendProgram.programName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
