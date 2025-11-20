# Discord Clone - Vanilla JavaScript & HTML

A real-time communication platform built with pure JavaScript, HTML, CSS, Node.js, and Express.

## ⚠️ Important: Database Required

This app requires **PostgreSQL** to be installed and running. If you don't have PostgreSQL:

### Option 1: Install PostgreSQL (Recommended)
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for `postgres` user
4. Follow setup instructions below

### Option 2: Use a Simpler Version
If you just want to test the app without PostgreSQL, check `SQLITE_VERSION.md` for a no-database-required version (coming soon).

## 🚀 Features

- **Real-time messaging** with WebSocket
- **User authentication** (login/register)
- **Servers and channels**
- **Voice/Video calls** with WebRTC
- **Friend system**
- **File uploads** (images, videos)
- **Emoji reactions**
- **Online status**
- **Direct messages**

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Socket.io for WebSockets
- PostgreSQL database
- JWT authentication
- Multer for file uploads

**Frontend:**
- Pure HTML5
- Vanilla JavaScript (ES6+)
- CSS3 (custom styling)
- Socket.io client
- WebRTC for voice/video

## 📁 Project Structure

```
discord-clone/
├── server/               # Backend
│   ├── server.js        # Main server file
│   ├── database.js      # Database connection
│   ├── auth.js          # Authentication logic
│   └── socket.js        # WebSocket handlers
├── public/              # Frontend (served statically)
│   ├── index.html       # Login page
│   ├── app.html         # Main app
│   ├── css/
│   │   └── style.css    # Styles
│   └── js/
│       ├── app.js       # Main app logic
│       ├── auth.js      # Login/register
│       ├── chat.js      # Chat functionality
│       └── voice.js     # WebRTC voice/video
└── uploads/             # User uploaded files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- PostgreSQL installed and running

### Installation

1. **Clone and setup:**
```bash
cd "d:\Jacob Project"
npm install
```

2. **Configure database:**
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE discord_clone;
\q

# Run database setup
node server/setup-db.js
```

3. **Create .env file:**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start the server:**
```bash
npm start
```

5. **Open in browser:**
```
http://localhost:3000
```

## 📝 Database Schema

See `server/schema.sql` for complete database structure.

## 🎮 Usage

1. Register a new account or login
2. Create a server or join with invite code
3. Create channels in your server
4. Start chatting!
5. Click voice channel to join voice/video call

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Input sanitization
- Rate limiting on API endpoints
- File upload validation

## 📦 NPM Scripts

```bash
npm start        # Start server
npm run dev      # Start with nodemon (auto-reload)
npm run setup    # Setup database
```

## 🌐 API Endpoints

```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
GET    /api/users/me         # Get current user
POST   /api/servers          # Create server
GET    /api/servers/:id      # Get server
POST   /api/channels         # Create channel
GET    /api/messages/:id     # Get messages
```

## 🎯 WebSocket Events

```javascript
// Client → Server
'message:send'         // Send message
'typing:start'         // User typing
'voice:join'           // Join voice channel

// Server → Client
'message:new'          // New message received
'user:online'          // User came online
'voice:user-joined'    // User joined voice
```

## 📄 License

MIT
