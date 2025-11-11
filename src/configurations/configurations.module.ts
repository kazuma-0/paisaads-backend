import { Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TermsAndConditions,
  TermsAndConditionsSchema,
} from './schemas/terms-and-conditions.schema';
import { AdPricing, AdPricingSchema } from './schemas/ad-pricing.schema';
import {
  PrivacyPolicy,
  PrivacyPolicySchema,
} from './schemas/privacy-policy.schema';
import {
  SearchSlogan,
  SearchSloganSchema,
} from './schemas/search-slogan.schema';
import { AboutUs, AboutUsSchema } from './schemas/about-us.schema';
import { Faq, FaqSchema } from './schemas/faq.schema';
import { ContactPage, ContactPageSchema } from './schemas/contact-page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TermsAndConditions.name,
        schema: TermsAndConditionsSchema,
      },
      {
        name: AdPricing.name,
        schema: AdPricingSchema,
      },
      {
        name: PrivacyPolicy.name,
        schema: PrivacyPolicySchema,
      },
      {
        name: SearchSlogan.name,
        schema: SearchSloganSchema,
      },
      {
        name: AboutUs.name,
        schema: AboutUsSchema,
      },
      {
        name: Faq.name,
        schema: FaqSchema,
      },
      {
        name: ContactPage.name,
        schema: ContactPageSchema,
      },
    ]),
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
  exports: [ConfigurationsService],
})
export class ConfigurationsModule {}
