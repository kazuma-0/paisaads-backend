import { Module } from '@nestjs/common';
import { CategoryModule } from '../category/category.module';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoAd } from './entities/video-ad.entity';
import { VideoAdService } from './video-ad.service';
import { VideoAdController } from './video-ad.controller';
import { AdPositionModule } from 'src/ad-position/ad-position.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoAd]),
    CategoryModule,
    ImageModule,
    UserModule,
    AdPositionModule,
  ],
  controllers: [VideoAdController],
  providers: [VideoAdService],
  exports: [VideoAdService],
})
export class VideoAdModule {}
