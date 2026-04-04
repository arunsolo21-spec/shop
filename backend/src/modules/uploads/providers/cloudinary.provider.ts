import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadResult {
  imageUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

@Injectable()
export class CloudinaryProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        this.logger.warn('Cloudinary credentials not fully configured. Using local storage fallback.');
        this.isConfigured = false;
        return;
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      this.isConfigured = true;
      this.logger.log('Cloudinary configured successfully');
    } catch (error) {
      this.logger.error(`Failed to configure Cloudinary: ${error.message}`);
      this.isConfigured = false;
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'freshmart'): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured. Using local storage fallback.');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto:good' },
            ],
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          },
          (error, result) => {
            if (error) {
              this.logger.error(`Cloudinary upload failed: ${error.message}`);
              reject(error);
              return;
            }

            const uploadResult: CloudinaryUploadResult = {
              imageUrl: result?.secure_url || '',
              publicId: result?.public_id || '',
              format: result?.format || '',
              width: result?.width || 0,
              height: result?.height || 0,
              bytes: result?.bytes || 0,
            };

            this.logger.log(`Image uploaded to Cloudinary: ${uploadResult.imageUrl}`);
            resolve(uploadResult);
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error: any) {
      this.logger.error(`Image upload failed: ${error.message}`);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured) {
      return { success: false, message: 'Cloudinary not configured' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(`Image deleted from Cloudinary: ${publicId}`);
        return { success: true, message: 'Image deleted successfully' };
      }

      this.logger.warn(`Failed to delete image from Cloudinary: ${publicId}`);
      return { success: false, message: 'Failed to delete image' };
    } catch (error: any) {
      this.logger.error(`Image deletion failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async getImageUrl(publicId: string, transformations?: Array<Record<string, any>>): Promise<string> {
    if (!this.isConfigured) {
      return '';
    }

    try {
      const url = cloudinary.url(publicId, {
        transformation: transformations || [],
      });

      return url;
    } catch (error: any) {
      this.logger.error(`Failed to generate image URL: ${error.message}`);
      return '';
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'freshmart',
  ): Promise<CloudinaryUploadResult[]> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured. Using local storage fallback.');
    }

    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      this.logger.log(`${results.length} images uploaded to Cloudinary`);
      return results;
    } catch (error: any) {
      this.logger.error(`Multiple image upload failed: ${error.message}`);
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }
}