require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const Redis = require('ioredis');
const { fetchGitHubWrapped } = require('./github');

const app = express();
const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'commitmas-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:8000/auth/callback',
    scope: ['read:user', 'public_repo']
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      accessToken
    };
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['read:user', 'public_repo'] }));

app.get('/auth/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    console.log('AUTH CALLBACK SUCCESS - User:', req.user?.username);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

app.get('/auth/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.user.id,
    username: req.user.username,
    displayName: req.user.displayName,
    avatar: req.user.avatar
  });
});

app.get('/api/wrapped', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const cacheKey = `wrapped:${req.user.username}:${new Date().getFullYear()}`;
  
  try {
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Returning cached wrapped data');
      return res.json(JSON.parse(cached));
    }

    // Fetch fresh data from GitHub
    console.log('Fetching fresh wrapped data from GitHub');
    const wrappedData = await fetchGitHubWrapped(req.user.accessToken, req.user.username);
    
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(wrappedData));
    
    res.json(wrappedData);
  } catch (error) {
    console.error('Error fetching wrapped data:', error);
    res.status(500).json({ error: 'Failed to fetch wrapped data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Commitmas backend running on port ${PORT}`);
});

module.exports = app;
