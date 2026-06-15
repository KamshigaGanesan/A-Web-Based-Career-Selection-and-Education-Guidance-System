import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function QuizReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/api/quiz/result/${id}`);
        setResult(data.result);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load review data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="quiz-spinner" />
          <p className="small" style={{ marginTop: 16 }}>Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="quiz-page">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p className="error">{error || "Result not found"}</p>
          <button className="btn secondary" style={{ marginTop: 16 }} onClick={() => navigate("/quiz")}>
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  const questionMap = {};
  for (const q of questions) {
    questionMap[q._id] = q;
  }

  return (
    <div className="quiz-page">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Quiz Review</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={() => navigate(`/quiz/result/${id}`)}>
              Back to Results
            </button>
            <button className="btn" onClick={() => navigate("/quiz")}>
              Retake Quiz
            </button>
          </div>
        </div>
        <p className="small">
          {result.totalQuestions} questions answered
          {result.stream && <> | {result.stream} Stream</>}
          {" | "}
          {new Date(result.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="quiz-review-list">
        {result.answers.map((answer, idx) => {
          const question = questionMap[answer.questionId];
          if (!question) return null;

          return (
            <div className="card quiz-review-item" key={answer.questionId} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="quiz-q-number">{idx + 1}</div>
              <h3 className="quiz-q-text">{question.questionText}</h3>
              <div className="quiz-review-options">
                {question.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`quiz-review-option ${optIdx === answer.selectedOptionIndex ? "quiz-review-option-selected" : ""}`}
                  >
                    <span className="quiz-option-letter">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt.text}</span>
                    {optIdx === answer.selectedOptionIndex && (
                      <span className="quiz-review-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
