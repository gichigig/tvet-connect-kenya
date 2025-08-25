import { Buffer } from 'buffer';

export interface BackblazeConfig {
  accountId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
  endpoint: string;
}

export interface UploadParams {
  file: File | Buffer;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class BackblazeStorage {
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;

  constructor(private config: BackblazeConfig) {}

  private async authenticate(): Promise<void> {
    const authString = Buffer.from(`${this.config.accountId}:${this.config.applicationKey}`).toString('base64');
    
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        Authorization: `Basic ${authString}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Backblaze B2');
    }

    const data = await response.json();
    this.authToken = data.authorizationToken;
    this.apiUrl = data.apiUrl;
    this.downloadUrl = data.downloadUrl;
  }

  private async getUploadUrl(): Promise<{ uploadUrl: string; authorizationToken: string }> {
    if (!this.authToken || !this.apiUrl) {
      await this.authenticate();
    }

    const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: this.authToken!
      },
      body: JSON.stringify({
        bucketId: this.config.bucketId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    return response.json();
  }

  public async uploadFile({ file, key, contentType = 'application/octet-stream', metadata = {} }: UploadParams): Promise<{ url: string }> {
    const uploadData = await this.getUploadUrl();
    const fileContent = file instanceof Buffer ? file : await file.arrayBuffer();

    const headers: Record<string, string> = {
      Authorization: uploadData.authorizationToken,
      'Content-Type': contentType,
      'Content-Length': fileContent.byteLength.toString(),
      'X-Bz-File-Name': encodeURIComponent(key),
      'X-Bz-Content-Sha1': 'do_not_verify' // For simplicity, in production you should calculate the SHA1
    };

    // Add custom metadata headers
    Object.entries(metadata).forEach(([key, value]) => {
      headers[`X-Bz-Info-${key}`] = value;
    });

    const response = await fetch(uploadData.uploadUrl, {
      method: 'POST',
      headers,
      body: fileContent
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to B2');
    }

    const result = await response.json();
    return {
      url: `${this.config.endpoint}/${this.config.bucketName}/${result.fileName}`
    };
  }

  public async deleteFile(fileId: string): Promise<void> {
    if (!this.authToken || !this.apiUrl) {
      await this.authenticate();
    }

    const response = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        Authorization: this.authToken!
      },
      body: JSON.stringify({
        fileId,
        fileName: fileId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete file from B2');
    }
  }
}
