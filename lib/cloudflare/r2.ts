import 'server-only';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 for object storage (S3-compatible)
 * Pricing: $0.015/GB/month storage, zero egress fees
 */
class CloudflareR2 {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID!;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
    this.bucketName = process.env.R2_BUCKET_NAME || 'istani-storage';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing Cloudflare R2 configuration');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Upload file to R2
   */
  async upload(
    key: string,
    body: Buffer | Uint8Array,
    contentType?: string
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
      })
    );
  }

  /**
   * Get file from R2
   */
  async get(key: string): Promise<Buffer | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      if (!response.Body) return null;

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') return null;
      throw error;
    }
  }

  /**
   * Delete file from R2
   */
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }

  /**
   * Get signed URL for temporary access (default 1 hour)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
      { expiresIn }
    );
  }

  /**
   * List objects with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      })
    );

    return response.Contents?.map((item) => item.Key!).filter(Boolean) || [];
  }
}

// Export singleton
export const r2 = new CloudflareR2();
