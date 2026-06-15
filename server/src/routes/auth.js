import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const isGoogleOAuthConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id" &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_CALLBACK_URL);

function redirectWithAuthError(res, route, errorCode) {
  const safeRoute = route === "register" ? "register" : "login";
  return res.redirect(`${clientUrl}/${safeRoute}?authError=${encodeURIComponent(errorCode)}`);
}

function hasGoogleStrategy() {
  return typeof passport._strategy === "function" && Boolean(passport._strategy("google"));
}

// Local register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.authProvider === "google" && !existing.passwordHash) {
        return res.status(409).json({
          message: "This email is already registered with Google. Continue with Google to sign in."
        });
      }
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      authProvider: "local"
    });

    // Send Welcome Email
    try {
      await sendEmail(
        user.email,
        "Welcome to Career Guidance!",
        `Hi ${user.name},\n\nWelcome to Career Guidance! We're excited to help you discover your ideal career path.\n\nBest regards,\nThe Team`
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    next(e);
  }
});

// Local login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.passwordHash) {
      return res.status(400).json({
        message: "This account uses Google sign-in. Continue with Google to login."
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    next(e);
  }
});

// Google OAuth start
router.get("/google", (req, res, next) => {
  const mode = req.query.mode === "register" ? "register" : "login";
  if (!isGoogleOAuthConfigured || !hasGoogleStrategy()) {
    return redirectWithAuthError(res, mode, "google_not_configured");
  }
  return passport.authenticate("google", { scope: ["profile", "email"], state: mode })(req, res, next);
});

// Google OAuth callback
router.get("/google/callback",
  (req, res, next) => {
    const mode = req.query.state === "register" ? "register" : "login";
    if (!hasGoogleStrategy()) {
      return redirectWithAuthError(res, mode, "google_not_configured");
    }
    return next();
  },
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  async (req, res, next) => {
    try {
      const token = signToken(req.user);
      // Redirect back to frontend with token
      return res.redirect(`${clientUrl}/oauth-success?token=${encodeURIComponent(token)}`);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/google/failure", (req, res) => {
  const mode = req.query.state === "register" ? "register" : "login";
  return redirectWithAuthError(res, mode, "google_auth_failed");
});

const isGitHubOAuthConfigured =
  Boolean(process.env.GITHUB_CLIENT_ID) &&
  process.env.GITHUB_CLIENT_ID !== "your_github_client_id" &&
  Boolean(process.env.GITHUB_CLIENT_SECRET) &&
  Boolean(process.env.GITHUB_CALLBACK_URL);

function hasGitHubStrategy() {
  return typeof passport._strategy === "function" && Boolean(passport._strategy("github"));
}

// GitHub OAuth start
router.get("/github", (req, res, next) => {
  const mode = req.query.mode === "register" ? "register" : "login";
  if (!isGitHubOAuthConfigured || !hasGitHubStrategy()) {
    return redirectWithAuthError(res, mode, "github_not_configured");
  }
  return passport.authenticate("github", { scope: ["user:email", "read:user", "repo"], state: mode })(req, res, next);
});

// GitHub OAuth callback
router.get("/github/callback",
  (req, res, next) => {
    const mode = req.query.state === "register" ? "register" : "login";
    if (!hasGitHubStrategy()) {
      return redirectWithAuthError(res, mode, "github_not_configured");
    }
    return next();
  },
  passport.authenticate("github", { failureRedirect: "/auth/github/failure" }),
  async (req, res, next) => {
    try {
      const token = signToken(req.user);
      return res.redirect(`${clientUrl}/oauth-success?token=${encodeURIComponent(token)}&provider=github`);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/github/failure", (req, res) => {
  const mode = req.query.state === "register" ? "register" : "login";
  return redirectWithAuthError(res, mode, "github_auth_failed");
});

// Example protected endpoint
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, authProvider: user.authProvider, githubNotificationEnabled: user.githubNotificationEnabled, githubNotificationTime: user.githubNotificationTime });
  } catch (e) {
    next(e);
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    // Generete reset token
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail(user.email, "Password Reset Request", text);

    res.json({ message: "Password reset link sent to your email" });
  } catch (e) {
    next(e);
  }
});

// Reset Password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Password reset token is invalid or has expired" });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
