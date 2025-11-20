# 🚨 Error: "Internal Server Error" - PostgreSQL Not Installed

## The Problem

The Discord Clone requires **PostgreSQL database** to store users, messages, and servers. You're getting an error because PostgreSQL is not installed on your system.

## The Solution

You have **3 options**:

### ✅ Option 1: Install PostgreSQL (5 minutes)

This is the recommended approach for the full experience.

**Step 1: Download PostgreSQL**
- Go to: https://www.postgresql.org/download/windows/
- Download the installer (latest version)
- File size: ~250MB

**Step 2: Install**
- Run the installer
- Use default settings (click Next for everything)
- **IMPORTANT**: Remember the password you set for "postgres" user
- Default port: 5432 (keep this)

**Step 3: Update .env file**
```powershell
notepad .env
```

Change this line to match YOUR password:
```
DB_PASSWORD=your_actual_password
```

**Step 4: Create Database**
```powershell
# Open PowerShell and run:
psql -U postgres

# In the PostgreSQL prompt, type:
CREATE DATABASE discord_clone;
\q
```

**Step 5: Setup and Run**
```powershell
npm run setup
npm start
```

**Done!** Open http://localhost:3000

---

### 🎯 Option 2: Use Online PostgreSQL (No Installation)

Use a free cloud database:

**ElephantSQL (Free)**
1. Go to: https://www.elephantsql.com/
2. Create free account
3. Create a new database instance (Tiny Turtle plan is free)
4. Copy the connection URL
5. Update `.env`:
```env
# Replace these lines with your ElephantSQL URL:
DATABASE_URL=postgres://username:password@host/database
```

6. Update `server/database.js` to use DATABASE_URL
7. Run: `npm run setup && npm start`

**Neon (Free)**
1. Go to: https://neon.tech/
2. Create free account
3. Create project
4. Copy connection string
5. Same steps as ElephantSQL above

---

### 🔧 Option 3: Simple In-Memory Version (Testing Only)

For just testing the UI without a database:

I can create a simplified version that stores everything in memory (data is lost when server restarts). Would you like me to create this version?

---

## Which Option Should I Choose?

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Install PostgreSQL** | Full features, fast, works offline | Need to install software | Learning, Development |
| **Cloud Database** | No installation, works anywhere | Requires internet | Quick testing |
| **In-Memory** | Super simple, no setup | Data not saved, limited | UI testing only |

## Need Help?

**Check if PostgreSQL is Installed:**
```powershell
psql --version
```

If this shows a version number, PostgreSQL is installed!

**Check if PostgreSQL is Running:**
```powershell
Get-Service -Name postgresql*
```

Should show "Running" status.

**Start PostgreSQL if Stopped:**
```powershell
Start-Service postgresql-x64-16  # Adjust version number
```

## Still Stuck?

Let me know which option you'd like to try, and I'll help you set it up! 

For Option 1, I just need to know:
- Did PostgreSQL install successfully?
- What password did you set?
- Any error messages?

For Option 2, I can update the code to use DATABASE_URL.

For Option 3, I'll create a memory-only version right now.
