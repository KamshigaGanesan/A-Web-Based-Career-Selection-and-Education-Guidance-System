import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, API_URL } from "../lib/api.js";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch(() => setError("Course not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  if (error || !course) {
    return (
      <div className="card">
        <h2>Not Found</h2>
        <p className="small">{error || "This course does not exist."}</p>
        <Link className="btn" to="/courses">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/courses" className="small" style={{ display: "inline-block", marginBottom: 12 }}>
        &larr; Back to Courses
      </Link>

      <div className="card">
        {course.image && (
          <img
            src={`${API_URL}${course.image}`}
            alt={course.name}
            className="detail-img"
          />
        )}

        <div style={{ marginTop: 16 }}>
          <span className="pill">{course.category}</span>
          <h2 style={{ marginTop: 8, marginBottom: 4 }}>{course.name}</h2>

          <div className="detail-meta">
            <div className="detail-meta-item">
              <span className="small">Duration</span>
              <strong>{course.duration}</strong>
            </div>
            <div className="detail-meta-item">
              <span className="small">Fees</span>
              <strong>{course.fees}</strong>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>About this Course</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{course.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
