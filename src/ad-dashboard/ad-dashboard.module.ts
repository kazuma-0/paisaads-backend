import { Module } from '@nestjs/common';
import { AdDashboardService } from './ad-dashboard.service';
import { AdDashboardController } from './ad-dashboard.controller';
import { LineAdModule } from 'src/line-ad/line-ad.module';
import { PosterAdModule } from 'src/poster-ad/poster-ad.module';
import { VideoAdModule } from 'src/video-ad/video-ad.module';
@Module({
  imports: [LineAdModule, PosterAdModule, VideoAdModule],
  providers: [AdDashboardService],
  controllers: [AdDashboardController],
})
export class AdDashboardModule {}
