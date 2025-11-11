import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageService } from './image.service';
import { extname } from 'path';
import { Public } from 'src/auth/decorator/public.decorator';

export const proofImageOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      cb(null, Date.now() + extname(file.originalname));
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp|mp4|webm|ogg)$/)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only image files (jpg, jpeg, png, webp) and web‐playable videos (mp4, webm, ogg) are allowed!',
        ),
        false,
      );
    }
  },
};

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @Public()
  @UseInterceptors(FileInterceptor('file', proofImageOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.imageService.saveImage(file);
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    return this.imageService.deleteImage(id);
  }
}
