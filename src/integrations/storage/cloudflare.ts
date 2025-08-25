export interface CloudflareConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  customDomain?: string;
}

export interface UploadParams {
  file: File | Buffer;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export class CloudflareR2Storage {
  private baseUrl: string;

  constructor(private config: CloudflareConfig) {
    this.baseUrl = config.customDomain || 
      `https://${config.accountId}.r2.cloudflarestorage.com`;
  }

  private async signRequest(method: string, path: string, headers: Record<string, string> = {}): Promise<Record<string, string>> {
    const date = new Date().toISOString().split('T')[0];
    const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    headers = {
      'host': new URL(this.baseUrl).host,
      'x-amz-date': datetime,
      ...headers
    };

    // Create canonical request
    const canonicalRequest = [
      method,
      path,
      '', // query string
      Object.entries(headers)
        .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
        .sort()
        .join('\n'),
      '',
      Object.keys(headers)
        .map(h => h.toLowerCase())
        .sort()
        .join(';'),
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      datetime,
      `${date}/auto/s3/aws4_request`,
      await this.sha256(canonicalRequest)
    ].join('\n');

    const signature = await this.calculateSignature(date, stringToSign);

    const authorization = [
      'AWS4-HMAC-SHA256 Credential=' + this.config.accessKeyId + '/' + date + '/auto/s3/aws4_request',
      'SignedHeaders=' + Object.keys(headers).map(h => h.toLowerCase()).sort().join(';'),
      'Signature=' + signature
    ].join(', ');

    return {
      ...headers,
      'Authorization': authorization,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
    };
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async calculateSignature(date: string, stringToSign: string): Promise<string> {
    const kDate = await this.hmacSha256('AWS4' + this.config.secretAccessKey, date);
    const kRegion = await this.hmacSha256(kDate, 'auto');
    const kService = await this.hmacSha256(kRegion, 's3');
    const kSigning = await this.hmacSha256(kService, 'aws4_request');
    return await this.hmacSha256(kSigning, stringToSign);
  }

  private async hmacSha256(key: string | ArrayBuffer, message: string): Promise<string> {
    const keyBuffer = key instanceof ArrayBuffer ? key :
      new TextEncoder().encode(key);
    const messageBuffer = new TextEncoder().encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageBuffer
    );

    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public async uploadFile({ file, key, contentType = 'application/octet-stream', metadata = {} }: UploadParams): Promise<{ url: string }> {
    const fileContent = file instanceof File ? await file.arrayBuffer() : file;
    const url = `${this.baseUrl}/${this.config.bucketName}/${key}`;

    const headers = await this.signRequest('PUT', `/${this.config.bucketName}/${key}`, {
      'content-type': contentType,
      'content-length': fileContent.byteLength.toString(),
      ...Object.entries(metadata).reduce((acc, [k, v]) => ({
        ...acc,
        [`x-amz-meta-${k.toLowerCase()}`]: v
      }), {})
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: fileContent
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Cloudflare R2');
    }

    return {
      url: this.config.customDomain ?
        `${this.config.customDomain}/${key}` :
        `${this.baseUrl}/${this.config.bucketName}/${key}`
    };
  }

  public async deleteFile(key: string): Promise<void> {
    const url = `${this.baseUrl}/${this.config.bucketName}/${key}`;
    const headers = await this.signRequest('DELETE', `/${this.config.bucketName}/${key}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to delete file from Cloudflare R2');
    }
  }
}
