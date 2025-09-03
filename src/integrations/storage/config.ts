import { StorageConfig } from './index';

export const getStorageConfig = (): StorageConfig => {
  if (!process.env.STORAGE_PROVIDER || process.env.STORAGE_PROVIDER !== 'r2') {
    throw new Error('STORAGE_PROVIDER must be set to "r2"');
  }

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
