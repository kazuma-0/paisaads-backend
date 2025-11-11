import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { LineAdModule } from 'src/line-ad/line-ad.module';
import { PosterAdModule } from 'src/poster-ad/poster-ad.module';
import { VideoAdModule } from 'src/video-ad/video-ad.module';
import { LineAd } from 'src/line-ad/entities/line-ad.entity';
import { PosterAd } from 'src/poster-ad/entities/poster-ad.entity';
import { VideoAd } from 'src/video-ad/entities/video-ad.entity';
import { User } from 'src/user/entities/user.entity';
import { Customer } from 'src/user/entities/customer.entity';
import { Admin } from 'src/user/entities/admin.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { AdComment } from 'src/ad-comments/entities/ad-comment.entity';
import { MainCategory } from 'src/category/entities/main-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LineAd,
      PosterAd,
      VideoAd,
      User,
      Customer,
      Admin,
      Payment,
      AdComment,
      MainCategory,
    ]),
    LineAdModule,
    PosterAdModule,
    VideoAdModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
