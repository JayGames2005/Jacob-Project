# Discord Clone - Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### Step 2: Setup PostgreSQL Database

Make sure PostgreSQL is installed and running. Then create the database:

```powershell
# Open PostgreSQL command line
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE discord_clone;
\q
```

### Step 3: Configure Environment

Copy the example environment file and edit it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Update these values in `.env`:
- `DB_PASSWORD`: Your PostgreSQL password
- `JWT_SECRET`: A random secret key (keep it secret!)

### Step 4: Initialize Database

Run the database setup script:

```powershell
npm run setup
```

You should see:
```
✅ Database setup complete!
```

### Step 5: Start the Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

### Step 6: Open in Browser

Navigate to:
```
http://localhost:3000
```

## 📝 First Steps

1. **Register an account**
   - Click "Register" on the login page
   - Enter email, username, and password
   - You'll be automatically logged in

2. **Create your first server**
   - Click the "+" icon in the server list
   - Enter a server name
   - Click "Create"

3. **Start chatting**
   - Select the "general" channel
   - Type a message and press Enter

4. **Try voice chat**
   - Create a voice channel or use existing one
   - Click on the voice channel to join
   - Allow microphone access when prompted

## 🔧 Troubleshooting

### Database Connection Issues

If you see database errors:

1. Check PostgreSQL is running:
```powershell
Get-Service -Name postgresql*
```

2. Verify credentials in `.env` file

3. Ensure database exists:
```powershell
psql -U postgres -l
```

### Port Already in Use

If port 3000 is busy, change it in `.env`:
```
PORT=3001
```

### WebSocket Connection Errors

Make sure:
1. Server is running
2. No firewall blocking port 3000
3. Browser allows WebSocket connections

### Voice/Video Not Working

1. Grant microphone permissions in browser
2. Check browser console for WebRTC errors
3. Ensure HTTPS is used in production (required for WebRTC)

## 🎯 Features to Try

### Text Chat
- ✅ Send messages in real-time
- ✅ See typing indicators
- ✅ Emoji reactions (click emoji button)
- ✅ Create multiple channels

### Voice Chat
- ✅ Join voice channels
- ✅ Mute/unmute microphone
- ✅ See who's in voice
- ✅ Deafen audio

### Server Management
- ✅ Create servers
- ✅ Join with invite code
- ✅ Manage channels
- ✅ View members

## 🔒 Default Credentials

There are no default users. Register a new account to get started.

## 📊 Database Tables

After setup, these tables are created:
- `users` - User accounts
- `servers` - Discord servers/guilds
- `channels` - Text/voice channels
- `messages` - Chat messages
- `server_members` - Server membership
- `roles` - User roles
- `friend_requests` - Friend system
- `direct_messages` - DMs
- `voice_sessions` - Voice call logs
- `audit_logs` - Moderation logs

## 🌐 Production Deployment

### Backend (Node.js)

Deploy to Railway, Render, or Heroku:

```bash
# Install dependencies
npm install

# Set environment variables on hosting platform
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
NODE_ENV=production

# Build is not needed for Node.js
# Start command: npm start
```

### Database

Use managed PostgreSQL:
- **Railway**: Built-in PostgreSQL
- **Heroku**: Heroku Postgres
- **AWS**: RDS PostgreSQL
- **DigitalOcean**: Managed Databases

### Environment Variables for Production

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-key-change-this
ALLOWED_ORIGINS=https://yourdomain.com
```

### HTTPS & WebRTC

For voice/video to work in production:
1. Must use HTTPS
2. Configure proper STUN/TURN servers
3. Consider using services like:
   - Twilio STUN/TURN
   - Xirsys
   - AWS CloudFront

## 🤝 Support

If you encounter issues:

1. Check the console for errors
2. Verify all dependencies installed
3. Ensure PostgreSQL is running
4. Check firewall settings
5. Review environment variables

## 📚 Next Steps

- Add custom emojis
- Implement file uploads
- Add friend system
- Create direct messages
- Add role permissions
- Implement server bans/kicks
- Add message reactions
- Create threads
- Add status customization

Enjoy building your Discord clone! 🚀
