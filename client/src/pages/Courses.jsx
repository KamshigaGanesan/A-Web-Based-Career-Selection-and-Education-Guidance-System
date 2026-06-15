import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, API_URL } from "../lib/api.js";
import { CATEGORIES } from "../lib/categories.js";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    api
      .get("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !activeCategory || c.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="quiz-spinner" />
        <p className="small">Loading courses...</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="page-header-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">Browse our curated collection of career-building courses</p>
        </div>
      </motion.div>

      <motion.div
        className="search-bar"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search courses by name, category, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </motion.div>

      <motion.div
        className="filter-bar"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <button
          className={`filter-chip ${!activeCategory ? "filter-chip-active" : ""}`}
          onClick={() => setActiveCategory("")}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`filter-chip ${activeCategory === cat.value ? "filter-chip-active" : ""}`}
            onClick={() => setActiveCategory(activeCategory === cat.value ? "" : cat.value)}
          >
            <span>{cat.icon}</span> {cat.value}
          </button>
        ))}
      </motion.div>

      {(search || activeCategory) && (
        <motion.p
          className="small results-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Showing {filtered.length} of {courses.length} courses
          {activeCategory && <> in <strong>{activeCategory}</strong></>}
          {search && <> matching "<strong>{search}</strong>"</>}
        </motion.p>
      )}

      {!courses.length ? (
        <div className="empty-state card">
          <span className="empty-icon">📭</span>
          <h3>No courses available yet</h3>
          <p className="small">Be the first to add a course!</p>
          <Link className="btn" to="/add-course" style={{ marginTop: 12 }}>
            Add First Course
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">🔍</span>
          <h3>No courses found</h3>
          <p className="small">Try a different search term or category filter.</p>
          <button
            className="btn secondary"
            style={{ marginTop: 12 }}
            onClick={() => { setSearch(""); setActiveCategory(""); }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          className="course-grid"
          variants={container}
          initial="hidden"
          animate="show"
          key={`${search}-${activeCategory}`}
        >
          {filtered.map((c) => (
            <motion.div key={c._id} variants={item}>
              <Link to={`/courses/${c._id}`} className="course-card">
                {c.image ? (
                  <img src={`${API_URL}${c.image}`} alt={c.name} className="course-card-img" />
                ) : (
                  <div className="course-card-img-placeholder">📚</div>
                )}
                <div className="course-card-body">
                  <span className="pill">{c.category}</span>
                  <h3 className="course-card-title">{c.name}</h3>
                  <div className="course-card-meta">
                    <span>⏱️ {c.duration}</span>
                    <span>💰 {c.fees}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
