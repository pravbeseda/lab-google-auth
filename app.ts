import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as dotenv from "dotenv";

const app = express();
dotenv.config();

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// User serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Google OAuth 2.0 strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can save or process the user profile
      return done(null, profile);
    },
  ),
);

// Route to start authentication via Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Route to handle Google's callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication
    res.redirect("/");
  },
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Example of a protected route
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    res.send(`
      <h1>Hello, ${user.displayName}</h1>
      <p>Email: ${user.emails[0].value}</p>
      <img src="${user.photos[0].value}" alt="Avatar">
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(
      `You are not authenticated. <a href="/auth/google">Login with Google</a>`,
    );
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
