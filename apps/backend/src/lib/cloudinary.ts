import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 * Applies auto-format and quality optimization.
 */
export async function uploadReportPhoto(
  buffer: Buffer,
  reportId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'townly/reports',
        public_id: reportId,
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
