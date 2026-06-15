import React from "react";
import { Link } from "react-router-dom";

const DEMAND_COLORS = {
  High: "demand-high",
  Medium: "demand-medium",
  Low: "demand-low",
};

function formatSalary(n) {
  return n?.toLocaleString() || "0";
}

export default function CareerCard({ career, onToggleSave, isSaved, onAddCompare, isCompared, compact }) {
  return (
    <div className={`career-card card ${compact ? "career-card-compact" : ""}`}>
      {career.imageUrl ? (
        <img
          src={career.imageUrl}
          alt={career.title}
          className="career-card-img"
          loading="lazy"
        />
      ) : (
        <div className="career-card-img-placeholder">No Image</div>
      )}
      <div className="career-card-body">
        <div className="career-card-top">
          <h3 className="career-card-title">{career.title}</h3>
          <span className={`career-demand-badge ${DEMAND_COLORS[career.demandLevel] || ""}`}>
            {career.demandLevel}
          </span>
        </div>
        <p className="career-card-salary">
          LKR {formatSalary(career.salaryMinLKR)} – {formatSalary(career.salaryMaxLKR)}
        </p>
        <div className="career-card-tags">
          {career.streamTags?.map((t) => (
            <span key={t} className="career-stream-tag">{t}</span>
          ))}
        </div>
        <div className="career-card-actions">
          <Link to={`/careers/${career._id}`} className="btn career-view-btn">
            View Details
          </Link>
          {onToggleSave && (
            <button
              className={`btn secondary career-save-btn ${isSaved ? "saved" : ""}`}
              onClick={() => onToggleSave(career._id)}
              title={isSaved ? "Unsave" : "Save"}
            >
              {isSaved ? "♥" : "♡"}
            </button>
          )}
          {onAddCompare && (
            <button
              className={`btn secondary career-compare-btn ${isCompared ? "compare-active" : ""}`}
              onClick={() => onAddCompare(career._id)}
              title={isCompared ? "Remove from compare" : "Add to compare"}
            >
              ⚖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
