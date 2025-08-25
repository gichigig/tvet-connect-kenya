# SCALABILITY SETUP FOR WINDOWS
# PowerShell script to set up production-ready environment for 30,000+ users

Write-Host "🚀 Setting up TVET Connect for 30,000+ users..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Install production dependencies
Write-Host "📦 Installing scalability dependencies..." -ForegroundColor Yellow
npm install pg@^8.11.3 ioredis@^5.3.2 express-rate-limit@^7.1.5 compression@^1.7.4 helmet@^7.1.0 winston@^3.11.0 dotenv@^16.3.1

# Install development/testing tools
Write-Host "🧪 Installing load testing tools..." -ForegroundColor Yellow
npm install --save-dev artillery@^2.0.0 autocannon@^7.12.0

# Create production environment file
Write-Host "⚙️ Creating production environment configuration..." -ForegroundColor Yellow
Copy-Item "PRODUCTION_ENV_CONFIG.env" ".env.production" -Force

# Check if PostgreSQL is available
Write-Host "🗄️ Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL is installed: $pgVersion" -ForegroundColor Green
        Write-Host "Creating database..." -ForegroundColor Yellow
        createdb tvet_connect_production 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database created successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Database may already exist or check permissions" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️ PostgreSQL not found. Please install PostgreSQL 14+" -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
}

# Check if Redis is available
Write-Host "🔄 Checking Redis installation..." -ForegroundColor Yellow
try {
    $redisResponse = redis-cli ping 2>$null
    if ($redisResponse -eq "PONG") {
        Write-Host "✅ Redis is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Redis not responding" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Redis not found. Install Redis for Windows:" -ForegroundColor Red
    Write-Host "Download from: https://github.com/tporadowski/redis/releases" -ForegroundColor Cyan
}

# Update package.json scripts
Write-Host "📝 Adding production scripts to package.json..." -ForegroundColor Yellow
npm pkg set scripts.start:production="NODE_ENV=production node api-server/server.js"
npm pkg set scripts.start:scalable="NODE_ENV=production node api-server/server-scalable.js"
npm pkg set scripts.test:load="artillery quick --count 100 --num 10 http://localhost:3001/api/enhanced/health"
npm pkg set scripts.test:stress="autocannon -c 100 -d 60 http://localhost:3001/api/enhanced/health"
npm pkg set scripts.db:setup="node api-server/scripts/setup-database.js"
npm pkg set scripts.cache:clear="node -e `"const Redis=require('ioredis');const r=new Redis();r.flushall().then(()=>console.log('Cache cleared')).finally(()=>r.quit())`""

Write-Host ""
Write-Host "✅ SCALABILITY SETUP COMPLETE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy PRODUCTION_ENV_CONFIG.env to .env and fill in your values" -ForegroundColor White
Write-Host "2. Install PostgreSQL and Redis if not already installed" -ForegroundColor White
Write-Host "3. Run: npm run db:setup" -ForegroundColor White
Write-Host "4. Run: npm run start:scalable" -ForegroundColor White
Write-Host "5. Test with: npm run test:load" -ForegroundColor White
Write-Host ""

Write-Host "📊 Performance Targets:" -ForegroundColor Cyan
Write-Host "• Response Time: < 200ms for 95% of requests" -ForegroundColor White
Write-Host "• Throughput: 1000+ requests/second" -ForegroundColor White
Write-Host "• Concurrent Users: 30,000+ supported" -ForegroundColor White
Write-Host "• Database Queries: < 50ms average" -ForegroundColor White
Write-Host "• Cache Hit Rate: > 80%" -ForegroundColor White
Write-Host ""

Write-Host "💰 Estimated Infrastructure Costs:" -ForegroundColor Cyan
Write-Host "• Development: $50-100/month" -ForegroundColor White
Write-Host "• Production: $300-800/month" -ForegroundColor White
Write-Host "• Enterprise: $800-1500/month" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Recommended Hosting:" -ForegroundColor Cyan
Write-Host "• AWS: ECS + RDS + ElastiCache" -ForegroundColor White
Write-Host "• Google Cloud: Cloud Run + Cloud SQL + Memorystore" -ForegroundColor White
Write-Host "• DigitalOcean: App Platform + Managed Database + Redis" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to scale to 30,000+ users!" -ForegroundColor Green

# Pause to let user read the output
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
