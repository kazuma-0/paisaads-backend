import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService, ReportDateRange } from './reports.service';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AdType } from 'src/common/enums/ad-type';
import {
  AdvancedFilterDto,
  AdvancedFilterResponse,
} from './dto/advanced-filter.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('line-ad-stats')
  async getLineAdStats() {
    return this.reportsService.getLineAdStats();
  }

  @Get('line-ads')
  async getLineAdsByStatusAndTimeFrame(
    @Query('status') status: AdStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reportsService.getLineAdsByStatusAndTimeFrame(
      status,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit,
    );
  }

  @Get('ad-stats')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  async getAdStats(
    @Query('type') type: AdType,
    @Query('status') status: AdStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.reportsService.getAdStats(
      type,
      status,
      page,
      limit,
      startDate,
      endDate,
    );
  }
  @Get('filtered-ads')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get filtered ads with comprehensive filtering options',
    description:
      'Retrieve ads based on multiple filter criteria including date range, ad type, user type, status, location, and categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved filtered ads',
    type: AdvancedFilterResponse,
  })
  async getFilteredAds(@Query() filters: AdvancedFilterDto) {
    return this.reportsService.getFilteredAds(filters);
  }

  @Get('filtered-stats')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get statistics for filtered ads',
    description:
      'Get comprehensive statistics including breakdowns by status, type, location, category, and user type',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved filtered ad statistics',
  })
  async getFilteredAdStats(@Query() filters: AdvancedFilterDto) {
    return this.reportsService.getFilteredAdStats(filters);
  }

  @Get('categories')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get categories for dropdown population',
    description:
      'Retrieve all categories (main, subcategories) for use in filter dropdowns',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved categories',
  })
  async getCategoriesForFilters() {
    return this.reportsService.getCategoriesForFilters();
  }

  @Get('user-types')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get available user types for filtering',
    description:
      'Retrieve all unique user types (posted by) values for filter dropdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user types',
  })
  async getUserTypesForFilters() {
    return this.reportsService.getUserTypesForFilters();
  }

  @Get('locations')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get locations for filtering',
    description: 'Retrieve all unique states and cities for location filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved locations',
  })
  async getLocationsForFilters() {
    return this.reportsService.getLocationsForFilters();
  }

  @Get('export')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Export filtered ads data',
    description: 'Export ads data based on filters to CSV format',
  })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel'], required: false })
  @ApiResponse({
    status: 200,
    description: 'Successfully exported filtered ads data',
  })
  async exportFilteredAds(
    @Query() filters: AdvancedFilterDto,
    @Query('format') format: 'csv' | 'excel' = 'csv',
  ) {
    return this.reportsService.exportFilteredAds(filters, format);
  }

  @Get('users/registrations')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get user registration reports',
    description:
      'Get user registration statistics with date range and period grouping',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    required: false,
  })
  async getUserRegistrationReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period,
    };
    return this.reportsService.getUserRegistrationReport(dateRange);
  }

  @Get('users/active-vs-inactive')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get active vs inactive users',
    description: 'Get breakdown of active vs inactive users with percentages',
  })
  async getActiveVsInactiveUsersReport() {
    return this.reportsService.getActiveVsInactiveUsersReport();
  }

  @Get('users/login-activity')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get user login activity report',
    description: 'Get user activity patterns based on profile updates',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    required: false,
  })
  async getUserLoginActivityReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period,
    };
    return this.reportsService.getUserLoginActivityReport(dateRange);
  }

  @Get('users/views-by-category')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get user views per listing category',
    description: 'Get estimated user engagement by category',
  })
  async getUserViewsByCategoryReport() {
    return this.reportsService.getUserViewsByCategoryReport();
  }

  @Get('admin/activity')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get admin activity report',
    description:
      'Get comprehensive admin activity breakdown with approvals, rejections, etc.',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    required: false,
  })
  @ApiQuery({ name: 'adminId', required: false, type: String })
  async getAdminActivityReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('adminId') adminId?: string,
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period,
    };
    return this.reportsService.getAdminActivityReport(dateRange, adminId);
  }

  @Get('admin/user-wise-activity')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get admin user-wise activity report',
    description: 'Get activity breakdown for each admin user',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getAdminUserWiseActivityReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    return this.reportsService.getAdminUserWiseActivityReport(dateRange);
  }

  @Get('admin/activity-by-category')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get admin activity by category',
    description: 'Get admin actions breakdown by category',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getAdminActivityByCategoryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
    return this.reportsService.getAdminActivityByCategoryReport(dateRange);
  }

  @Get('listings/analytics')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get comprehensive listing analytics',
    description:
      'Get detailed listing performance analytics including images, categories, approval times',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getListingAnalyticsReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;
    return this.reportsService.getListingAnalyticsReport(dateRange);
  }

  @Get('listings/active-by-category')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get active listings count by category',
    description: 'Get count of active published listings grouped by category',
  })
  async getActiveListingsByCategory() {
    return this.reportsService.getActiveListingsByCategory();
  }

  @Get('listings/approval-times')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get approval time analytics',
    description: 'Get detailed approval time statistics for all ads',
  })
  async getApprovalTimeReport() {
    return this.reportsService.getApprovalTimeReport();
  }

  @Get('listings/by-user')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get listings by user report',
    description: 'Get listing count and details grouped by user who posted',
  })
  async getListingsByUserReport() {
    return this.reportsService.getListingsByUserReport();
  }

  @Get('payments/transactions')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get payment transaction report',
    description: 'Get comprehensive payment and revenue analytics',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    required: false,
  })
  async getPaymentTransactionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    const dateRange: ReportDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period,
    };
    return this.reportsService.getPaymentTransactionReport(dateRange);
  }

  @Get('payments/revenue-by-product')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get revenue by product type',
    description: 'Get revenue breakdown by Line Ads, Poster Ads, and Video Ads',
  })
  async getRevenueByProduct() {
    return this.reportsService.getRevenueByProduct();
  }

  @Get('payments/revenue-by-category')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR, Role.REVIEWER)
  @ApiOperation({
    summary: 'Get revenue by category',
    description: 'Get revenue breakdown by ad categories',
  })
  async getRevenueByCategoryReport() {
    return this.reportsService.getRevenueByCategoryReport();
  }
}
