import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LineAdModule } from 'src/line-ad/line-ad.module';
import { UserModule } from 'src/user/user.module';
import { ImageModule } from 'src/image/image.module';
import { PosterAdModule } from 'src/poster-ad/poster-ad.module';
import { VideoAdModule } from 'src/video-ad/video-ad.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    LineAdModule,
    PosterAdModule,
    UserModule,
    ImageModule,
    VideoAdModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
