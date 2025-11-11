import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineAdService } from './line-ad.service';
import { LineAdController } from './line-ad.controller';
import { LineAd } from './entities/line-ad.entity';
import { CategoryModule } from 'src/category/category.module';
import { ImageModule } from 'src/image/image.module';
import { PaymentModule } from 'src/payment/payment.module';
import { UserModule } from 'src/user/user.module';
import { AdCommentsModule } from 'src/ad-comments/ad-comments.module';
import { AdPositionModule } from 'src/ad-position/ad-position.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LineAd]),
    CategoryModule,
    ImageModule,
    UserModule,
    AdPositionModule,
  ],
  controllers: [LineAdController],
  providers: [LineAdService],
  exports: [LineAdService],
})
export class LineAdModule {}
