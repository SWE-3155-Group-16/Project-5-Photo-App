const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Photo = require('./models/Photo');

const app = express();

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for photo storage with unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random suffix + original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `photo_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

app.use(express.json());

// Serve uploaded images statically
app.use('/images', express.static(imagesDir));

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
    res.json({
      message: 'Logged in',
      user: { _id: user._id, name: user.first_name + ' ' + user.last_name, first_name: user.first_name }
    });
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
    res.json({
      user: { _id: user._id, name: user.first_name + ' ' + user.last_name, first_name: user.first_name }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /photos/new — upload a new photo (auth required)
app.post('/photos/new', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo file provided' });
  }
  try {
    const newPhoto = await Photo.create({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.userId,
      comments: [],
    });
    res.status(201).json({
      _id: newPhoto._id,
      file_name: newPhoto.file_name,
      date_time: newPhoto.date_time,
      user_id: newPhoto.user_id,
    });
  } catch (err) {
    // Clean up uploaded file if DB save failed
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: 'Failed to save photo to database' });
  }
});

// GET photos for a user
app.get('/photosOfUser/:userId', requireAuth, async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.userId }).lean();
    const populatedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const comments = await Promise.all(
          (photo.comments || []).map(async (comment) => {
            const commentUser = await User.findById(comment.user_id).lean();
            return {
              ...comment,
              user: commentUser
                ? { _id: commentUser._id, first_name: commentUser.first_name, last_name: commentUser.last_name }
                : null,
            };
          })
        );
        return { ...photo, comments };
      })
    );
    res.json(populatedPhotos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET user list
app.get('/user/list', requireAuth, async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user
app.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, '-password -login_name').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Apply auth protection to all remaining admin routes
app.use('/admin', (req, res, next) => {
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  requireAuth(req, res, next);
});

// ...existing code...
