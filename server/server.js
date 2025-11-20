require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const db = require('./database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serverRoutes = require('./routes/servers');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const { authenticateToken } = require('./middleware/auth');
const socketHandler = require('./socket');

const app = express();

// Trust proxy for Railway/production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/servers', authenticateToken, serverRoutes);
app.use('/api/channels', authenticateToken, channelRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Serve main app
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/app.html'));
});

// WebSocket handling
socketHandler(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    db.end();
    console.log('HTTP server closed');
  });
});
