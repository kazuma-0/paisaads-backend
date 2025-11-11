import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdDashboardService } from './ad-dashboard.service';
import { CurrentUser } from 'src/auth/decorator/current_user.decorator';

@Controller('ad-dashboard')
export class AdDashboardController {
  constructor(private readonly adDashboardService: AdDashboardService) {}

  @Get('user')
  async getUserDashboard(@CurrentUser() user) {
    return this.adDashboardService.getAdDashboard(user.sub);
  }

  @Get('global')
  async getGlobalDashboard() {
    return this.adDashboardService.getGlobalAdDashboard();
  }
}
