# Railway Deployment Guide

## 🚀 Deploy to Railway

Railway provides free PostgreSQL database and hosting!

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy from GitHub

**Option A: Deploy from this repo**
1. Push your code to GitHub (see below)
2. In Railway, click "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy!

**Option B: Deploy directly**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Run: `railway login`
3. Run: `railway init`
4. Run: `railway up`

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway creates database automatically!
4. It will automatically set `DATABASE_URL` environment variable

### Step 4: Set Environment Variables

Railway auto-sets `DATABASE_URL`, but you need to add:

```env
JWT_SECRET=your-super-secret-production-key-change-this
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.railway.app
PORT=3000
```

To set variables:
1. Go to your service in Railway
2. Click "Variables" tab
3. Add each variable
4. Railway will redeploy automatically

### Step 5: Run Database Setup

**Option A: In Railway Terminal**
1. Click on your service
2. Go to "Deployments" tab
3. Click latest deployment
4. Open terminal
5. Run: `npm run setup`

**Option B: Modify package.json**
Add to scripts:
```json
"railway:setup": "node server/setup-db.js"
```

Then add to `railway.json`:
```json
"deploy": {
  "startCommand": "npm run setup && node server/server.js"
}
```

### Step 6: Access Your App

Railway provides a URL like: `https://your-app.railway.app`

Click "Generate Domain" in Railway dashboard to get it!

## 🔧 Database Connection

Railway automatically sets `DATABASE_URL` in this format:
```
postgresql://user:password@host:port/database
```

Our code already handles this! No changes needed.

## 📝 Deployment Checklist

- ✅ Code pushed to GitHub
- ✅ Railway project created
- ✅ PostgreSQL database added
- ✅ Environment variables set
- ✅ Database setup run
- ✅ Domain generated
- ✅ App is live!

## 🐛 Troubleshooting

**Build fails:**
- Check build logs in Railway
- Make sure `package.json` has all dependencies

**Database connection fails:**
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set

**App crashes:**
- Check deployment logs
- Make sure `npm run setup` was executed

**WebSocket not working:**
- Update `ALLOWED_ORIGINS` to your Railway domain
- Railway supports WebSocket automatically!

## 🔄 Updating Your App

Every git push to main branch will auto-deploy!

```bash
git add .
git commit -m "Update app"
git push origin main
```

Railway detects changes and redeploys automatically!

## 💰 Cost

- **Free Tier**: $5/month credit
- **PostgreSQL**: Free
- **Hosting**: Free (within credit)
- Perfect for development and small projects!

## 🌐 Custom Domain

Railway supports custom domains:
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records
4. Done!

Your Discord clone is now live! 🎉
