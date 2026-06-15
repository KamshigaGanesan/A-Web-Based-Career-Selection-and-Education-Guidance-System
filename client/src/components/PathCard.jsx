import React from "react";
import { Link } from "react-router-dom";

const TYPE_COLORS = {
  private: { bg: "#eef2ff", color: "#4f46e5", label: "Private" },
  diploma: { bg: "#f0fdf4", color: "#16a34a", label: "Diploma" },
  vocational: { bg: "#fffbeb", color: "#d97706", label: "Vocational" },
  foreign: { bg: "#fdf2f8", color: "#db2777", label: "Foreign" },
  foundation: { bg: "#f0f9ff", color: "#0284c7", label: "Foundation" },
};

export default function PathCard({ path, compareList = [], onToggleCompare }) {
  const tc = TYPE_COLORS[path.type] || TYPE_COLORS.private;
  const isCompared = compareList.includes(path._id);
  const compareDisabled = !isCompared && compareList.length >= 3;

  return (
    <div className="path-card card">
      <div className="path-card-header">
        <span className="path-type-badge" style={{ background: tc.bg, color: tc.color }}>
          {tc.label}
        </span>
        {path.ratingAvg > 0 && (
          <span className="path-rating">
            {"★"} {path.ratingAvg.toFixed(1)}
          </span>
        )}
      </div>

      <h3 className="path-card-title">{path.title}</h3>
      <p className="path-card-provider">{path.provider}</p>

      <div className="path-card-meta">
        <span>{path.durationMonths} months</span>
        <span>LKR {path.feesLKR.toLocaleString()}</span>
      </div>

      <div className="path-card-tags">
        {path.streamTags?.slice(0, 3).map((t) => (
          <span key={t} className="path-tag">{t}</span>
        ))}
        {path.careerTags?.slice(0, 2).map((t) => (
          <span key={t} className="path-tag career">{t}</span>
        ))}
      </div>

      <div className="path-card-actions">
        <Link to={`/alternatives/${path._id}`} className="btn" style={{ flex: 1, textAlign: "center" }}>
          View Details
        </Link>
        <button
          className={`btn secondary ${isCompared ? "compare-active" : ""}`}
          disabled={compareDisabled}
          onClick={() => onToggleCompare?.(path._id)}
          title={compareDisabled ? "Max 3 paths for comparison" : isCompared ? "Remove from compare" : "Add to compare"}
        >
          {isCompared ? "✓ Compared" : "Compare"}
        </button>
      </div>
    </div>
  );
}
