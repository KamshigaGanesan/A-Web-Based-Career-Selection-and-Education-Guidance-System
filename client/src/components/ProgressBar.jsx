import React from "react";

export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="quiz-progress">
      <div className="quiz-progress-info">
        <span className="small">Question {current} of {total}</span>
        <span className="small">{pct}%</span>
      </div>
      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
