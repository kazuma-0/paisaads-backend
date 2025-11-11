import { Injectable } from '@nestjs/common';
import { LineAdService } from 'src/line-ad/line-ad.service';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { PosterAdService } from 'src/poster-ad/poster-ad.service';
import { VideoAdService } from 'src/video-ad/video-ad.service';

@Injectable()
export class AdDashboardService {
  constructor(
    private readonly lineAdService: LineAdService,
    private readonly posterAdService: PosterAdService,
    private readonly videoAdService: VideoAdService,
  ) {}

  async getAdDashboard(userId: string) {
    const lineAds = await this.lineAdService.findAllByUserId(userId);
    const posterAds = await this.posterAdService.findAllByUserId(userId);
    const videoAds = await this.videoAdService.findAllByUserId(userId);
    console.log('vid', videoAds.length);

    const ads = [...lineAds, ...posterAds, ...videoAds];

    const statusCounts = Object.values(AdStatus).reduce(
      (acc, status) => {
        acc[status] = ads.filter((ad) => ad.status === status).length;
        return acc;
      },
      {} as Record<AdStatus, number>,
    );

    return {
      lineAds: lineAds.length,
      posterAds: posterAds.length,
      videoAds: videoAds.length,
      totalAds: ads.length,
      statusCounts,
      ads,
    };
  }

  async getGlobalAdDashboard() {
    const lineAds = await this.lineAdService.findAll();
    const posterAds = await this.posterAdService.findAll();
    const videoAds = await this.videoAdService.findAll();

    const ads = [...lineAds, ...posterAds, ...videoAds];

    const statusCounts = Object.values(AdStatus).reduce(
      (acc, status) => {
        acc[status] = ads.filter((ad) => ad.status === status).length;
        return acc;
      },
      {} as Record<AdStatus, number>,
    );

    return {
      lineAds: lineAds.length,
      posterAds: posterAds.length,
      videoAds: videoAds.length,
      totalAds: ads.length,
      statusCounts,
      ads,
    };
  }
}
