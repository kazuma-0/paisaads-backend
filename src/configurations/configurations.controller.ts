import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigurationsService } from './configurations.service';
import { TermsAndConditionsDto } from './dto/terms-and-conditions';
import { AdPricingDto } from './dto/ad-pricing.dto';
import { PrivacyPolicyDto } from './dto/privacy-policy.dto';
import { SearchSloganDto } from './dto/search-slogan.dto';
import { AboutUsDto } from './dto/about-us.dto';
import { FaqDto } from './dto/faq.dto';
import { ContactPageDto } from './dto/contact-page.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/auth/decorator/public.decorator';

@ApiTags('Configurations')
@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Post('terms-and-conditions')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create or update terms and conditions' })
  @ApiResponse({
    status: 201,
    description: 'Terms and conditions updated successfully',
  })
  async createTermsAndConditions(
    @Body() termsAndConditionsDto: TermsAndConditionsDto,
  ) {
    return this.configurationsService.createTermsAndConditions(
      termsAndConditionsDto,
    );
  }

  @Get('terms-and-conditions')
  @Public()
  @ApiOperation({ summary: 'Get current terms and conditions' })
  @ApiResponse({
    status: 200,
    description: 'Terms and conditions retrieved successfully',
  })
  async getTermsAndConditions() {
    return this.configurationsService.getTermsAndConditions();
  }

  @Post('ad-pricing')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create or update ad pricing' })
  @ApiResponse({ status: 201, description: 'Ad pricing updated successfully' })
  async createOrUpdateAdPricing(@Body() adPricingDto: AdPricingDto) {
    return this.configurationsService.createOrUpdateAdPricing(adPricingDto);
  }

  @Get('ad-pricing')
  @Public()
  @ApiOperation({ summary: 'Get current ad pricing' })
  @ApiResponse({
    status: 200,
    description: 'Ad pricing retrieved successfully',
  })
  async getAdPricing() {
    return this.configurationsService.getAdPricing();
  }

  @Get('ad-pricing/history')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get ad pricing history' })
  @ApiResponse({
    status: 200,
    description: 'Ad pricing history retrieved successfully',
  })
  async getAdPricingHistory() {
    return this.configurationsService.getAdPricingHistory();
  }

  @Post('privacy-policy')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create or update privacy policy' })
  @ApiResponse({
    status: 201,
    description: 'Privacy policy updated successfully',
  })
  async createOrUpdatePrivacyPolicy(
    @Body() privacyPolicyDto: PrivacyPolicyDto,
  ) {
    return this.configurationsService.createOrUpdatePrivacyPolicy(
      privacyPolicyDto,
    );
  }

  @Get('privacy-policy')
  @Public()
  @ApiOperation({ summary: 'Get current privacy policy' })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy retrieved successfully',
  })
  async getPrivacyPolicy() {
    return this.configurationsService.getPrivacyPolicy();
  }

  @Get('privacy-policy/history')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get privacy policy history' })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy history retrieved successfully',
  })
  async getPrivacyPolicyHistory() {
    return this.configurationsService.getPrivacyPolicyHistory();
  }

  @Post('search-slogan')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create or update search page slogan' })
  @ApiResponse({
    status: 201,
    description: 'Search slogan updated successfully',
  })
  async createOrUpdateSearchSlogan(@Body() searchSloganDto: SearchSloganDto) {
    return this.configurationsService.createOrUpdateSearchSlogan(
      searchSloganDto,
    );
  }

  @Get('search-slogan')
  @Public()
  @ApiOperation({ summary: 'Get current search page slogan' })
  @ApiResponse({
    status: 200,
    description: 'Search slogan retrieved successfully',
  })
  async getSearchSlogan() {
    return this.configurationsService.getSearchSlogan();
  }

  @Post('about-us')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create or update about us page' })
  @ApiResponse({
    status: 201,
    description: 'About us page updated successfully',
  })
  async createOrUpdateAboutUs(@Body() aboutUsDto: AboutUsDto) {
    return this.configurationsService.createOrUpdateAboutUs(aboutUsDto);
  }

  @Get('about-us')
  @Public()
  @ApiOperation({ summary: 'Get current about us page content' })
  @ApiResponse({
    status: 200,
    description: 'About us content retrieved successfully',
  })
  async getAboutUs() {
    return this.configurationsService.getAboutUs();
  }

  @Post('faq')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create or update FAQ page' })
  @ApiResponse({ status: 201, description: 'FAQ updated successfully' })
  async createOrUpdateFaq(@Body() faqDto: FaqDto) {
    return this.configurationsService.createOrUpdateFaq(faqDto);
  }

  @Get('faq')
  @Public()
  @ApiOperation({ summary: 'Get FAQ content' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved successfully' })
  async getFaq() {
    return this.configurationsService.getFaq();
  }

  @Get('faq/category/:category')
  @Public()
  @ApiOperation({ summary: 'Get FAQ by category' })
  @ApiParam({ name: 'category', description: 'FAQ category' })
  @ApiResponse({
    status: 200,
    description: 'FAQ category retrieved successfully',
  })
  async getFaqByCategory(@Param('category') category: string) {
    return this.configurationsService.getFaqByCategory(category);
  }

  @Post('faq/question')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Add a new FAQ question' })
  @ApiResponse({ status: 201, description: 'FAQ question added successfully' })
  async addFaqQuestion(
    @Body() body: { question: string; answer: string; category: string },
  ) {
    return this.configurationsService.addFaqQuestion(
      body.question,
      body.answer,
      body.category,
    );
  }

  @Patch('faq/question/:index')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update an existing FAQ question' })
  @ApiParam({ name: 'index', description: 'Question index' })
  @ApiResponse({
    status: 200,
    description: 'FAQ question updated successfully',
  })
  async updateFaqQuestion(
    @Param('index') index: string,
    @Body()
    updatedQuestion: Partial<{
      question: string;
      answer: string;
      category: string;
      order: number;
      isActive: boolean;
    }>,
  ) {
    return this.configurationsService.updateFaqQuestion(
      parseInt(index),
      updatedQuestion,
    );
  }

  @Post('contact-page')
  @Roles(Role.SUPER_ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create or update contact page' })
  @ApiResponse({
    status: 201,
    description: 'Contact page updated successfully',
  })
  async createOrUpdateContactPage(@Body() contactPageDto: ContactPageDto) {
    return this.configurationsService.createOrUpdateContactPage(contactPageDto);
  }

  @Get('contact-page')
  @Public()
  @ApiOperation({ summary: 'Get contact page information' })
  @ApiResponse({
    status: 200,
    description: 'Contact page retrieved successfully',
  })
  async getContactPage() {
    return this.configurationsService.getContactPage();
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all configurations' })
  @ApiResponse({
    status: 200,
    description: 'All configurations retrieved successfully',
  })
  async getAllConfigurations() {
    return this.configurationsService.getAllConfigurations();
  }
}
