// ENHANCED DATABASE LAYER - Replace in-memory Maps with PostgreSQL + Redis
// Production-ready implementation for 30,000+ users

const { Pool } = require('pg');
const Redis = require('ioredis');

class ScalableDataLayer {
  constructor() {
    // PostgreSQL connection pool
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'tvet_connect_production',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      
      // Optimized for high concurrency
      max: 100,                    // Maximum connections
      min: 10,                     // Minimum connections
      idleTimeoutMillis: 30000,    // Close idle connections
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
      query_timeout: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    });

    // Redis for caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keepAlive: true,
      family: 4
    });

    // Cache configuration
    this.CACHE_TTL = {
      SHORT: 300,      // 5 minutes
      MEDIUM: 1800,    // 30 minutes  
      LONG: 3600,      // 1 hour
      VERY_LONG: 86400 // 24 hours
    };

    this.CACHE_KEYS = {
      STUDENT_SYNC: 'student_sync:',
      LECTURER_DASHBOARD: 'lecturer_dashboard:',
      ATTENDANCE_SESSION: 'attendance_session:',
      ONLINE_CLASS: 'online_class:',
      SEMESTER_PROGRESS: 'semester_progress:'
    };

    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Test database connection
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      client.release();

      // Test Redis connection
      await this.redis.ping();
      console.log('✅ Redis connected successfully');

      // Create tables if they don't exist
      await this.createTables();
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS student_sync_status (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(255) NOT NULL,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lecturer_dashboard_content (
        id SERIAL PRIMARY KEY,
        lecturer_id VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        content_data JSONB NOT NULL,
        semester_plan_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance_sessions (
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

      CREATE TABLE IF NOT EXISTS online_classes (
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

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_student_sync_student_id ON student_sync_status(student_id);
      CREATE INDEX IF NOT EXISTS idx_lecturer_content_lecturer_id ON lecturer_dashboard_content(lecturer_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_semester_plan ON attendance_sessions(semester_plan_id);
      CREATE INDEX IF NOT EXISTS idx_online_classes_semester_plan ON online_classes(semester_plan_id);
    `;

    try {
      await this.pool.query(createTablesSQL);
      console.log('✅ Database tables created/verified');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // STUDENT SYNC STATUS METHODS
  async getStudentSyncStatus(studentId) {
    const cacheKey = `${this.CACHE_KEYS.STUDENT_SYNC}${studentId}`;
    
    try {
      // Try cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query database
      const result = await this.pool.query(
        'SELECT * FROM student_sync_status WHERE student_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [studentId]
      );

      const syncStatus = result.rows[0] || null;
      
      // Cache result
      if (syncStatus) {
        await this.redis.setex(cacheKey, this.CACHE_TTL.MEDIUM, JSON.stringify(syncStatus));
      }

      return syncStatus;
    } catch (error) {
      console.error('Error getting student sync status:', error);
      throw error;
    }
  }

  async updateStudentSyncStatus(studentId, syncData) {
    const cacheKey = `${this.CACHE_KEYS.STUDENT_SYNC}${studentId}`;
    
    try {
      const result = await this.pool.query(`
        INSERT INTO student_sync_status (student_id, sync_data, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (student_id) DO UPDATE SET
          sync_data = $2,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [studentId, JSON.stringify(syncData)]);

      const updated = result.rows[0];
      
      // Update cache
      await this.redis.setex(cacheKey, this.CACHE_TTL.MEDIUM, JSON.stringify(updated));
      
      return updated;
    } catch (error) {
      console.error('Error updating student sync status:', error);
      throw error;
    }
  }

  // LECTURER DASHBOARD CONTENT METHODS
  async getLecturerDashboardContent(lecturerId) {
    const cacheKey = `${this.CACHE_KEYS.LECTURER_DASHBOARD}${lecturerId}`;
    
    try {
      // Try cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query database
      const result = await this.pool.query(
        'SELECT * FROM lecturer_dashboard_content WHERE lecturer_id = $1 ORDER BY created_at DESC',
        [lecturerId]
      );

      const content = result.rows;
      
      // Cache result
      await this.redis.setex(cacheKey, this.CACHE_TTL.SHORT, JSON.stringify(content));

      return content;
    } catch (error) {
      console.error('Error getting lecturer dashboard content:', error);
      throw error;
    }
  }

  async addLecturerDashboardContent(lecturerId, contentType, contentData, semesterPlanId = null) {
    const cacheKey = `${this.CACHE_KEYS.LECTURER_DASHBOARD}${lecturerId}`;
    
    try {
      const result = await this.pool.query(`
        INSERT INTO lecturer_dashboard_content (lecturer_id, content_type, content_data, semester_plan_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [lecturerId, contentType, JSON.stringify(contentData), semesterPlanId]);

      // Invalidate cache
      await this.redis.del(cacheKey);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding lecturer dashboard content:', error);
      throw error;
    }
  }

  // ATTENDANCE SESSION METHODS
  async getAttendanceSession(sessionId) {
    const cacheKey = `${this.CACHE_KEYS.ATTENDANCE_SESSION}${sessionId}`;
    
    try {
      // Try cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query database
      const result = await this.pool.query(
        'SELECT * FROM attendance_sessions WHERE id = $1',
        [sessionId]
      );

      const session = result.rows[0] || null;
      
      // Cache result
      if (session) {
        await this.redis.setex(cacheKey, this.CACHE_TTL.SHORT, JSON.stringify(session));
      }

      return session;
    } catch (error) {
      console.error('Error getting attendance session:', error);
      throw error;
    }
  }

  async createAttendanceSession(sessionData) {
    try {
      const result = await this.pool.query(`
        INSERT INTO attendance_sessions (
          id, semester_plan_id, unit_id, lecturer_id, session_name, 
          is_active, duration_minutes, attendees
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        sessionData.id,
        sessionData.semesterPlanId,
        sessionData.unitId,
        sessionData.lecturerId,
        sessionData.sessionName,
        sessionData.isActive,
        sessionData.durationMinutes,
        JSON.stringify(sessionData.attendees || [])
      ]);

      const session = result.rows[0];
      
      // Cache the new session
      const cacheKey = `${this.CACHE_KEYS.ATTENDANCE_SESSION}${session.id}`;
      await this.redis.setex(cacheKey, this.CACHE_TTL.SHORT, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('Error creating attendance session:', error);
      throw error;
    }
  }

  // ONLINE CLASS METHODS
  async getOnlineClass(classId) {
    const cacheKey = `${this.CACHE_KEYS.ONLINE_CLASS}${classId}`;
    
    try {
      // Try cache first
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Query database
      const result = await this.pool.query(
        'SELECT * FROM online_classes WHERE id = $1',
        [classId]
      );

      const onlineClass = result.rows[0] || null;
      
      // Cache result
      if (onlineClass) {
        await this.redis.setex(cacheKey, this.CACHE_TTL.MEDIUM, JSON.stringify(onlineClass));
      }

      return onlineClass;
    } catch (error) {
      console.error('Error getting online class:', error);
      throw error;
    }
  }

  async createOnlineClass(classData) {
    try {
      const result = await this.pool.query(`
        INSERT INTO online_classes (
          id, semester_plan_id, unit_id, lecturer_id, class_name,
          meeting_url, meeting_id, password, scheduled_time, duration_minutes,
          platform, status, participants
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        classData.id,
        classData.semesterPlanId,
        classData.unitId,
        classData.lecturerId,
        classData.className,
        classData.meetingUrl,
        classData.meetingId,
        classData.password,
        classData.scheduledTime,
        classData.durationMinutes,
        classData.platform,
        classData.status,
        JSON.stringify(classData.participants || [])
      ]);

      const onlineClass = result.rows[0];
      
      // Cache the new class
      const cacheKey = `${this.CACHE_KEYS.ONLINE_CLASS}${onlineClass.id}`;
      await this.redis.setex(cacheKey, this.CACHE_TTL.MEDIUM, JSON.stringify(onlineClass));
      
      return onlineClass;
    } catch (error) {
      console.error('Error creating online class:', error);
      throw error;
    }
  }

  // PERFORMANCE AND MONITORING
  async getPerformanceMetrics() {
    try {
      const [dbStats, redisStats] = await Promise.all([
        this.pool.query('SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \'active\''),
        this.redis.info('memory')
      ]);

      return {
        database: {
          activeConnections: parseInt(dbStats.rows[0].active_connections),
          totalConnections: this.pool.totalCount,
          idleConnections: this.pool.idleCount,
          waitingConnections: this.pool.waitingCount
        },
        redis: {
          memoryUsage: redisStats.match(/used_memory_human:(.+)/)[1].trim(),
          connectedClients: parseInt(redisStats.match(/connected_clients:(\d+)/)[1]),
          keyspaceHits: parseInt(redisStats.match(/keyspace_hits:(\d+)/)[1] || 0),
          keyspaceMisses: parseInt(redisStats.match(/keyspace_misses:(\d+)/)[1] || 0)
        }
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return null;
    }
  }

  // CLEANUP AND MAINTENANCE
  async clearCache(pattern = '*') {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      // Test database
      const dbResult = await this.pool.query('SELECT 1');
      
      // Test Redis
      const redisResult = await this.redis.ping();
      
      return {
        database: dbResult.rows[0]['?column?'] === 1,
        redis: redisResult === 'PONG',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        database: false,
        redis: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // GRACEFUL SHUTDOWN
  async close() {
    try {
      await this.pool.end();
      await this.redis.quit();
      console.log('✅ Database connections closed gracefully');
    } catch (error) {
      console.error('❌ Error closing connections:', error);
    }
  }
}

module.exports = ScalableDataLayer;
