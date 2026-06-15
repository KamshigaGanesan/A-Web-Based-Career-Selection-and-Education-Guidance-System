import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { User } from "../models/User.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { GithubNotification } from "../models/GithubNotification.js";

// Helper to determine score
// Helper to determine score and identify issues
function getRepoMetadata(repo) {
  let score = 0;
  const errors = [];
  
  if (repo.description) {
    score += 20;
  } else {
    errors.push("Missing description");
  }

  if (repo.has_pages) {
    score += 10;
  }

  if (!repo.license) {
    errors.push("Missing license");
  }

  if (!repo.topics || repo.topics.length === 0) {
    errors.push("No topics/tags");
  }

  if (!repo.homepage) {
    errors.push("Missing homepage URL");
  }
  
  // Stars & forks give a boost up to 40
  const engagement = (repo.stargazers_count * 2) + (repo.forks_count * 3);
  score += Math.min(40, engagement);

  score += 30; // Base score
  return {
    score: Math.min(100, score),
    errors
  };
}


export async function analyzeProfile(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) {
       // fallback if email is used to find
       if (req.user?.email) {
          const userEx = await User.findOne({ email: req.user.email });
          if (userEx) {
            req.user.sub = userEx._id;
          } else {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
          }
       } else {
          return res.status(401).json({ message: "Unauthorized: No user ID payload" });
       }
    }

    const user = await User.findById(req.user?.sub || userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.githubAccessToken) {
      return res.status(400).json({ message: "User has not connected GitHub" });
    }

    // 0. Caching Check (1 hour)
    const ONE_HOUR = 60 * 60 * 1000;
    const forceRefresh = req.query.refresh === "true";
    const existingAnalysis = await GithubAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!forceRefresh && existingAnalysis && (Date.now() - new Date(existingAnalysis.createdAt).getTime() < ONE_HOUR)) {
      console.log(`Using cached analysis for ${existingAnalysis.username}`);
      const cached = existingAnalysis.toObject();
      return res.json({
        ...cached,
        profile: cached.profileData,
        isCached: true
      });
    }

    const token = user.githubAccessToken;
    const ax = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    // 1. Fetch Profile
    const profileRes = await ax.get("https://api.github.com/user");
    const profile = profileRes.data;

    // 2. Fetch Repos (first 100 max)
    const reposRes = await ax.get("https://api.github.com/user/repos?sort=updated&per_page=100");
    const repos = reposRes.data;

    // 3. Contribution Graph (Recent Events approximation)
    const eventsRes = await ax.get(`https://api.github.com/users/${profile.login}/events`);
    const events = eventsRes.data;
    
    const contributionsByDate = {};
    const repoContributions = {}; 
    let totalCommits = 0;

    events.forEach(ev => {
      if (ev.type === "PushEvent") {
        const date = ev.created_at.split("T")[0]; // YYYY-MM-DD
        const count = ev.payload.commits?.length || 0;
        const repoFull = ev.repo.name;

        contributionsByDate[date] = (contributionsByDate[date] || 0) + count;
        totalCommits += count;

        if (!repoContributions[repoFull]) repoContributions[repoFull] = {};
        repoContributions[repoFull][date] = (repoContributions[repoFull][date] || 0) + count;
      }
    });

    const languageCounts = {};
    const repoQuality = [];

    repos.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      const metadata = getRepoMetadata(repo);
      repoQuality.push({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        score: metadata.score,
        errors: metadata.errors,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updatedAt: repo.updated_at,
        recentActivity: repoContributions[repo.full_name] || {}
      });
    });

    repoQuality.sort((a, b) => b.score - a.score);

    // 3.5 Check READMEs for top 10 repos
    const topRepos = repoQuality.slice(0, 10);
    await Promise.all(topRepos.map(async (r) => {
      try {
        await ax.get(`https://api.github.com/repos/${profile.login}/${r.name}/readme`);
      } catch (err) {
        r.errors.push("Missing README.md");
        r.score = Math.max(0, r.score - 15); // Penalize score for missing README
      }
    }));

    const skills = Object.keys(languageCounts).sort((a, b) => languageCounts[b] - languageCounts[a]).slice(0, 10);

    const sortedDates = Object.keys(contributionsByDate).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let activeDays = sortedDates.length;

    if (sortedDates.length > 0) {
      let tempStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i - 1]);
        const d2 = new Date(sortedDates[i]);
        const diffDays = (d2 - d1) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const lastDate = new Date(sortedDates[sortedDates.length - 1]);
      const today = new Date();
      const diffToday = (today - lastDate) / (1000 * 60 * 60 * 24);
      if (diffToday <= 1.5) {
        currentStreak = tempStreak; 
      }
    }

    const chartData = {
      labels: sortedDates,
      datasets: [
        {
          label: "Commits",
          data: sortedDates.map(d => contributionsByDate[d]),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    const totalRepos = repos.length;
    const languageStats = Object.keys(languageCounts).map(lang => ({
      name: lang,
      count: languageCounts[lang],
      percentage: Math.round((languageCounts[lang] / totalRepos) * 100)
    })).sort((a, b) => b.count - a.count);

    let profileStrength = 0;
    profileStrength += Math.min(20, profile.followers * 2);
    profileStrength += Math.min(20, profile.public_repos);
    profileStrength += Math.min(30, activeDays * 2);
    profileStrength += Math.min(30, (repoQuality[0]?.score || 0) / 3.3);
    profileStrength = Math.round(profileStrength);

    // 4. AI Suggestions using Gemini
    let aiInsights = {
      developerPersonality: "Code Crafter",
      hiringReadinessScore: 50,
      improvementSuggestions: [
        { category: "Portfolio", text: "AI Analysis currently unavailable. Please try again later." }
      ],
      readmeRecommendations: ["Add more detailed documentation to your top repositories."],
      learningRoadmap: [{ skill: "Advanced Architecture", reason: "Broaden your technical depth." }],
      resumeSkills: skills,
      careerPath: "Developer",
      isAiQuotaExceeded: false
    };

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key") {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `
          Analyze this GitHub user profile and their top repositories. 
          Return a JSON object with the following fields: 
          - developerPersonality: A creative 2-word title (e.g. "Rapid Prototyper", "Documentation Wizard").
          - hiringReadinessScore: Number 0-100.
          - improvementSuggestions: Array of {category, text} (categories: "Portfolio", "Code", "Community").
          - readmeRecommendations: Array of specific suggestions for their READMEs.
          - learningRoadmap: Array of {skill, reason} based on what's missing.
          - resumeSkills: Array of top 8 technical skills extracted.
          - careerPath: A string (e.g. "Fullstack Developer", "Frontend Expert").

          User Stats:
          - Followers: ${profile.followers}
          - Public Repos: ${profile.public_repos}
          - Total Commits (30d): ${totalCommits}
          - Active Days (30d): ${activeDays}
          - Top Skills: ${skills.join(", ")}
          
          Top Repositories (Quality Scores):
          ${repoQuality.slice(0, 5).map(r => `- ${r.name}: ${r.score}/100 (Stars: ${r.stars}, Desc: ${r.description || "None"})`).join("\n")}
        `;

        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const responseText = result.text || "";
        if (responseText) {
          const cleaned = responseText.replace(/```json|```/gi, "").trim();
          const parsed = JSON.parse(cleaned);
          aiInsights = { ...aiInsights, ...parsed };
        }
      } catch (geminiErr) {
        console.error("Gemini AI Error:", geminiErr.message || geminiErr);
        if (geminiErr.message?.includes("429") || geminiErr.message?.includes("quota")) {
           aiInsights.isAiQuotaExceeded = true;
           aiInsights.developerPersonality = "AI Exhausted";
        }
      }
    }

    const responseData = {
      profile: {
        login: profile.login,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        followers: profile.followers,
        public_repos: profile.public_repos,
        bio: profile.bio
      },
      skills,
      languageStats,
      repoQuality: repoQuality.slice(0, 10),
      chartData,
      stats: {
        totalCommits,
        activeDays,
        currentStreak,
        longestStreak,
        profileStrength
      },
      aiInsights
    };

    // Save to history automatically if not cached
    try {
      await GithubAnalysis.create({
        userId,
        username: profile.login,
        profileData: responseData.profile,
        stats: responseData.stats,
        aiInsights: responseData.aiInsights,
        repoQuality: responseData.repoQuality,
        languageStats: responseData.languageStats,
        chartData: responseData.chartData
      });
    } catch (saveErr) {
      console.warn("Failed to auto-save analysis:", saveErr.message);
    }

    res.json(responseData);

  } catch (error) {
    console.error("GitHub Analyzer Error:", error.response?.data || error);
    next(error);
  }
}

export async function saveToken(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) {
       if (req.user?.email) {
          const userEx = await User.findOne({ email: req.user.email });
          if (userEx) {
            req.user.sub = userEx._id;
          } else {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
          }
       } else {
          return res.status(401).json({ message: "Unauthorized: No user ID payload" });
       }
    }

    const user = await User.findById(req.user?.sub || userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    user.githubAccessToken = token;
    await user.save();
    return res.json({ message: "GitHub token saved successfully" });
  } catch (error) {
    next(error);
  }
}

export async function saveAnalysis(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { profile, stats, aiInsights, repoQuality, languageStats } = req.body;
    
    const analysis = new GithubAnalysis({
      userId,
      username: profile.login,
      profileData: profile,
      stats,
      aiInsights,
      repoQuality,
      languageStats
    });

    await analysis.save();
    res.json({ message: "Analysis saved successfully", id: analysis._id });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const history = await GithubAnalysis.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
}

export async function analyzeRepo(req, res, next) {
  try {
    const { owner, repo } = req.params;
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ message: "GitHub connection required" });
    }

    const ax = axios.create({
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    const repoRes = await ax.get(`https://api.github.com/repos/${owner}/${repo}`);
    const repoData = repoRes.data;

    let readme = "";
    try {
      const readmeRes = await ax.get(`https://api.github.com/repos/${owner}/${repo}/readme`);
      const readmeEncoded = readmeRes.data.content;
      readme = Buffer.from(readmeEncoded, "base64").toString("utf-8");
    } catch (e) {
      readme = "No README found.";
    }

    let repoInsights = {
      summary: "",
      suggestionsSummary: "",
      readmeQuality: "Medium",
      complexityScore: 50,
      testDetection: "No tests found",
      suggestions: []
    };

    let generatedReadme = "";
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key") {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let prompt = `
          Analyze this GitHub repository: "${repoData.name}" by "${owner}".
          Description: ${repoData.description || "No description"}
          Primary Language: ${repoData.language || "Unknown"}
          
          README Content (Snippet):
          ${readme.slice(0, 2000)}
          
          Return a JSON object with:
          - summary: A concise 1-2 sentence overview of what this project does and its technical purpose.
          - suggestionsSummary: A concise paragraph summarizing the key code and structure improvements needed.
          - readmeQuality: "High", "Medium", or "Low".
          - complexityScore: 0-100.
          - testDetection: A short string (e.g. "Found Vitest/Jest", "No tests found").
          - suggestions: Array of strings for improvements.
        `;

        if (readme === "No README found." || readme.length < 50) {
           prompt += `
           CRITICAL: This repository is missing a proper README.md. 
           Please also include a field "generatedReadme" in the JSON object with a high-quality, professional README.md content in markdown format. 
           The README should include: Project Title, Description, Features, Technologies Used, and a template for Installation/Usage.
           `;
        }

        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const responseText = result.text || "";
        if (responseText) {
          const cleaned = responseText.replace(/```json|```/gi, "").trim();
          const parsed = JSON.parse(cleaned);
          repoInsights = { ...repoInsights, ...parsed };
          if (parsed.generatedReadme) generatedReadme = parsed.generatedReadme;
        }
      } catch (geminiErr) {
        console.error("Gemini Repo AI Error:", geminiErr.message || geminiErr);
      }
    }

    res.json({
      repoData: {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        html_url: repoData.html_url,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        license: repoData.license?.name,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at
      },
      repoInsights,
      generatedReadme
    });

  } catch (error) {
    console.error("Analyze Repo Error:", error.response?.data || error);
    next(error);
  }
}

export async function updateNotificationSettings(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    const { enabled, time } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

 user.githubNotificationEnabled = enabled;
 if (time) user.githubNotificationTime = time;

 await user.save();
    res.json({ message: "Notification settings updated successfully", settings: { enabled: user.githubNotificationEnabled, time: user.githubNotificationTime } });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationList(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ message: "GitHub connection required" });
    }

    const ax = axios.create({
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json"
      }
    });


    // Fetch GitHub events (includes pushes)
    const username = user.githubUsername || (await ax.get("https://api.github.com/user")).data.login;
    const eventsRes = await ax.get(`https://api.github.com/users/${username}/events`);
    const events = eventsRes.data;

    const newNotifications = [];
    for (const ev of events) {
      if (ev.type === "PushEvent" || ev.type === "PullRequestEvent" || ev.type === "IssuesEvent") {
        const existing = await GithubNotification.findOne({ githubEventId: ev.id });
        if (!existing) {
          let message = "";
          if (ev.type === "PushEvent") {
            message = `Pushed ${ev.payload.commits?.length || 0} commits to ${ev.repo.name}`;
          } else if (ev.type === "PullRequestEvent") {
            message = `${ev.payload.action} pull request in ${ev.repo.name}`;
          } else if (ev.type === "IssuesEvent") {
             message = `${ev.payload.action} issue in ${ev.repo.name}`;
          }

          const notif = await GithubNotification.create({
            userId,
            githubEventId: ev.id,
            type: ev.type,
            repoName: ev.repo.name,
            message,
            actor: ev.actor.login,
            createdAt: ev.created_at
          });
          newNotifications.push(notif);
        }
      }
    }

    const history = await GithubNotification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    console.error("Fetch Notifications Error:", error.response?.data || error);
    next(error);
  }
}

