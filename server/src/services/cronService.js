import cron from "node-cron";
import { User } from "../models/User.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { GithubNotification } from "../models/GithubNotification.js";
import { sendEmail } from "../utils/email.js";

export const initCronJobs = () => {
  // Check every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    try {
      const usersToNotify = await User.find({
        githubNotificationEnabled: true,
        githubNotificationTime: currentTime
      });

      if (usersToNotify.length === 0) return;

      console.log(`[Cron] Sending ${usersToNotify.length} GitHub notifications for ${currentTime}`);

      for (const user of usersToNotify) {
        // Fetch last analysis to get some stats
        const lastAnalysis = await GithubAnalysis.findOne({ userId: user._id }).sort({ createdAt: -1 });
        
        // Fetch recent repo activity
        const recentActivity = await GithubNotification.find({ 
          userId: user._id, 
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        }).sort({ createdAt: -1 });

        let message = `Hi ${user.name},\n\nThis is your daily GitHub profile summary.\n\n`;
        
        if (lastAnalysis) {
          message += `Profile Strength: ${lastAnalysis.stats?.profileStrength || "N/A"}/100\n`;
          message += `Recent Commits: ${lastAnalysis.stats?.totalCommits || 0}\n`;
          message += `Top Career Path: ${lastAnalysis.aiInsights?.careerPath || "Checking..."}\n\n`;
        }

        if (recentActivity.length > 0) {
          message += `Recent Repository Activity:\n`;
          recentActivity.forEach(notif => {
            message += `- ${notif.message} (${new Date(notif.createdAt).toLocaleTimeString()})\n`;
          });
          message += `\n`;
        }

        message += `View your full dashboard: ${process.env.CLIENT_URL || 'http://localhost:5173'}/github-analyzer\n\n`;
        message += `Best regards,\nThe Team`;

        await sendEmail(user.email, "Daily GitHub Profile Report", message);
      }
    } catch (error) {
      console.error("[Cron Error]", error);
    }
  });

  console.log("Cron jobs initialized");
};
