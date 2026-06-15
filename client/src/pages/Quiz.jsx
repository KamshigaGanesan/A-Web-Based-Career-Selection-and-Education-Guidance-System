import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import QuizCard from "../components/QuizCard.jsx";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];

export default function Quiz() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stream, setStream] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const fetchQuestions = useCallback(async (selectedStream) => {
    setLoading(true);
    setError("");
    try {
      const params = selectedStream ? { stream: selectedStream } : {};
      const { data } = await api.get("/api/quiz/questions", { params });
      if (data.length === 0) {
        setError("No questions available. Please seed the database first.");
      }
      setQuestions(data);
      setSelectedAnswers({});
      setCurrentIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("quiz_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.answers && parsed.stream !== undefined) {
          setSelectedAnswers(parsed.answers);
          setStream(parsed.stream);
          setCurrentIndex(parsed.currentIndex || 0);
          setStarted(true);
          fetchQuestions(parsed.stream);
        }
      } catch { /* ignore corrupt data */ }
    }
  }, [fetchQuestions]);

  useEffect(() => {
    if (started && questions.length > 0 && Object.keys(selectedAnswers).length > 0) {
      localStorage.setItem("quiz_progress", JSON.stringify({
        answers: selectedAnswers,
        stream,
        currentIndex,
      }));
    }
  }, [selectedAnswers, stream, currentIndex, started, questions.length]);

  function handleStart() {
    setStarted(true);
    fetchQuestions(stream);
  }

  function handleSelect(questionId, optionIndex) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  }

  function prevQuestion() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  async function handleSubmit() {
    if (!user) {
      setError("Please log in to submit the quiz.");
      return;
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      setError(`Please answer all questions (${answeredCount}/${questions.length} answered)`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const answers = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id],
      }));

      const { data } = await api.post("/api/quiz/submit", {
        userId: user.id || user.sub || user._id,
        stream: stream || undefined,
        answers,
      });

      localStorage.removeItem("quiz_progress");
      navigate(`/quiz/result/${data._id}`, { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setStarted(false);
    setStream("");
    setError("");
    localStorage.removeItem("quiz_progress");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!started) {
    return (
      <motion.div
        className="quiz-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card quiz-start-card">
          <motion.div
            className="quiz-start-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            🎯
          </motion.div>
          <h1 style={{ margin: "0 0 8px" }}>Career Assessment</h1>
          <p className="small" style={{ maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7 }}>
            Discover your ideal career path by answering questions tailored to your interests,
            skills, and personality. Choose your stream to get relevant questions, or take the general quiz.
          </p>

          <div className="quiz-stream-select">
            <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>Select Your Stream (optional)</label>
            <div className="filter-bar" style={{ justifyContent: "center" }}>
              <button
                className={`filter-chip ${stream === "" ? "filter-chip-active" : ""}`}
                onClick={() => setStream("")}
              >
                All Streams
              </button>
              {STREAMS.map((s) => (
                <button
                  key={s}
                  className={`filter-chip ${stream === s ? "filter-chip-active" : ""}`}
                  onClick={() => setStream(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
            <motion.button className="btn" onClick={handleStart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              Start Assessment
            </motion.button>
            {user && (
              <button className="btn secondary" onClick={() => navigate(`/quiz/history/${user.id || user.sub || user._id}`)}>
                View History
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <div className="quiz-spinner" />
          <p className="small" style={{ marginTop: 16 }}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p className="error">{error}</p>
          <button className="btn secondary" style={{ marginTop: 16 }} onClick={handleRetake}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="quiz-page">
      <div className="card">
        <div className="quiz-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ margin: 0 }}>Career Assessment Quiz</h2>
            {stream && <span className="pill">{stream} Stream</span>}
          </div>
          <p className="small">Answer honestly to discover your ideal career path.</p>
        </div>
        <ProgressBar current={answeredCount} total={questions.length} />
      </div>

      <AnimatePresence mode="wait">
        {currentQuestion && (
        <motion.div
          className="card quiz-question quiz-question-active"
          key={currentQuestion._id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <QuizCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionIndex={selectedAnswers[currentQuestion._id] ?? null}
            onSelect={(optIdx) => handleSelect(currentQuestion._id, optIdx)}
          />
        </motion.div>
      )}
      </AnimatePresence>

      <div className="card quiz-submit-bar">
        <div className="quiz-nav-dots">
          {questions.map((q, i) => (
            <button
              key={q._id}
              className={`quiz-dot ${selectedAnswers[q._id] !== undefined ? "quiz-dot-done" : ""} ${i === currentIndex ? "quiz-dot-current" : ""}`}
              onClick={() => setCurrentIndex(i)}
              title={`Question ${i + 1}`}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn secondary" onClick={prevQuestion} disabled={currentIndex === 0}>
            Back
          </button>
          {isLastQuestion && allAnswered ? (
            <button className="btn" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Get My Results"}
            </button>
          ) : (
            <button className="btn" onClick={nextQuestion} disabled={isLastQuestion}>
              Next
            </button>
          )}
        </div>
      </div>

      {error && <p className="error" style={{ textAlign: "center" }}>{error}</p>}
    </div>
  );
}
