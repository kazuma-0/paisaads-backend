import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/user/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { UserService } from 'src/user/user.service';
import { ImageService } from 'src/image/image.service';
import { LineAdService } from 'src/line-ad/line-ad.service';
import { AdStatus } from 'src/common/enums/ad-status.enum';
import { PosterAdService } from 'src/poster-ad/poster-ad.service';
import { VideoAdService } from 'src/video-ad/video-ad.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly lineAdService: LineAdService,
    private readonly posterAdService: PosterAdService,
    private readonly videoAdService: VideoAdService,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<Payment> {
    const customer = (await this.userService.findOneById(userId)).customer;
    if (!customer) {
      throw new BadRequestException('Customer data not found');
    }
    const payment = this.paymentRepo.create({
      method: dto.method,
      amount: dto.amount,
      details: dto.details,
      customer,
    });

    const proof = await this.imageService.confirmImage(dto.proofImageId);
    payment.proof = proof;
    const savedPayment = await this.paymentRepo.save(payment);

    if (dto.lineAdId) {
      const lineAd = await this.lineAdService.findOne(dto.lineAdId);
      savedPayment.lineAd = lineAd;
      await this.paymentRepo.save(savedPayment);
      await this.lineAdService.updateAdStatus(
        dto.lineAdId,
        AdStatus.FOR_REVIEW,
      );
      await this.lineAdService.assignOrderId(dto.lineAdId);
    } else if (dto.posterAdId) {
      const posterAd = await this.posterAdService.findOne(dto.posterAdId);
      savedPayment.posterAd = posterAd;
      await this.paymentRepo.save(savedPayment);
      await this.posterAdService.updateAdStatus(
        dto.posterAdId,
        AdStatus.FOR_REVIEW,
      );
    } else if (dto.videoAdId) {
      const videoAd = await this.videoAdService.findOne(dto.videoAdId);
      savedPayment.videoAd = videoAd;
      await this.paymentRepo.save(savedPayment);
      await this.videoAdService.updateAdStatus(
        dto.videoAdId,
        AdStatus.FOR_REVIEW,
      );
    } else {
      throw new BadRequestException(
        'Either lineAdId or posterAdId or videoAdId must be provided',
      );
    }

    return savedPayment;
  }

  async findOne(id: string): Promise<Payment> {
    return this.paymentRepo.findOneOrFail({ where: { id } });
  }

  async updatePayment(
    id: string,
    dto: Partial<CreatePaymentDto>,
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findOneOrFail({ where: { id } });
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }
}
