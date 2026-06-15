import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api.js";

const TYPE_COLORS = {
  private: { bg: "#eef2ff", color: "#4f46e5", label: "Private University" },
  diploma: { bg: "#f0fdf4", color: "#16a34a", label: "Diploma Program" },
  vocational: { bg: "#fffbeb", color: "#d97706", label: "Vocational Training" },
  foreign: { bg: "#fdf2f8", color: "#db2777", label: "Foreign Pathway" },
  foundation: { bg: "#f0f9ff", color: "#0284c7", label: "Foundation Program" },
};

export default function PathDetails() {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/alternatives/${id}`)
      .then((res) => setPath(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load details"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCompare() {
    try {
      const list = JSON.parse(localStorage.getItem("comparePaths")) || [];
      if (list.includes(id)) return;
      if (list.length >= 3) {
        alert("Maximum 3 paths for comparison. Remove one first.");
        return;
      }
      list.push(id);
      localStorage.setItem("comparePaths", JSON.stringify(list));
      alert("Added to compare list!");
    } catch {
      /* ignore */
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!reviewName.trim()) return;
    setReviewLoading(true);
    setReviewMsg("");
    try {
      const res = await api.post(`/api/alternatives/${id}/review`, {
        name: reviewName.trim(),
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });
      setPath((prev) => ({
        ...prev,
        ratingAvg: res.data.ratingAvg,
        ratingCount: res.data.ratingCount,
        reviews: [...(prev.reviews || []), res.data.review],
      }));
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      setReviewMsg("Review submitted!");
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) return <div className="card"><p>Loading...</p></div>;
  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!path) return <div className="card"><p>Path not found</p></div>;

  const tc = TYPE_COLORS[path.type] || TYPE_COLORS.private;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <Link to="/alternatives" className="small" style={{ display: "inline-block", marginBottom: 16 }}>
        ← Back to Alternative Pathways
      </Link>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="path-type-badge" style={{ background: tc.bg, color: tc.color, marginBottom: 12, display: "inline-block" }}>
              {tc.label}
            </span>
            <h2 style={{ margin: "8px 0 4px" }}>{path.title}</h2>
            <p className="small" style={{ margin: 0 }}>{path.provider}</p>
          </div>
          <button className="btn secondary" onClick={handleAddToCompare}>
            + Add to Compare
          </button>
        </div>

        <div className="detail-meta" style={{ marginTop: 20 }}>
          <div className="detail-meta-item">
            <span className="small">Duration</span>
            <strong>{path.durationMonths} months</strong>
          </div>
          <div className="detail-meta-item">
            <span className="small">Fees</span>
            <strong>LKR {path.feesLKR.toLocaleString()}</strong>
          </div>
          <div className="detail-meta-item">
            <span className="small">Rating</span>
            <strong>{path.ratingAvg > 0 ? `${path.ratingAvg.toFixed(1)}/5 (${path.ratingCount})` : "No ratings"}</strong>
          </div>
        </div>

        {path.description && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>About this Program</h3>
            <p style={{ margin: 0, lineHeight: 1.7, color: "#374151" }}>{path.description}</p>
          </div>
        )}

        {path.entryRequirements && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>Entry Requirements</h3>
            <p style={{ margin: 0, color: "#374151" }}>{path.entryRequirements}</p>
          </div>
        )}
      </div>

      {/* Pros and Cons */}
      <div className="row" style={{ marginBottom: 20 }}>
        {path.pros?.length > 0 && (
          <div className="col">
            <div className="card" style={{ borderLeft: "4px solid #16a34a" }}>
              <h3 style={{ margin: "0 0 12px", color: "#16a34a" }}>Pros</h3>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {path.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}
        {path.cons?.length > 0 && (
          <div className="col">
            <div className="card" style={{ borderLeft: "4px solid #dc2626" }}>
              <h3 style={{ margin: "0 0 12px", color: "#dc2626" }}>Cons</h3>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {path.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 24 }}>
          {path.streamTags?.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 8px" }}>Streams</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {path.streamTags.map((t) => <span key={t} className="path-tag">{t}</span>)}
              </div>
            </div>
          )}
          {path.careerTags?.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 8px" }}>Career Tags</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {path.careerTags.map((t) => <span key={t} className="path-tag career">{t}</span>)}
              </div>
            </div>
          )}
          {path.districtAvailability?.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 8px" }}>Available Districts</h4>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {path.districtAvailability.map((d) => <span key={d} className="pill">{d}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {path.applyLink && (
        <div style={{ marginBottom: 20 }}>
          <a href={path.applyLink} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: "inline-block" }}>
            Apply Now →
          </a>
        </div>
      )}

      {/* Reviews */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px" }}>Reviews ({path.reviews?.length || 0})</h3>

        {path.reviews?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {path.reviews.map((r, i) => (
              <div key={r._id || i} style={{ padding: "14px 0", borderBottom: i < path.reviews.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{r.name}</strong>
                  <span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="small" style={{ margin: "6px 0 0" }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="small">No reviews yet. Be the first to review!</p>
        )}

        <form onSubmit={handleSubmitReview} style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 20 }}>
          <h4 style={{ margin: "0 0 12px" }}>Add a Review</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="input"
              placeholder="Your name"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              required
            />
            <select className="input" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 && "s"}</option>)}
            </select>
            <textarea
              className="input"
              rows={3}
              placeholder="Your review (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <button className="btn" type="submit" disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
            {reviewMsg && <p className={reviewMsg.includes("Failed") ? "error" : "small"} style={{ color: reviewMsg.includes("Failed") ? undefined : "#16a34a" }}>{reviewMsg}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
