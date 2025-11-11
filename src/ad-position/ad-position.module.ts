import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdPositionService } from './ad-position.service';
import { AdPositionController } from './ad-position.controller';
import { AdPosition } from './entities/ad-position.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdPosition,
      PosterAd,
      VideoAd,
      LineAd,
      MainCategory,
    ]),
  ],
  controllers: [AdPositionController],
  providers: [AdPositionService],
  exports: [AdPositionService],
})
export class AdPositionModule {}
