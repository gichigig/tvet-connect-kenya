/**
 * Firestore to Supabase Data Migration Service
 * Migrates all collections from Firestore to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/integrations/firebase/config';
import { toast } from '@/hooks/use-toast';

// Initialize services
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const firestore = getFirestore(firebaseApp);

export class FirestoreToSupabaseMigration {
  private static instance: FirestoreToSupabaseMigration;
  
  static getInstance(): FirestoreToSupabaseMigration {
    if (!FirestoreToSupabaseMigration.instance) {
      FirestoreToSupabaseMigration.instance = new FirestoreToSupabaseMigration();
    }
    return FirestoreToSupabaseMigration.instance;
  }

  /**
   * Main migration function - migrates all collections
   */
  async migrateAllData(onProgress?: (progress: string) => void) {
    const results = {
      successes: [],
      failures: [],
      skipped: []
    };

    try {
      onProgress?.('🚀 Starting complete data migration...');

      // Define collections to migrate
      const collections = [
        { firestore: 'units', supabase: 'units' },
        { firestore: 'courses', supabase: 'courses' },
        { firestore: 'course_units', supabase: 'course_units' },
        { firestore: 'notifications', supabase: 'notifications' },
        { firestore: 'calendar_events', supabase: 'calendar_events' },
        { firestore: 'reminders', supabase: 'reminders' },
        { firestore: 'virtual_labs', supabase: 'virtual_labs' },
        { firestore: 'experiments', supabase: 'experiments' },
        { firestore: 'experiment_attempts', supabase: 'experiment_attempts' },
        { firestore: 'pendingUnitRegistrations', supabase: 'pending_unit_registrations' },
        { firestore: 'assignments', supabase: 'assignments' },
        { firestore: 'assignment_submissions', supabase: 'assignment_submissions' },
        { firestore: 'semester_plans', supabase: 'semester_plans' },
        { firestore: 'attendance', supabase: 'attendance_records' },
        { firestore: 'grades', supabase: 'grades' },
      ];

      for (const collectionMap of collections) {
        try {
          onProgress?.(`📋 Migrating ${collectionMap.firestore}...`);
          const result = await this.migrateCollection(
            collectionMap.firestore, 
            collectionMap.supabase
          );
          
          if (result.success) {
            results.successes.push({
              collection: collectionMap.firestore,
              count: result.count
            });
            onProgress?.(`✅ ${collectionMap.firestore}: ${result.count} records migrated`);
          } else {
            results.failures.push({
              collection: collectionMap.firestore,
              error: result.error
            });
            onProgress?.(`❌ ${collectionMap.firestore}: ${result.error}`);
          }
        } catch (error) {
          results.failures.push({
            collection: collectionMap.firestore,
            error: error.message
          });
          onProgress?.(`❌ ${collectionMap.firestore}: ${error.message}`);
        }
      }

      // Summary
      const totalSuccess = results.successes.reduce((sum, item) => sum + item.count, 0);
      onProgress?.(`🎉 Migration complete! ${totalSuccess} records migrated from ${results.successes.length} collections`);
      
      if (results.failures.length > 0) {
        onProgress?.(`⚠️ ${results.failures.length} collections failed to migrate`);
      }

      return results;

    } catch (error) {
      onProgress?.(`💥 Migration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Migrate a single collection from Firestore to Supabase
   */
  async migrateCollection(firestoreCollection: string, supabaseTable: string) {
    try {
      console.log(`🔄 Migrating ${firestoreCollection} to ${supabaseTable}...`);

      // Get all documents from Firestore collection
      const collectionRef = collection(firestore, firestoreCollection);
      const snapshot = await getDocs(collectionRef);

      if (snapshot.empty) {
        console.log(`📭 Collection ${firestoreCollection} is empty`);
        return { success: true, count: 0 };
      }

      const documents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Transform the data for Supabase
        const transformedData = this.transformDocument(data, doc.id, firestoreCollection);
        documents.push(transformedData);
      });

      console.log(`📄 Found ${documents.length} documents in ${firestoreCollection}`);

      // Insert into Supabase in batches
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase
            .from(supabaseTable)
            .insert(batch)
            .select();

          if (error) {
            if (error.message.includes('duplicate key value') || 
                error.message.includes('already exists')) {
              console.log(`⚠️ Some records already exist in ${supabaseTable}, skipping duplicates...`);
              // Try to insert one by one to skip duplicates
              for (const item of batch) {
                try {
                  await supabase.from(supabaseTable).insert(item);
                  insertedCount++;
                } catch (individualError) {
                  if (!individualError.message.includes('duplicate key value')) {
                    console.error(`Failed to insert individual record:`, individualError);
                  }
                }
              }
            } else {
              throw error;
            }
          } else {
            insertedCount += batch.length;
          }
        } catch (batchError) {
          console.error(`Batch insert failed for ${supabaseTable}:`, batchError);
          // Try individual inserts
          for (const item of batch) {
            try {
              await supabase.from(supabaseTable).insert(item);
              insertedCount++;
            } catch (individualError) {
              console.error(`Failed to insert record:`, individualError);
            }
          }
        }
      }

      console.log(`✅ Successfully migrated ${insertedCount}/${documents.length} records to ${supabaseTable}`);
      return { success: true, count: insertedCount };

    } catch (error) {
      console.error(`❌ Failed to migrate ${firestoreCollection}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Transform Firestore document to Supabase format
   */
  transformDocument(data: any, docId: string, collectionName: string) {
    // Base transformation
    const transformed = {
      id: docId,
      ...data
    };

    // Handle timestamps (Firestore timestamps to ISO strings)
    Object.keys(transformed).forEach(key => {
      const value = transformed[key];
      
      // Handle Firestore Timestamps
      if (value && typeof value.toDate === 'function') {
        transformed[key] = value.toDate().toISOString();
      }
      
      // Handle Firestore server timestamps
      if (value && value.seconds) {
        transformed[key] = new Date(value.seconds * 1000).toISOString();
      }
    });

    // Collection-specific transformations
    switch (collectionName) {
      case 'units':
        return this.transformUnit(transformed);
      case 'courses':
        return this.transformCourse(transformed);
      case 'assignments':
        return this.transformAssignment(transformed);
      case 'notifications':
        return this.transformNotification(transformed);
      default:
        return transformed;
    }
  }

  /**
   * Transform unit document
   */
  transformUnit(data: any) {
    return {
      id: data.id,
      name: data.name || data.unitName,
      code: data.code || data.unitCode,
      description: data.description,
      credits: data.credits || data.creditHours || 3,
      course: data.course,
      year: data.year || 1,
      semester: data.semester || 1,
      lecturer_id: data.lecturerId || data.lecturer,
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
      updated_at: data.updated_at || data.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Transform course document
   */
  transformCourse(data: any) {
    return {
      id: data.id,
      name: data.name || data.courseName,
      code: data.code || data.courseCode,
      description: data.description,
      duration_years: data.durationYears || data.duration || 3,
      department_id: data.departmentId || data.department,
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
      updated_at: data.updated_at || data.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Transform assignment document
   */
  transformAssignment(data: any) {
    return {
      id: data.id,
      title: data.title || data.assignmentTitle,
      description: data.description,
      unit_id: data.unitId || data.unit,
      lecturer_id: data.lecturerId || data.lecturer,
      due_date: data.dueDate || data.due_date,
      max_score: data.maxScore || data.totalMarks || 100,
      type: data.type || 'assignment',
      status: data.status || 'active',
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
      updated_at: data.updated_at || data.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Transform notification document
   */
  transformNotification(data: any) {
    return {
      id: data.id,
      title: data.title,
      message: data.message || data.content,
      type: data.type || 'info',
      priority: data.priority || 'medium',
      recipient_id: data.recipientId || data.userId,
      sender_id: data.senderId || data.createdBy,
      read_at: data.readAt || data.read_at,
      created_at: data.created_at || data.createdAt || new Date().toISOString()
    };
  }

  /**
   * Check if Supabase table exists and has the right structure
   */
  async checkSupabaseTable(tableName: string) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return { exists: false, error: `Table ${tableName} does not exist` };
        }
        return { exists: false, error: error.message };
      }

      return { exists: true };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Get migration progress/status
   */
  async getMigrationStatus() {
    const collections = [
      'units', 'courses', 'notifications', 'assignments', 
      'calendar_events', 'reminders', 'experiment_attempts'
    ];

    const status = {};

    for (const collectionName of collections) {
      try {
        // Check Firestore count
        const firestoreRef = collection(firestore, collectionName);
        const firestoreSnapshot = await getDocs(firestoreRef);
        const firestoreCount = firestoreSnapshot.size;

        // Check Supabase count
        const { count: supabaseCount, error } = await supabase
          .from(collectionName)
          .select('*', { count: 'exact', head: true });

        status[collectionName] = {
          firestore: firestoreCount,
          supabase: error ? 0 : supabaseCount,
          migrated: !error && supabaseCount >= firestoreCount
        };
      } catch (error) {
        status[collectionName] = {
          firestore: 0,
          supabase: 0,
          migrated: false,
          error: error.message
        };
      }
    }

    return status;
  }
}
