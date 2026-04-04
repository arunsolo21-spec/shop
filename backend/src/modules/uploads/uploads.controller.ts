import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Logger } from '@nestjs/common';

@Controller('upload')
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('📥 [CONTROLLER] Upload request received');
    this.logger.log('📥 [CONTROLLER] File:', file?.originalname);
    this.logger.log('📥 [CONTROLLER] File size:', file?.size);
    this.logger.log('📥 [CONTROLLER] File type:', file?.mimetype);
    
    if (!file) {
      this.logger.error('❌ [CONTROLLER] No file provided');
      throw new BadRequestException('No image file provided');
    }
    
    try {
      this.logger.log('⚙️ [CONTROLLER] Calling service...');
      const result = await this.uploadsService.uploadImage(file);
      this.logger.log('✅ [CONTROLLER] Upload successful:', result);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('❌ [CONTROLLER] Upload failed:', error.message);
      this.logger.error('❌ [CONTROLLER] Error stack:', error.stack);
      throw error;
    }
  }
}