import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: any[];
  maxFileSize?: number;
}

class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: options.resource_type || "auto",
        folder: options.folder || "social-media",
        transformation: options.transformation,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Upload failed: No result returned"));
          }
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
          });
        }
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Error deleting file ${publicId}:`, error);
      throw error;
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error("Error deleting multiple files:", error);
      throw error;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
