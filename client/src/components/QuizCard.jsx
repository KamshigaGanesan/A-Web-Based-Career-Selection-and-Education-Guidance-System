import React from "react";

export default function QuizCard({ question, questionNumber, selectedOptionIndex, onSelect }) {
  return (
    <div className="quiz-card-inner">
      <div className="quiz-q-number">{questionNumber}</div>
      <h3 className="quiz-q-text">{question.questionText}</h3>
      <div className="quiz-options">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            className={`quiz-option ${selectedOptionIndex === idx ? "quiz-option-selected" : ""}`}
            onClick={() => onSelect(idx)}
          >
            <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
