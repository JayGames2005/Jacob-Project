# Discord Clone - SQLite Version (No PostgreSQL Required!)

This is a simplified version that uses SQLite instead of PostgreSQL - **no database server installation required!**

## 🚀 Quick Start

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Setup Database (SQLite - Automatic!)

```powershell
npm run setup:sqlite
```

This will create a `discord.db` file automatically - no PostgreSQL needed!

### Step 3: Start the Server

```powershell
npm run start:sqlite
```

### Step 4: Open Browser

```
http://localhost:3000
```

That's it! No database configuration needed!

## 🔄 Switching Between Versions

### Use SQLite (Easier, No Setup)
```powershell
npm run start:sqlite
```

### Use PostgreSQL (Production-Ready)
```powershell
# Requires PostgreSQL installed
npm run setup
npm start
```

## 📝 Differences

| Feature | SQLite Version | PostgreSQL Version |
|---------|---------------|-------------------|
| **Installation** | ✅ No setup | ❌ Requires PostgreSQL |
| **File** | Single .db file | Server database |
| **Performance** | Good for development | Better for production |
| **Concurrent Users** | Limited | Excellent |
| **Best For** | Testing, Learning | Production, Multiple users |

## 💡 Recommendation

- **Learning/Testing**: Use SQLite version (easier!)
- **Production/Deployment**: Use PostgreSQL version

Both versions have the exact same features!
