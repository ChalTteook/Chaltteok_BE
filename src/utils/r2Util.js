import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: process.env.R2_REGION,
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (key, buffer, mimetype) => {
  console.log('[R2 업로드 시도]', { key, mimetype, bufferSize: buffer?.length });
  try {
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read',
    }));
    const url = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;
    console.log('[R2 업로드 성공]', { key, url });
    return url;
  } catch (err) {
    console.error('[R2 업로드 실패]', { key, error: err });
    throw err;
  }
};

export const deleteFromR2 = async (key) => {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  }));
};

export const getR2Url = (key) => {
  return `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;
}; 