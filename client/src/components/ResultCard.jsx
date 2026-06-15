import React from "react";

const BADGE_COLORS = {
  High: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  Medium: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  Low: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
};

export default function ResultCard({
  programName,
  universityName,
  universityCode,
  degreeType,
  durationYears,
  careerTags,
  latestCutoff,
  diff,
  zScore,
  probabilityPercent,
  probabilityLabel,
  cutoffs3Years,
  onViewTrend,
  index = 0,
}) {
  const badge = BADGE_COLORS[probabilityLabel] || BADGE_COLORS.Low;
  const diffSign = diff >= 0 ? "+" : "";

  return (
    <div
      className="card elig-result-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="elig-result-header">
        <div style={{ flex: 1 }}>
          <h3 className="elig-result-title">{programName}</h3>
          <p className="elig-result-uni">
            {universityName}
            {universityCode && <span className="pill" style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px" }}>{universityCode}</span>}
          </p>
        </div>
        <div
          className="elig-prob-badge"
          style={{ background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}` }}
        >
          <span className="elig-prob-pct">{probabilityPercent}%</span>
          <span className="elig-prob-label">{probabilityLabel}</span>
        </div>
      </div>

      <div className="elig-result-scores">
        <div className="elig-score-item">
          <span className="small">Your Z</span>
          <strong>{zScore != null ? zScore.toFixed(2) : "—"}</strong>
        </div>
        <div className="elig-score-divider" />
        <div className="elig-score-item">
          <span className="small">Cutoff</span>
          <strong>{latestCutoff?.toFixed(2)}</strong>
        </div>
        <div className="elig-score-divider" />
        <div className="elig-score-item">
          <span className="small">Diff</span>
          <strong style={{ color: diff >= 0 ? "#16a34a" : "#dc2626" }}>
            {diffSign}{diff?.toFixed(2)}
          </strong>
        </div>
      </div>

      {(degreeType || durationYears || (careerTags && careerTags.length > 0)) && (
        <div className="elig-result-meta">
          {degreeType && <span className="path-tag">{degreeType}</span>}
          {durationYears && <span className="path-tag">{durationYears} yrs</span>}
          {careerTags?.map((t) => <span key={t} className="path-tag career">{t}</span>)}
        </div>
      )}

      {cutoffs3Years && cutoffs3Years.length > 0 && (
        <div className="elig-mini-trend">
          {cutoffs3Years.map((c) => (
            <span key={c.year} className="small">
              {c.year}: <strong>{c.cutoffZScore?.toFixed(2)}</strong>
            </span>
          ))}
        </div>
      )}

      {onViewTrend && (
        <button
          className="btn secondary"
          onClick={onViewTrend}
          style={{ width: "100%", marginTop: 10, fontSize: 13, padding: "9px 0" }}
        >
          View Trend Graph
        </button>
      )}
    </div>
  );
}
