import dotenv from 'dotenv'
import { migrateUsers, migrateUnits, migrateContent, migrateSubmissions, migrateStudentUnits } from '../src/utils/migration-utils'

dotenv.config()

async function runMigration() {
  try {
    console.log('Starting migration...')

    console.log('1. Migrating users...')
    await migrateUsers()
    console.log('Users migration completed')

    console.log('2. Migrating units...')
    await migrateUnits()
    console.log('Units migration completed')

    console.log('3. Migrating content...')
    await migrateContent()
    console.log('Content migration completed')

    console.log('4. Migrating submissions...')
    await migrateSubmissions()
    console.log('Submissions migration completed')

    console.log('5. Migrating student units...')
    await migrateStudentUnits()
    console.log('Student units migration completed')

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
