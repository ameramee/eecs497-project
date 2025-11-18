// s3.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Lazy initialization of S3Client to ensure env vars are loaded
let s3Client = null;

function getS3Client() {
  if (!s3Client) {
    // Validate required environment variables
    const requiredEnvVars = {
      AWS_REGION: process.env.AWS_REGION,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_BUCKET: process.env.AWS_BUCKET,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required AWS environment variables: ${missingVars.join(
          ", "
        )}. ` +
          `Please set these in your .env.local file or environment variables.`
      );
    }

    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

export async function uploadToS3({ buffer, mimeType, originalName }) {
  const s3 = getS3Client();
  const bucket = process.env.AWS_BUCKET;
  const region = process.env.AWS_REGION;

  const key = `uploads/${crypto.randomUUID()}-${originalName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  return {
    key,
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  };
}
