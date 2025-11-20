# Troubleshooting Guide

Common issues and solutions for the Discord Clone application.

## 🔴 Installation Issues

### "npm install" fails

**Problem**: Dependencies fail to install

**Solutions**:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
Remove-Item -Recurse -Force node_modules
npm install

# Use specific Node version (20+)
node --version  # Should be v20 or higher
```

### PostgreSQL not found

**Problem**: `psql: command not found`

**Solutions**:
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Add PostgreSQL to PATH:
   - Default location: `C:\Program Files\PostgreSQL\15\bin`
   - Add to System Environment Variables
3. Restart PowerShell after PATH change

## 🔴 Database Issues

### "Database connection failed"

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

1. **Check if PostgreSQL is running**:
```powershell
Get-Service -Name postgresql*
# If not running:
Start-Service postgresql-x64-15  # Adjust version
```

2. **Verify credentials in .env**:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD  # ← Check this!
DB_NAME=discord_clone
```

3. **Test connection manually**:
```powershell
psql -U postgres -h localhost
# Enter password when prompted
```

### "Database does not exist"

**Problem**: `database "discord_clone" does not exist`

**Solution**:
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE discord_clone;

# Exit
\q

# Run setup again
npm run setup
```

### "relation does not exist"

**Problem**: Tables not created

**Solution**:
```powershell
# Run database setup
npm run setup

# If that fails, manually run schema
psql -U postgres -d discord_clone -f server/schema.sql
```

## 🔴 Server Issues

### Port 3000 already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:

1. **Change port in .env**:
```env
PORT=3001
```

2. **Find and kill process using port 3000**:
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Server crashes on start

**Problem**: Server exits immediately

**Solutions**:

1. **Check .env file exists**:
```powershell
# Should exist in root directory
Get-Item .env
```

2. **Check all environment variables are set**:
```powershell
# View .env contents
Get-Content .env
```

3. **Check server logs**:
```powershell
npm start
# Read error messages carefully
```

## 🔴 Authentication Issues

### "Invalid credentials" on login

**Problem**: Cannot login with correct password

**Solutions**:

1. **Password was recently changed**: Register new account
2. **Check database for user**:
```sql
SELECT email, username FROM users;
```
3. **Password case-sensitive**: Check caps lock

### "Access token required"

**Problem**: API returns 401 Unauthorized

**Solutions**:

1. **Clear localStorage and login again**:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

2. **Check token in localStorage**:
```javascript
// In browser console
localStorage.getItem('token');
```

### JWT token expired

**Problem**: Token expires after some time

**Solution**:
```env
# Increase token lifetime in .env
JWT_EXPIRES_IN=30d  # 30 days instead of 7
```

## 🔴 WebSocket Issues

### "WebSocket connection failed"

**Problem**: Real-time features not working

**Solutions**:

1. **Check server is running**:
```powershell
# Should show "✅ Connected to server" in browser console
```

2. **Check firewall**:
   - Allow port 3000 through Windows Firewall
   - Check antivirus isn't blocking connections

3. **Check browser console**:
   - Press F12
   - Look for WebSocket errors
   - Should see "✅ Connected to server"

### Messages not appearing

**Problem**: Send message but nothing shows

**Solutions**:

1. **Check you're in a channel**: Select a text channel first
2. **Check browser console**: Press F12, look for errors
3. **Refresh page**: Sometimes WebSocket disconnects
4. **Check database**:
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

## 🔴 Voice/Video Issues

### Cannot join voice channel

**Problem**: Voice channel doesn't work

**Solutions**:

1. **Grant microphone permission**:
   - Browser will ask for permission
   - Click "Allow"
   - Check browser settings if denied

2. **Check browser compatibility**:
   - Chrome/Edge: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ⚠️ Limited WebRTC support

3. **HTTPS required in production**:
   - WebRTC requires secure connection
   - Works on localhost without HTTPS
   - Use HTTPS in production

### No audio from other users

**Problem**: Can't hear others in voice

**Solutions**:

1. **Check volume**: System and browser volume
2. **Check deafen button**: Make sure not deafened
3. **Check browser console**: Look for WebRTC errors
4. **Network issues**: Firewall blocking UDP
5. **STUN/TURN servers**: May need better configuration

### Microphone not working

**Problem**: Others can't hear you

**Solutions**:

1. **Check mute button**: Make sure not muted
2. **Test microphone**: Use system sound settings
3. **Check browser permissions**: Allow microphone access
4. **Try different browser**: Chrome recommended
5. **Check Windows privacy settings**: Allow apps to access mic

## 🔴 UI/Display Issues

### Page shows blank

**Problem**: White/blank screen

**Solutions**:

1. **Check browser console**: Press F12
2. **Hard refresh**: Ctrl + Shift + R
3. **Clear cache**: Ctrl + Shift + Delete
4. **Check if server running**: Visit http://localhost:3000

### CSS not loading

**Problem**: Page has no styling

**Solutions**:

1. **Check server running**: CSS served by Express
2. **Check file paths**: View browser Network tab (F12)
3. **Clear browser cache**: Hard refresh

### "Cannot GET /app"

**Problem**: 404 error on /app

**Solution**:
```javascript
// Make sure this is in server.js:
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/app.html'));
});
```

## 🔴 Development Issues

### "nodemon not found"

**Problem**: `npm run dev` fails

**Solution**:
```powershell
# Install nodemon globally or locally
npm install nodemon --save-dev

# Or just use npm start
npm start
```

### Hot reload not working

**Problem**: Changes not reflected

**Solutions**:

1. **Use nodemon**: `npm run dev`
2. **Restart server**: Ctrl + C, then `npm start`
3. **Clear browser cache**: Hard refresh

### Database changes not applied

**Problem**: Schema changes not working

**Solutions**:

1. **Drop and recreate tables**:
```sql
DROP DATABASE discord_clone;
CREATE DATABASE discord_clone;
```
Then run: `npm run setup`

2. **Or manually apply changes**:
```powershell
psql -U postgres -d discord_clone -f server/schema.sql
```

## 🔴 Production Issues

### CORS errors in production

**Problem**: Cross-origin requests blocked

**Solution**:
```env
# In .env, set correct origin
ALLOWED_ORIGINS=https://yourdomain.com
```

### WebSocket not connecting in production

**Problem**: WSS connection fails

**Solutions**:

1. **Use HTTPS**: WebSocket needs secure connection
2. **Check proxy configuration**: If using nginx/Apache
3. **Update client connection**:
```javascript
const socket = io('https://yourdomain.com');
```

### Database connection in production

**Problem**: Cannot connect to production database

**Solutions**:

1. **Use DATABASE_URL**: Most cloud platforms use this
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

2. **Update database.js** to use DATABASE_URL if available

## 🔴 General Debugging Tips

### Check Server Logs
```powershell
npm start
# Watch for errors in output
```

### Check Browser Console
```
Press F12 → Console tab
Look for red error messages
```

### Check Database
```powershell
psql -U postgres -d discord_clone

# Useful queries:
SELECT COUNT(*) FROM users;
SELECT * FROM servers;
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

### Enable Verbose Logging
Add to server.js:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### Test API Endpoints
```powershell
# Test with curl or PowerShell:
Invoke-WebRequest -Uri http://localhost:3000/api/users/me -Headers @{Authorization="Bearer YOUR_TOKEN"}
```

## 📞 Still Having Issues?

1. Check the GitHub issues
2. Review the documentation:
   - README.md
   - SETUP.md
   - API.md
   - ARCHITECTURE.md
3. Check browser and server console logs
4. Verify all dependencies installed
5. Try on a fresh database

## 🔧 Reset Everything

Nuclear option - start fresh:

```powershell
# Stop server (Ctrl + C)

# Delete everything
Remove-Item -Recurse -Force node_modules
Remove-Item .env

# Drop database
psql -U postgres -c "DROP DATABASE IF EXISTS discord_clone;"
psql -U postgres -c "CREATE DATABASE discord_clone;"

# Reinstall
npm install
Copy-Item .env.example .env
# Edit .env with your settings
npm run setup
npm start
```

This will give you a completely fresh start!
