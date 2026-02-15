import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { env } from '@/lib/env';

function getR2Client() {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return null;
  }
  
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  if (!client || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
    throw new Error('R2 not configured');
  }
  
  const key = `toppers/${Date.now()}-${fileName}`;

  const upload = new Upload({
    client,
    params: {
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    },
  });

  await upload.done();

  return `${env.R2_PUBLIC_URL}/${key}`;
}

export function getR2Url(key: string): string {
  return `${env.R2_PUBLIC_URL || ''}/${key}`;
}
