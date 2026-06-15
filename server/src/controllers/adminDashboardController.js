import { User } from "../models/User.js";
import Career from "../models/Career.js";
import University from "../models/University.js";
import DegreeProgram from "../models/DegreeProgram.js";
import { QuizQuestion } from "../models/QuizQuestion.js";
import Job from "../models/Job.js";

export async function getStats(req, res) {
  try {
    const [
      totalUsers,
      totalCareers,
      totalUniversities,
      totalPrograms,
      totalQuizQuestions,
      totalJobs,
    ] = await Promise.all([
      User.countDocuments(),
      Career.countDocuments({ isActive: true }),
      University.countDocuments(),
      DegreeProgram.countDocuments({ isActive: true }),
      QuizQuestion.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: true }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const recentJobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title company type createdAt");

    res.json({
      data: {
        stats: {
          totalUsers,
          totalCareers,
          totalUniversities,
          totalPrograms,
          totalQuizQuestions,
          totalJobs,
        },
        recentActivity: { recentUsers, recentJobs },
      },
      message: "Dashboard stats",
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
