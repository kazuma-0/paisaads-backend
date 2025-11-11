import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Image } from './entities/image.entity';
@Injectable()
export class ImageService {
  constructor(@InjectRepository(Image) private imageRepo: Repository<Image>) {}

  async saveImage(file: Express.Multer.File): Promise<Image> {
    const image = this.imageRepo.create({
      fileName: file.filename,
      filePath: file.path,
    });
    return await this.imageRepo.save(image);
  }

  async confirmImage(id: string): Promise<Image> {
    const image = await this.imageRepo.findOne({ where: { id } });
    if (!image)
      throw new NotFoundException('Image not found or already confirmed');

    image.isTemp = false;

    return await this.imageRepo.save(image);
  }

  async exists(id: string): Promise<boolean> {
    const image = await this.imageRepo.findOne({ where: { id } });
    return !!image;
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.imageRepo.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    fs.unlinkSync(path.resolve(image.filePath));
    await this.imageRepo.delete(id);
  }
}
