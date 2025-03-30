import cloudinary from "cloudinary";
import { cloudinaryConfig } from "../config/config";

// Use cloudinary.v2.config() to set up Cloudinary configuration
cloudinary.v2.config({
  cloud_name: cloudinaryConfig.cloud_name,
  api_key: cloudinaryConfig.api_key,
  api_secret: cloudinaryConfig.api_secret,
});

// Define the type for Cloudinary upload result
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any; // Additional properties can be added here as needed
}

export const uploadImage = (file: Express.Multer.File) => {
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    cloudinary.v2.uploader.upload(file.path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as CloudinaryUploadResult);
      }
    });
  });
};
