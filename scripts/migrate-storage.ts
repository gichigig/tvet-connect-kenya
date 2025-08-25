import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { UnifiedStorage } from '../src/integrations/storage'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// Configure S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.***REMOVED***!,
    secretAccessKey: process.env.***REMOVED***!
  }
})

// Configure new storage
const storage = new UnifiedStorage({
  provider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER as 'b2' | 'cloudflare',
  b2Config: {
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
    applicationKey: process.env.B2_APPLICATION_KEY!,
    bucketId: process.env.B2_BUCKET_ID!,
    bucketName: process.env.B2_BUCKET_NAME!
  },
  cloudflareConfig: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME!
  }
})

async function migrateFiles() {
  try {
    console.log('Starting file migration...')
    let continuationToken: string | undefined

    do {
      // List files from S3
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET!,
        ContinuationToken: continuationToken
      })

      const listResponse = await s3Client.send(listCommand)
      const files = listResponse.Contents || []
      continuationToken = listResponse.NextContinuationToken

      // Process each file
      for (const file of files) {
        const key = file.Key!
        console.log(`Migrating ${key}...`)

        // Get file from S3
        const getCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key
        })

        const getResponse = await s3Client.send(getCommand)
        const buffer = Buffer.from(await getResponse.Body!.transformToByteArray())

        // Upload to new storage
        try {
          const url = await storage.upload(buffer, key)
          console.log(`Successfully migrated ${key} to ${url}`)
        } catch (error) {
          console.error(`Failed to upload ${key}:`, error)
        }
      }

      console.log(`Processed ${files.length} files`)

    } while (continuationToken)

    console.log('Migration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateFiles()
