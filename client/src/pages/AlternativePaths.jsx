import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import PathCard from "../components/PathCard.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TYPES = [
  { value: "", label: "All Types" },
  { value: "private", label: "Private" },
  { value: "diploma", label: "Diploma" },
  { value: "vocational", label: "Vocational" },
  { value: "foreign", label: "Foreign" },
  { value: "foundation", label: "Foundation" },
];

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];

export default function AlternativePaths() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [paths, setPaths] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState(searchParams.get("type") || "");
  const [stream, setStream] = useState(searchParams.get("stream") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [minFee, setMinFee] = useState(searchParams.get("minFee") || "");
  const [maxFee, setMaxFee] = useState(searchParams.get("maxFee") || "");
  const [minDuration, setMinDuration] = useState(searchParams.get("minDuration") || "");
  const [maxDuration, setMaxDuration] = useState(searchParams.get("maxDuration") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("comparePaths")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("comparePaths", JSON.stringify(compareList));
  }, [compareList]);

  const fetchPaths = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (type) params.type = type;
      if (stream) params.stream = stream;
      if (search) params.search = search;
      if (minFee) params.minFee = minFee;
      if (maxFee) params.maxFee = maxFee;
      if (minDuration) params.minDuration = minDuration;
      if (maxDuration) params.maxDuration = maxDuration;
      params.page = page;
      params.limit = 12;

      const res = await api.get("/api/alternatives", { params });
      setPaths(res.data.paths);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load paths");
    } finally {
      setLoading(false);
    }
  }, [type, stream, search, minFee, maxFee, minDuration, maxDuration, page]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  useEffect(() => {
    const p = {};
    if (type) p.type = type;
    if (stream) p.stream = stream;
    if (search) p.search = search;
    if (minFee) p.minFee = minFee;
    if (maxFee) p.maxFee = maxFee;
    if (minDuration) p.minDuration = minDuration;
    if (maxDuration) p.maxDuration = maxDuration;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [type, stream, search, minFee, maxFee, minDuration, maxDuration, page, setSearchParams]);

  function handleToggleCompare(id) {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  function clearFilters() {
    setType("");
    setStream("");
    setSearch("");
    setMinFee("");
    setMaxFee("");
    setMinDuration("");
    setMaxDuration("");
    setPage(1);
  }

  const hasFilters = type || stream || search || minFee || maxFee || minDuration || maxDuration;

  return (
    <div>
      <motion.div
        className="page-header-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="page-title">Alternative Pathways</h1>
          <p className="page-subtitle">Discover alternative routes to your dream career</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {compareList.length > 0 && (
            <Link className="btn" to="/alternatives/compare">
              Compare ({compareList.length})
            </Link>
          )}
          <Link className="btn secondary" to="/recommendations">
            Get Recommendations
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by title, provider, or career..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && <button className="search-clear" onClick={() => { setSearch(""); setPage(1); }}>✕</button>}
      </div>

      {/* Filters */}
      <div className="alt-filters">
        <div className="alt-filter-row">
          <select className="input" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select className="input" value={stream} onChange={(e) => { setStream(e.target.value); setPage(1); }}>
            <option value="">All Streams</option>
            {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <input
            className="input"
            type="number"
            placeholder="Min Fee (LKR)"
            value={minFee}
            onChange={(e) => { setMinFee(e.target.value); setPage(1); }}
          />
          <input
            className="input"
            type="number"
            placeholder="Max Fee (LKR)"
            value={maxFee}
            onChange={(e) => { setMaxFee(e.target.value); setPage(1); }}
          />
          <input
            className="input"
            type="number"
            placeholder="Min Duration (months)"
            value={minDuration}
            onChange={(e) => { setMinDuration(e.target.value); setPage(1); }}
          />
          <input
            className="input"
            type="number"
            placeholder="Max Duration (months)"
            value={maxDuration}
            onChange={(e) => { setMaxDuration(e.target.value); setPage(1); }}
          />
        </div>
        {hasFilters && (
          <button className="btn secondary" style={{ marginTop: 8 }} onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Results info */}
      <p className="small" style={{ marginBottom: 12 }}>
        Showing {paths.length} of {total} pathways
        {hasFilters && <> (filtered)</>}
      </p>

      {/* Error */}
      {error && <div className="card"><p className="error">{error}</p></div>}

      {/* Loading */}
      {loading ? (
        <div className="page-loading"><div className="quiz-spinner" /><p className="small">Loading pathways...</p></div>
      ) : paths.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 40, margin: "0 0 8px" }}>📚</p>
          <h3 style={{ margin: "0 0 6px" }}>No pathways found</h3>
          <p className="small">Try adjusting your filters or search term.</p>
          {hasFilters && (
            <button className="btn secondary" style={{ marginTop: 12 }} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <motion.div className="path-grid" variants={container} initial="hidden" animate="show">
            {paths.map((p) => (
              <motion.div key={p._id} variants={cardItem}>
              <PathCard
                key={p._id}
                path={p}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Previous
              </button>
              <span className="small">Page {page} of {totalPages}</span>
              <button className="btn secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
