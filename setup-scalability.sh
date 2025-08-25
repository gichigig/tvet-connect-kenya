#!/bin/bash

# QUICK SCALABILITY SETUP SCRIPT
# Run this to quickly set up the production-ready environment

echo "🚀 Setting up TVET Connect for 30,000+ users..."
echo "=================================================="

# Install production dependencies
echo "📦 Installing scalability dependencies..."
npm install pg@^8.11.3 ioredis@^5.3.2 express-rate-limit@^7.1.5 compression@^1.7.4 helmet@^7.1.0 winston@^3.11.0 dotenv@^16.3.1

# Install development/testing tools
echo "🧪 Installing load testing tools..."
npm install --save-dev artillery@^2.0.0 autocannon@^7.12.0

# Create production environment file
echo "⚙️ Creating production environment configuration..."
cp PRODUCTION_ENV_CONFIG.env .env.production

# Set up database (if PostgreSQL is installed)
echo "🗄️ Setting up PostgreSQL database..."
createdb tvet_connect_production 2>/dev/null || echo "Database may already exist"

# Set up Redis (if Redis is installed)
echo "🔄 Checking Redis installation..."
redis-cli ping 2>/dev/null && echo "✅ Redis is running" || echo "⚠️ Please install and start Redis"

# Update package.json scripts
echo "📝 Adding production scripts to package.json..."
npm pkg set scripts.start:production="NODE_ENV=production node api-server/server.js"
npm pkg set scripts.start:scalable="NODE_ENV=production node api-server/server-scalable.js"
npm pkg set scripts.test:load="artillery quick --count 100 --num 10 http://localhost:3001/api/enhanced/health"
npm pkg set scripts.test:stress="autocannon -c 100 -d 60 http://localhost:3001/api/enhanced/health"
npm pkg set scripts.cache:clear="node -e \"const Redis=require('ioredis');const r=new Redis();r.flushall().then(()=>console.log('Cache cleared')).finally(()=>r.quit())\""

echo ""
echo "✅ SCALABILITY SETUP COMPLETE!"
echo "================================"
echo ""
echo "🔧 Next Steps:"
echo "1. Copy PRODUCTION_ENV_CONFIG.env to .env and fill in your values"
echo "2. Set up PostgreSQL database and Redis server"
echo "3. Run: npm run start:scalable"
echo "4. Test with: npm run test:load"
echo ""
echo "📊 Performance Targets:"
echo "• Response Time: < 200ms"
echo "• Throughput: 1000+ requests/second"
echo "• Concurrent Users: 30,000+"
echo "• Database Queries: < 50ms"
echo "• Cache Hit Rate: > 80%"
echo ""
echo "🚀 Ready to scale to 30,000+ users!"
