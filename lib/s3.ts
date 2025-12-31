import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Deleting single file from S3 Function
export async function deleteFromS3(url: string): Promise<void> {
  if (!url || !bucketName) return;

  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.substring(1);

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    console.log(`Deleted from S3: ${key}`);
  } catch (error) {
    console.error(`Failed to delete from S3: ${url}`, error);
  }
}

// Deleting multiple files from S3 Function
export async function deleteMultipleFromS3(urls: string[]): Promise<void> {
  const deletePromises = urls
    .filter((url) => url)
    .map((url) => deleteFromS3(url));

  await Promise.allSettled(deletePromises);
}
