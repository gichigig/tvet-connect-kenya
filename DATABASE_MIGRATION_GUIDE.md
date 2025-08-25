# PHASE 1: DATABASE MIGRATION & REDIS CACHING
# Immediate scalability improvements for 30,000+ users

## 1. Database Schema (PostgreSQL)

```sql
-- Create database
CREATE DATABASE tvet_connect_production;

-- User sessions and sync status
CREATE TABLE student_sync_status (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lecturer dashboard content
CREATE TABLE lecturer_dashboard_content (
    id SERIAL PRIMARY KEY,
    lecturer_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    content_data JSONB NOT NULL,
    semester_plan_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance sessions
CREATE TABLE attendance_sessions (
    id VARCHAR(255) PRIMARY KEY,
    semester_plan_id VARCHAR(255) NOT NULL,
    unit_id VARCHAR(255) NOT NULL,
    lecturer_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    duration_minutes INTEGER DEFAULT 15,
    attendees JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Online classes
CREATE TABLE online_classes (
    id VARCHAR(255) PRIMARY KEY,
    semester_plan_id VARCHAR(255) NOT NULL,
    unit_id VARCHAR(255) NOT NULL,
    lecturer_id VARCHAR(255) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    meeting_url VARCHAR(500),
    meeting_id VARCHAR(255),
    password VARCHAR(255),
    scheduled_time TIMESTAMP,
    duration_minutes INTEGER DEFAULT 60,
    platform VARCHAR(100) DEFAULT 'bigbluebutton',
    status VARCHAR(50) DEFAULT 'scheduled',
    participants JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_student_sync_student_id ON student_sync_status(student_id);
CREATE INDEX idx_student_sync_last_sync ON student_sync_status(last_sync);

CREATE INDEX idx_lecturer_content_lecturer_id ON lecturer_dashboard_content(lecturer_id);
CREATE INDEX idx_lecturer_content_semester_plan ON lecturer_dashboard_content(semester_plan_id);
CREATE INDEX idx_lecturer_content_type ON lecturer_dashboard_content(content_type);

CREATE INDEX idx_attendance_semester_plan ON attendance_sessions(semester_plan_id);
CREATE INDEX idx_attendance_unit_id ON attendance_sessions(unit_id);
CREATE INDEX idx_attendance_lecturer_id ON attendance_sessions(lecturer_id);
CREATE INDEX idx_attendance_active ON attendance_sessions(is_active);

CREATE INDEX idx_online_classes_semester_plan ON online_classes(semester_plan_id);
CREATE INDEX idx_online_classes_unit_id ON online_classes(unit_id);
CREATE INDEX idx_online_classes_lecturer_id ON online_classes(lecturer_id);
CREATE INDEX idx_online_classes_scheduled_time ON online_classes(scheduled_time);
CREATE INDEX idx_online_classes_status ON online_classes(status);
```

## 2. Redis Caching Strategy

```javascript
// Cache Keys Structure
const CACHE_KEYS = {
  STUDENT_SYNC: 'student_sync:',
  LECTURER_DASHBOARD: 'lecturer_dashboard:',
  ATTENDANCE_SESSION: 'attendance_session:',
  ONLINE_CLASS: 'online_class:',
  SEMESTER_PROGRESS: 'semester_progress:',
  USER_SESSION: 'user_session:'
};

// Cache TTL (Time To Live)
const CACHE_TTL = {
  SHORT: 300,     // 5 minutes
  MEDIUM: 1800,   // 30 minutes
  LONG: 3600,     // 1 hour
  VERY_LONG: 86400 // 24 hours
};
```

## 3. Database Connection Pooling

```javascript
// pg-pool configuration for PostgreSQL
const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  
  // Connection pool settings
  max: 100,           // Maximum connections
  min: 10,            // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // Performance settings
  statement_timeout: 30000,
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};
```

## 4. Redis Cluster Configuration

```javascript
// Redis cluster setup
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  
  // Connection pool
  family: 4,
  keepAlive: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  
  // Memory optimization
  compression: 'gzip',
  maxmemory: '2gb',
  maxmemoryPolicy: 'allkeys-lru'
};
```

## 5. Rate Limiting Per User

```javascript
// Advanced rate limiting
const rateLimitConfig = {
  // General API calls
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Per user limit
    keyGenerator: (req) => req.user?.id || req.ip
  },
  
  // Heavy operations
  heavy: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Per user limit
    keyGenerator: (req) => req.user?.id || req.ip
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Per IP limit
    keyGenerator: (req) => req.ip
  }
};
```

## 6. Performance Monitoring

```javascript
// Performance metrics to track
const METRICS = {
  // Response times
  API_RESPONSE_TIME: 'api_response_time',
  DB_QUERY_TIME: 'db_query_time',
  CACHE_HIT_RATE: 'cache_hit_rate',
  
  // Throughput
  REQUESTS_PER_SECOND: 'requests_per_second',
  CONCURRENT_USERS: 'concurrent_users',
  
  // Resource usage
  MEMORY_USAGE: 'memory_usage',
  CPU_USAGE: 'cpu_usage',
  DB_CONNECTIONS: 'db_connections',
  
  // Errors
  ERROR_RATE: 'error_rate',
  TIMEOUT_RATE: 'timeout_rate'
};
```

## 7. Infrastructure Requirements

### Minimum Production Setup:
- **API Servers**: 3 instances (2 CPU, 4GB RAM each)
- **Database**: PostgreSQL (4 CPU, 8GB RAM, 100GB SSD)
- **Cache**: Redis (2 CPU, 4GB RAM)
- **Load Balancer**: 1 instance (2 CPU, 2GB RAM)

### Expected Costs:
- AWS: ~$400-600/month
- Google Cloud: ~$350-550/month
- DigitalOcean: ~$250-400/month

## 8. Implementation Timeline

### Week 1: Database Migration
- Day 1-2: Set up PostgreSQL database
- Day 3-4: Create migration scripts
- Day 5-7: Test and deploy database changes

### Week 2: Caching Layer
- Day 1-2: Set up Redis cluster
- Day 3-4: Implement caching logic
- Day 5-7: Test cache performance

### Week 3: Optimization
- Day 1-2: Add connection pooling
- Day 3-4: Implement rate limiting
- Day 5-7: Performance testing

## 9. Success Metrics

### Performance Targets:
- **Response Time**: < 200ms for 95% of requests
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9% availability
- **Concurrent Users**: 30,000+ supported
- **Database**: < 50ms query response time
- **Cache Hit Rate**: > 80%

## 10. Rollback Plan

### If Issues Occur:
1. Keep current in-memory system as fallback
2. Gradual migration (10% → 50% → 100% traffic)
3. Real-time monitoring during migration
4. Instant rollback capability
5. Data consistency checks

## Next Steps:
1. **Choose cloud provider** (AWS/GCP/Azure)
2. **Set up development environment** with new stack
3. **Create migration scripts** for data transfer
4. **Implement database layer** in enhanced.js
5. **Add Redis caching** to all endpoints
6. **Deploy and test** with load testing tools

Ready to handle 30,000+ users! 🚀
