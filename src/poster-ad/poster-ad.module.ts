import { Module } from '@nestjs/common';
import { PosterAdService } from './poster-ad.service';
import { PosterAdController } from './poster-ad.controller';
import { CategoryModule } from '../category/category.module';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosterAd } from './entities/poster-ad.entity';
import { AdPositionModule } from '../ad-position/ad-position.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PosterAd]),
    CategoryModule,
    ImageModule,
    UserModule,
    AdPositionModule,
  ],
  controllers: [PosterAdController],
  providers: [PosterAdService],
  exports: [PosterAdService],
})
export class PosterAdModule {}
