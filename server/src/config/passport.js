import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User.js";

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user || null);
  } catch (e) {
    done(e, null);
  }
});

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "your_google_client_id") {
  console.warn("Google OAuth not configured — skipping Google strategy");
} else {

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      const name = profile.displayName || "Google User";
      const googleId = profile.id;

      if (!email) {
        return done(new Error("Google account did not return an email"), null);
      }

      // Link account by email if it exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          authProvider: "google",
          googleId
        });
      } else {
        // if user exists, attach google id if missing
        if (!user.googleId) user.googleId = googleId;
        if (user.authProvider === "local") {
          // keep local, but linked via googleId
        } else {
          user.authProvider = "google";
        }
        if (!user.name) user.name = name;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

}

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = process.env;

if (!GITHUB_CLIENT_ID || GITHUB_CLIENT_ID === "your_github_client_id") {
  console.warn("GitHub OAuth not configured — skipping GitHub strategy");
} else {
  passport.use(new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email", "read:user", "repo"] // Needed to read commits & repo data
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const name = profile.displayName || profile.username || "GitHub User";
        const githubId = profile.id;
        const githubUsername = profile.username;

        let user;
        if (email) {
          user = await User.findOne({ email });
        } else {
          user = await User.findOne({ githubId });
        }

        if (!user) {
          if (!email) {
            return done(new Error("GitHub account did not return a public email and is not linked yet"), null);
          }
          user = await User.create({
            name,
            email,
            authProvider: "github",
            githubId,
            githubUsername,
            githubAccessToken: accessToken
          });
        } else {
          if (!user.githubId) user.githubId = githubId;
          user.githubUsername = githubUsername;
          user.githubAccessToken = accessToken;
          if (user.authProvider !== "github") {
            // retain existing primary authProvider, but just link
          }
          if (!user.name) user.name = name;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}
