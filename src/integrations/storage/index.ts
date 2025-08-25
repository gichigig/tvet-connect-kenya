import { BackblazeStorage, BackblazeConfig } from './backblaze';
import { CloudflareR2Storage, CloudflareConfig } from './cloudflare';

export type StorageProvider = 'b2' | 'r2';

export interface StorageConfig {
  provider: StorageProvider;
  config: BackblazeConfig | CloudflareConfig;
}

export interface StorageUploadParams {
  file: File | Buffer;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class StorageService {
  private storage: BackblazeStorage | CloudflareR2Storage;

  constructor(config: StorageConfig) {
    this.storage = this.initializeStorage(config);
  }

  private initializeStorage(config: StorageConfig): BackblazeStorage | CloudflareR2Storage {
    switch (config.provider) {
      case 'b2':
        return new BackblazeStorage(config.config as BackblazeConfig);
      case 'r2':
        return new CloudflareR2Storage(config.config as CloudflareConfig);
      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }
  }

  public async uploadFile(params: StorageUploadParams): Promise<{ url: string }> {
    return this.storage.uploadFile(params);
  }

  public async deleteFile(fileId: string): Promise<void> {
    return this.storage.deleteFile(fileId);
  }
}

// Export for direct usage if needed
export { BackblazeStorage, CloudflareR2Storage };
