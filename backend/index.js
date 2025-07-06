const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./config/db');
const {
  User, Admin, Event, Venue, Shift,
  Package, Menu, Booking, Otp
} = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;









setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: (used.rss / 1024 / 1024).toFixed(2) + ' MB',
    heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
    heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
  });
}, 60000);
// 🌐 Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://aonetwocafe.netlify.app',
  'https://vbs-frontend-7m23kse0k-niranjan-sahs-projects.vercel.app',
  'https://noded.harshchaudhary.com.np', // ✅ Add this
  process.env.FRONTEND_URL,
].filter(Boolean);



app.use(
  session({
    store: new FileStore({ path: './sessions' }),
    secret: process.env.SESSION_SECRET || 'aonecafe',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }, // Set to true if using HTTPS
  })
);


// ✅ CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'licencia-type'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// ✅ Express middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));


// ✅ View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: Number(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// ✅ Test DB connection
db.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ DB connection error:', err));

// ✅ Sync models
async function syncDatabase() {
  try {
    await User.sync();
    await Event.sync();
    await Venue.sync();
    await Shift.sync();
    await Package.sync();
    await Admin.sync();
    await Otp.sync();
    await Menu.sync();
    await Booking.sync();
    console.log('✅ Models synchronized');
  } catch (error) {
    console.error('❌ Model sync error:', error);
    process.exit(1);
  }
}

// ✅ Routes
const adminRoutes = require('./routes/admin');
const welcomeRoutes = require('./routes/welcomeRoutes');
const adminuserRoutes = require('./routes/adminUsersRoutes');
const userRoutes = require('./routes/users');

app.get('/', (req, res) => {
  res.send('🎉 Welcome to the API!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/admin/book', welcomeRoutes);
app.use('/admin/auth', adminuserRoutes);
app.use('/api', userRoutes);

// ✅ Test session route
app.get('/session', (req, res) => {
  res.send(req.session.user ? '✅ Session active' : '⚠️ No active session');
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('🚫 Page not found');
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ✅ Start server
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
