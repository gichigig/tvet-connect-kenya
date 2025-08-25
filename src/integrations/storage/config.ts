import { StorageConfig } from './index';

export const getStorageConfig = (): StorageConfig => {
  if (!process.env.STORAGE_PROVIDER) {
    throw new Error('STORAGE_PROVIDER environment variable is not set');
  }

  switch (process.env.STORAGE_PROVIDER) {
    case 'b2':
      if (!process.env.B2_ACCOUNT_ID ||
          !process.env.B2_APPLICATION_KEY ||
          !process.env.B2_BUCKET_ID ||
          !process.env.B2_BUCKET_NAME ||
          !process.env.B2_ENDPOINT) {
        throw new Error('Missing required Backblaze B2 configuration');
      }

      return {
        provider: 'b2',
        config: {
          accountId: process.env.B2_ACCOUNT_ID,
          applicationKey: process.env.B2_APPLICATION_KEY,
          bucketId: process.env.B2_BUCKET_ID,
          bucketName: process.env.B2_BUCKET_NAME,
          endpoint: process.env.B2_ENDPOINT
        }
      };

    case 'r2':
      if (!process.env.R2_ACCOUNT_ID ||
          !process.env.R2_ACCESS_KEY_ID ||
          !process.env.R2_SECRET_ACCESS_KEY ||
          !process.env.R2_BUCKET_NAME) {
        throw new Error('Missing required Cloudflare R2 configuration');
      }

      return {
        provider: 'r2',
        config: {
          accountId: process.env.R2_ACCOUNT_ID,
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          bucketName: process.env.R2_BUCKET_NAME,
          customDomain: process.env.R2_CUSTOM_DOMAIN
        }
      };

    default:
      throw new Error(`Unsupported storage provider: ${process.env.STORAGE_PROVIDER}`);
  }
};
