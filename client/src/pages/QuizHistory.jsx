import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function QuizHistory() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get(`/api/quiz/history/${userId}`);
        setResults(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="quiz-spinner" />
          <p className="small" style={{ marginTop: 16 }}>Loading history...</p>
        </div>
      </div>
    );
  }

  const TAG_COLORS = {
    IT: "#3b82f6", Engineering: "#8b5cf6", Medicine: "#ef4444",
    Business: "#22c55e", Design: "#f59e0b", Law: "#6366f1", Education: "#ec4899",
  };

  return (
    <div className="quiz-page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Quiz History</h2>
          <button className="btn" onClick={() => navigate("/quiz")}>Take New Quiz</button>
        </div>
      </div>

      {error && <p className="error" style={{ textAlign: "center" }}>{error}</p>}

      {!error && results.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 48, margin: "0 0 12px" }}>📋</p>
          <h3 style={{ margin: "0 0 8px" }}>No Quiz Attempts Yet</h3>
          <p className="small">Take your first career assessment to see results here.</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate("/quiz")}>
            Start Assessment
          </button>
        </div>
      )}

      <div className="quiz-history-list">
        {results.map((r, idx) => {
          const topTag = r.topCareers?.[0]?.careerTag || "N/A";
          const topColor = TAG_COLORS[topTag] || "#6366f1";

          return (
            <div
              key={r._id}
              className="card quiz-history-item"
              style={{ borderLeft: `4px solid ${topColor}`, cursor: "pointer", animationDelay: `${idx * 0.06}s` }}
              onClick={() => navigate(`/quiz/result/${r._id}`)}
            >
              <div className="quiz-history-item-content">
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>
                    Top Match: <span style={{ color: topColor }}>{topTag}</span>
                  </h3>
                  <p className="small" style={{ margin: 0 }}>
                    {r.totalQuestions} questions
                    {r.stream && <> | {r.stream} Stream</>}
                    {" | "}
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="quiz-history-tags">
                  {(r.topCareers || []).slice(0, 3).map((tc) => (
                    <span
                      key={tc.careerTag}
                      className="pill"
                      style={{ fontSize: 12, background: `${TAG_COLORS[tc.careerTag] || "#6366f1"}18`, color: TAG_COLORS[tc.careerTag] || "#6366f1" }}
                    >
                      {tc.careerTag}: {tc.score}
                    </span>
                  ))}
                </div>
              </div>
              <span className="quiz-history-arrow">→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
