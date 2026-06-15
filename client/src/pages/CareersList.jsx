import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import CareerCard from "../components/CareerCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CareersList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [careers, setCareers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ stream: "", minSalary: "", maxSalary: "", demand: "", sort: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("compareCareerIds") || "[]"); }
    catch { return []; }
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchCareers = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: p, limit: 9 });
      if (filters.stream) params.set("stream", filters.stream);
      if (filters.minSalary) params.set("minSalary", filters.minSalary);
      if (filters.maxSalary) params.set("maxSalary", filters.maxSalary);
      if (filters.demand) params.set("demand", filters.demand);
      if (filters.sort) params.set("sort", filters.sort);

      const { data } = await api.get(`/api/careers?${params}`);
      setCareers(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load careers");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleSearch = useCallback(async (p = 1) => {
    const q = searchQuery.trim();
    if (!q) {
      setIsSearchMode(false);
      setPage(1);
      fetchCareers(1);
      return;
    }
    setLoading(true);
    setError("");
    setIsSearchMode(true);
    try {
      const { data } = await api.get(`/api/careers/search/${encodeURIComponent(q)}?page=${p}&limit=9`);
      setCareers(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, fetchCareers]);

  useEffect(() => {
    if (!isSearchMode) fetchCareers(page);
    else handleSearch(page);
  }, [page]);

  useEffect(() => {
    if (!isSearchMode) { setPage(1); fetchCareers(1); }
  }, [filters, fetchCareers]);

  useEffect(() => {
    if (user?._id) {
      api.get(`/api/careers/saved/${user._id}`)
        .then(({ data }) => setSavedIds(new Set(data.map((c) => c._id))))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("compareCareerIds", JSON.stringify(compareIds));
  }, [compareIds]);

  const toggleSave = async (careerId) => {
    if (!user?._id) return navigate("/login");
    try {
      if (savedIds.has(careerId)) {
        await api.delete(`/api/careers/${careerId}/save?userId=${user._id}`);
        setSavedIds((prev) => { const s = new Set(prev); s.delete(careerId); return s; });
      } else {
        await api.post(`/api/careers/${careerId}/save`, { userId: user._id });
        setSavedIds((prev) => new Set(prev).add(careerId));
      }
    } catch {}
  };

  const toggleCompare = (careerId) => {
    setCompareIds((prev) => {
      if (prev.includes(careerId)) return prev.filter((id) => id !== careerId);
      if (prev.length >= 3) return prev;
      return [...prev, careerId];
    });
  };

  const handleSearchSubmit = () => { setPage(1); handleSearch(1); };
  const handleFilterChange = (f) => { setFilters(f); setIsSearchMode(false); setSearchQuery(""); };
  const handlePageChange = (p) => setPage(p);

  return (
    <div className="careers-page">
      <motion.div
        className="careers-page-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Career Explorer</h1>
          <p className="page-subtitle">Find your dream career from our curated collection</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {compareIds.length > 0 && (
            <button className="btn" onClick={() => navigate("/careers/compare")}>
              Compare ({compareIds.length})
            </button>
          )}
          {user && (
            <button className="btn secondary" onClick={() => navigate("/careers/saved")}>
              Saved Careers
            </button>
          )}
          <button
            className="btn secondary career-filter-toggle"
            onClick={() => setShowFilters((p) => !p)}
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
        </div>
      </motion.div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
        placeholder="Search by career, skill, or keyword..."
      />

      {error && <div className="elig-error-banner">{error}</div>}

      <div className="careers-layout">
        {showFilters && (
          <>
            <div className="career-filter-overlay" onClick={() => setShowFilters(false)} />
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </>
        )}

        <div className="careers-main">
          {isSearchMode && (
            <p className="small" style={{ marginBottom: 8 }}>
              Showing results for "<strong>{searchQuery}</strong>" ({meta.total} found)
            </p>
          )}

          {loading ? (
            <div className="career-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="career-skeleton card" />
              ))}
            </div>
          ) : careers.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">🔍</span>
              <h3>No careers found</h3>
              <p className="small">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <motion.div className="career-grid" variants={container} initial="hidden" animate="show" key={`${page}-${JSON.stringify(filters)}`}>
              {careers.map((c) => (
                <motion.div key={c._id} variants={cardItem}>
                <CareerCard
                  key={c._id}
                  career={c}
                  onToggleSave={toggleSave}
                  isSaved={savedIds.has(c._id)}
                  onAddCompare={toggleCompare}
                  isCompared={compareIds.includes(c._id)}
                />
                </motion.div>
              ))}
            </motion.div>
          )}

          {meta.pages > 1 && (
            <div className="pagination">
              <button
                className="btn secondary"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                ← Prev
              </button>
              <span className="small">
                Page {meta.page} of {meta.pages}
              </span>
              <button
                className="btn secondary"
                disabled={page >= meta.pages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
