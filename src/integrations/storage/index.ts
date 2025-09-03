import { CloudflareR2Storage, CloudflareConfig } from './cloudflare';

export type StorageProvider = 'r2';

export interface StorageConfig {
  provider: StorageProvider;
  config: CloudflareConfig;
}

export interface StorageUploadParams {
  file: File | Buffer;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class StorageService {
  private storage: CloudflareR2Storage;

  constructor(config: StorageConfig) {
    if (config.provider !== 'r2') {
      throw new Error('Only R2 storage provider is supported');
    }
    this.storage = new CloudflareR2Storage(config.config);
  }

  public async uploadFile(params: StorageUploadParams): Promise<{ url: string }> {
    return this.storage.uploadFile(params);
  }

  public async deleteFile(fileId: string): Promise<void> {
    return this.storage.deleteFile(fileId);
  }
}

export * from './cloudflare';
