# Discord Clone - Quick Start Script for Windows PowerShell

Write-Host "🚀 Discord Clone - Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found in PATH. Make sure it's installed." -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and set your database password!" -ForegroundColor Yellow
    Write-Host "   Run: notepad .env" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "Have you configured the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please configure .env and run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Database setup
Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
Write-Host "If the database doesn't exist, create it first with:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -c 'CREATE DATABASE discord_clone;'" -ForegroundColor Cyan
Write-Host ""

$setupDb = Read-Host "Run database setup now? (y/n)"
if ($setupDb -eq "y") {
    npm run setup
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database setup failed. Check your database connection settings in .env" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  1. PostgreSQL service not running" -ForegroundColor Cyan
        Write-Host "  2. Wrong database credentials in .env" -ForegroundColor Cyan
        Write-Host "  3. Database 'discord_clone' doesn't exist" -ForegroundColor Cyan
        exit 1
    }
    
    Write-Host "✅ Database setup complete" -ForegroundColor Green
}

# All done!
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or for development with auto-reload:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Start the server now? (y/n)"
if ($startNow -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm start
}
