import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir: string;

  constructor(private readonly cloudinaryProvider: CloudinaryProvider) {
    this.uploadDir = path.join(process.cwd(), AppConfig.uploadPath);
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{ imageUrl: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file buffer is empty');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    const maxSize = AppConfig.maxFileSize;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      if (this.cloudinaryProvider.isAvailable()) {
        this.logger.log('Using Cloudinary for upload');
        const result = await this.cloudinaryProvider.uploadImage(file, 'freshmart');
        return { imageUrl: result.imageUrl };
      } else {
        this.logger.log('Cloudinary not available, using local storage');
        return this.uploadToLocal(file);
      }
    } catch (error) {
      this.logger.error('Cloudinary upload failed, trying local storage', error);
      return this.uploadToLocal(file);
    }
  }

  private async uploadToLocal(file: Express.Multer.File): Promise<{ imageUrl: string }> {
    try {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const ext = path.extname(file.originalname);
      const filename = `image-${uniqueSuffix}${ext}`;
      const filepath = path.join(this.uploadDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      if (!fs.existsSync(filepath)) {
        throw new BadRequestException('Failed to save file to disk');
      }

      const imageUrl = `/uploads/${filename}`;
      this.logger.log(`Image saved locally: ${imageUrl}`);

      return { imageUrl };
    } catch (error) {
      this.logger.error('Local upload failed', error);
      throw new BadRequestException('Failed to upload image: ' + error.message);
    }
  }
}