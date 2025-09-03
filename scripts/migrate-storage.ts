import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

// Configure source S3 client (AWS)
const sourceClient = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.***REMOVED***!,
    secretAccessKey: process.env.***REMOVED***!
  }
})

// Configure destination R2 client
const destinationClient = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

async function migrateFiles() {
  try {
    console.log('Starting file migration...')
    let continuationToken: string | undefined

    do {
      // List files from source S3
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET!,
        ContinuationToken: continuationToken
      })

      const listResponse = await sourceClient.send(listCommand)
      const files = listResponse.Contents || []
      continuationToken = listResponse.NextContinuationToken

      // Process each file in parallel
      await Promise.all(files.map(async file => {
        const key = file.Key!
        console.log(`Migrating file: ${key}`)

        // Get file from source S3
        const getCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key
        })

        const getResponse = await sourceClient.send(getCommand)
        const buffer = await getResponse.Body!.transformToByteArray()
        
        // Upload to destination R2
        const putCommand = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: buffer,
          ContentType: getResponse.ContentType,
          Metadata: getResponse.Metadata
        })

        await destinationClient.send(putCommand)
        console.log(`Successfully migrated: ${key}`)
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
