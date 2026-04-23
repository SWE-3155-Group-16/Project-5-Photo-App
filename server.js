const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Login endpoint
app.post('/admin/login', async (req, res) => {
  const { login_name, password } = req.body;
  try {
    const user = await User.findOne({ login_name });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.json({ message: 'Logged in', user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
app.post('/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Get current user
app.get('/admin/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.json({ user: { name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply auth protection to all routes except login/logout
app.use('/admin', (req, res, next) => {
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  requireAuth(req, res, next);
});

// ...existing code...
