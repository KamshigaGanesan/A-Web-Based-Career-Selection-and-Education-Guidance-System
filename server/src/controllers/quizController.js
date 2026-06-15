import { QuizQuestion } from "../models/QuizQuestion.js";
import { QuizResult } from "../models/QuizResult.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/email.js";

export async function getQuestions(req, res) {
  try {
    const { stream } = req.query;
    const filter = { isActive: true };

    if (stream) {
      filter.stream = { $in: [stream, "Common"] };
    }

    const questions = await QuizQuestion.find(filter).sort({ order: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch questions" });
  }
}

export async function submitQuiz(req, res) {
  try {
    const { userId, stream, answers } = req.body;

    if (!userId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "userId and answers are required" });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: "One or more questionIds are invalid" });
    }

    const questionMap = {};
    for (const q of questions) {
      questionMap[q._id.toString()] = q;
    }

    const scoreBreakdown = {};

    for (const answer of answers) {
      const question = questionMap[answer.questionId];
      if (!question) continue;

      if (answer.selectedOptionIndex < 0 || answer.selectedOptionIndex >= question.options.length) {
        return res.status(400).json({
          message: `Invalid option index ${answer.selectedOptionIndex} for question ${answer.questionId}`,
        });
      }

      const chosenOption = question.options[answer.selectedOptionIndex];
      for (const wt of chosenOption.weightTags) {
        scoreBreakdown[wt.tag] = (scoreBreakdown[wt.tag] || 0) + wt.value;
      }
    }

    const sorted = Object.entries(scoreBreakdown).sort((a, b) => b[1] - a[1]);
    const topCareers = sorted.slice(0, 5).map(([careerTag, score]) => ({ careerTag, score }));

    const result = await QuizResult.create({
      userId,
      answers,
      scoreBreakdown,
      topCareers,
      stream: stream || null,
      totalQuestions: answers.length,
    });

    // Send Quiz Results to Email
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        const careerList = topCareers.map(c => `${c.careerTag}`).join(", ");
        await sendEmail(
          user.email,
          "Your Quiz Results - Career Guidance",
          `Hi ${user.name},\n\nYou've successfully completed the career guidance quiz!\n\nBased on your answers, here are your top career recommendations:\n\n${careerList}\n\nLogin to your dashboard to see the full analysis.\n\nBest regards,\nThe Team`
        );
      }
    } catch (emailError) {
      console.error("Failed to send quiz result email:", emailError);
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit quiz" });
  }
}

export async function getQuizHistory(req, res) {
  try {
    const { userId } = req.params;
    const results = await QuizResult.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch quiz history" });
  }
}

export async function getQuizResultById(req, res) {
  try {
    const result = await QuizResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    const questionIds = result.answers.map((a) => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    res.json({ result, questions });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch quiz result" });
  }
}
