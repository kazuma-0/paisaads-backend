import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TermsAndConditions } from './schemas/terms-and-conditions.schema';
import { AdPricing } from './schemas/ad-pricing.schema';
import { PrivacyPolicy } from './schemas/privacy-policy.schema';
import { SearchSlogan } from './schemas/search-slogan.schema';
import { AboutUs } from './schemas/about-us.schema';
import { Faq } from './schemas/faq.schema';
import { ContactPage } from './schemas/contact-page.schema';
import { TermsAndConditionsDto } from './dto/terms-and-conditions';
import { AdPricingDto } from './dto/ad-pricing.dto';
import { PrivacyPolicyDto } from './dto/privacy-policy.dto';
import { SearchSloganDto } from './dto/search-slogan.dto';
import { AboutUsDto } from './dto/about-us.dto';
import { FaqDto } from './dto/faq.dto';
import { ContactPageDto } from './dto/contact-page.dto';

@Injectable()
export class ConfigurationsService {
  constructor(
    @InjectModel(TermsAndConditions.name)
    private termsAndConditionsModel: Model<TermsAndConditions>,
    @InjectModel(AdPricing.name)
    private adPricingModel: Model<AdPricing>,
    @InjectModel(PrivacyPolicy.name)
    private privacyPolicyModel: Model<PrivacyPolicy>,
    @InjectModel(SearchSlogan.name)
    private searchSloganModel: Model<SearchSlogan>,
    @InjectModel(AboutUs.name)
    private aboutUsModel: Model<AboutUs>,
    @InjectModel(Faq.name)
    private faqModel: Model<Faq>,
    @InjectModel(ContactPage.name)
    private contactPageModel: Model<ContactPage>,
  ) {}

  async createTermsAndConditions(termsAndConditionsDto: TermsAndConditionsDto) {
    const termsAndConditions =
      await this.termsAndConditionsModel.findOneAndUpdate(
        {},
        { content: termsAndConditionsDto.content },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );
    return termsAndConditions;
  }

  async getTermsAndConditions() {
    const termsAndConditions = await this.termsAndConditionsModel.findOne();
    return termsAndConditions;
  }

  async createOrUpdateAdPricing(adPricingDto: AdPricingDto) {
    const adPricing = await this.adPricingModel.findOneAndUpdate(
      {},
      {
        ...adPricingDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return adPricing;
  }

  async getAdPricing() {
    const adPricing = await this.adPricingModel.findOne({ isActive: true });
    return adPricing;
  }

  async getAdPricingHistory() {
    const pricingHistory = await this.adPricingModel
      .find()
      .sort({ lastUpdated: -1 });
    return pricingHistory;
  }

  async createOrUpdatePrivacyPolicy(privacyPolicyDto: PrivacyPolicyDto) {
    const privacyPolicy = await this.privacyPolicyModel.findOneAndUpdate(
      {},
      {
        ...privacyPolicyDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return privacyPolicy;
  }

  async getPrivacyPolicy() {
    const privacyPolicy = await this.privacyPolicyModel.findOne({
      isActive: true,
    });
    return privacyPolicy;
  }

  async getPrivacyPolicyHistory() {
    const policyHistory = await this.privacyPolicyModel
      .find()
      .sort({ lastUpdated: -1 });
    return policyHistory;
  }

  async createOrUpdateSearchSlogan(searchSloganDto: SearchSloganDto) {
    const searchSlogan = await this.searchSloganModel.findOneAndUpdate(
      {},
      {
        ...searchSloganDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return searchSlogan;
  }

  async getSearchSlogan() {
    const searchSlogan = await this.searchSloganModel.findOne({
      isActive: true,
    });
    return searchSlogan;
  }

  async createOrUpdateAboutUs(aboutUsDto: AboutUsDto) {
    const aboutUs = await this.aboutUsModel.findOneAndUpdate(
      {},
      {
        ...aboutUsDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return aboutUs;
  }

  async getAboutUs() {
    const aboutUs = await this.aboutUsModel.findOne({ isActive: true });
    return aboutUs;
  }

  async createOrUpdateFaq(faqDto: FaqDto) {
    const faq = await this.faqModel.findOneAndUpdate(
      {},
      {
        ...faqDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return faq;
  }

  async getFaq() {
    const faq = await this.faqModel.findOne({ isActive: true });
    return faq;
  }

  async getFaqByCategory(category: string) {
    const faq = await this.faqModel.findOne({ isActive: true });
    if (!faq) return null;

    const filteredQuestions = faq.questions.filter(
      (q) => q.category === category && q.isActive,
    );

    return {
      ...faq.toObject(),
      questions: filteredQuestions,
    };
  }

  async addFaqQuestion(question: string, answer: string, category: string) {
    const faq = await this.faqModel.findOne({ isActive: true });
    if (!faq) {
      throw new Error('FAQ document not found. Please create FAQ first.');
    }

    const maxOrder = Math.max(...faq.questions.map((q) => q.order), 0);

    faq.questions.push({
      question,
      answer,
      category,
      order: maxOrder + 1,
      isActive: true,
    });

    faq.lastUpdated = new Date();
    await faq.save();
    return faq;
  }

  async updateFaqQuestion(
    questionIndex: number,
    updatedQuestion: Partial<{
      question: string;
      answer: string;
      category: string;
      order: number;
      isActive: boolean;
    }>,
  ) {
    const faq = await this.faqModel.findOne({ isActive: true });
    if (!faq || !faq.questions[questionIndex]) {
      throw new Error('FAQ or question not found');
    }

    Object.assign(faq.questions[questionIndex], updatedQuestion);
    faq.lastUpdated = new Date();
    await faq.save();
    return faq;
  }

  async createOrUpdateContactPage(contactPageDto: ContactPageDto) {
    const contactPage = await this.contactPageModel.findOneAndUpdate(
      {},
      {
        ...contactPageDto,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
    return contactPage;
  }

  async getContactPage() {
    const contactPage = await this.contactPageModel.findOne({ isActive: true });
    return contactPage;
  }

  async getAllConfigurations() {
    const [
      termsAndConditions,
      adPricing,
      privacyPolicy,
      searchSlogan,
      aboutUs,
      faq,
      contactPage,
    ] = await Promise.all([
      this.getTermsAndConditions(),
      this.getAdPricing(),
      this.getPrivacyPolicy(),
      this.getSearchSlogan(),
      this.getAboutUs(),
      this.getFaq(),
      this.getContactPage(),
    ]);

    return {
      termsAndConditions,
      adPricing,
      privacyPolicy,
      searchSlogan,
      aboutUs,
      faq,
      contactPage,
    };
  }
}
