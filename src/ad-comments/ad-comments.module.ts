import { Module } from '@nestjs/common';
import { AdCommentController } from './ad-comments.controller';
import { AdCommentService } from './ad-comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdComment } from './entities/ad-comment.entity';
import { LineAdModule } from 'src/line-ad/line-ad.module';
import { UserModule } from 'src/user/user.module';
import { PosterAdModule } from 'src/poster-ad/poster-ad.module';
import { VideoAdModule } from 'src/video-ad/video-ad.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdComment]),
    UserModule,
    LineAdModule,
    PosterAdModule,
    VideoAdModule,
  ],
  controllers: [AdCommentController],
  providers: [AdCommentService],
  exports: [AdCommentService],
})
export class AdCommentsModule {}
