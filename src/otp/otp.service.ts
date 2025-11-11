import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async generateOtp(phoneNumber: string, user?: User, purpose: string = 'LOGIN'): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.otpRepository.update(
      { phone_number: phoneNumber, is_verified: false },
      { isActive: false }
    );

    const otp = this.otpRepository.create({
      phone_number: phoneNumber,
      otp_code: otpCode,
      expires_at: expiresAt,
      purpose,
      user,
    });

    await this.otpRepository.save(otp);
    return otpCode;
  }

  async verifyOtp(phoneNumber: string, otpCode: string, purpose: string = 'LOGIN'): Promise<Otp | null> {
    const otp = await this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        otp_code: otpCode,
        purpose,
        is_verified: false,
        isActive: true,
      },
      relations: ['user'],
    });

    if (!otp) {
      return null;
    }

    if (new Date() > otp.expires_at) {
      return null;
    }

    otp.is_verified = true;
    await this.otpRepository.save(otp);

    return otp;
  }

  async invalidateOtps(phoneNumber: string, purpose?: string): Promise<void> {
    const whereCondition: any = {
      phone_number: phoneNumber,
      is_verified: false,
      isActive: true,
    };

    if (purpose) {
      whereCondition.purpose = purpose;
    }

    await this.otpRepository.update(whereCondition, { isActive: false });
  }

  async findValidOtp(phoneNumber: string, purpose: string = 'LOGIN'): Promise<Otp | null> {
    return this.otpRepository.findOne({
      where: {
        phone_number: phoneNumber,
        purpose,
        is_verified: false,
        isActive: true,
      },
      relations: ['user'],
    });
  }
}