import React from "react";

export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSubmit?.();
  };

  return (
    <div className="career-search-bar">
      <span className="career-search-icon">🔍</span>
      <input
        type="text"
        className="career-search-input"
        placeholder={placeholder || "Search careers..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button className="career-search-clear" onClick={() => onChange("")} title="Clear">
          ✕
        </button>
      )}
      <button className="btn career-search-btn" onClick={onSubmit}>
        Search
      </button>
    </div>
  );
}
