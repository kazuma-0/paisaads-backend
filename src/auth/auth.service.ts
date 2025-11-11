import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SmsService } from '../sms.service';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
  ) {}

  async validateUser(emailOrPhone: string, password: string) {
    const user =
      await this.userService.findByPhoneOrEmailWithPassword(emailOrPhone);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async validateViewer(phone: string) {
    return { id: null, name: null, phone_number: phone, role: 'VIEWER' };
  }

  async login(user: any): Promise<string> {
    if (user.role === 'VIEWER' && !user.id) {
      const payload = { sub: null, role: 'VIEWER', phone: user.phone_number };
      return this.jwtService.sign(payload);
    }
    const payload = {
      name: user.name,
      sub: user.id,
      role: user.role,
      phone_verified: user.phone_verified,
    };
    return this.jwtService.sign(payload);
  }

  async getUserProfile(userId: string): Promise<User> {
    return this.userService.findOneById(userId);
  }

  async generateOtp(phone: string): Promise<{ message: string }> {
    const user = await this.userService.findByPhone(phone);

    if (
      user &&
      (user.role === 'SUPER_ADMIN' ||
        user.role === 'EDITOR' ||
        user.role === 'REVIEWER')
    ) {
      throw new BadRequestException(
        'Admin users should use regular login, not OTP',
      );
    }

    await this.otpService.invalidateOtps(phone, 'LOGIN');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const otp = await this.otpService.generateOtp(phone, user ?? undefined);

    const smsSent = await this.smsService.sendOtp(phone, otp);

    if (!smsSent) {
      console.log(`SMS failed, OTP for ${phone}: ${otp}`);
      return { message: 'OTP generated but SMS delivery may have failed' };
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    phone: string,
    otpCode: string,
  ): Promise<{ message: string; token?: string }> {
    const otp = await this.otpService.findValidOtp(phone, 'LOGIN');

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpService.invalidateOtps(phone, 'LOGIN');

    let user;
    if (otp.user) {
      user = {
        id: otp.user.id,
        name: otp.user.name,
        phone_number: otp.user.phone_number,
        role: otp.user.role,
        phone_verified: otp.user.phone_verified,
      };
    } else {
      user = { id: null, name: null, phone_number: phone, role: 'VIEWER' };
    }

    const token = await this.login(user);

    return { message: 'OTP verified successfully', token };
  }

  async sendVerificationOtp(phone: string): Promise<{ message: string }> {
    const user = await this.userService.findByPhone(phone);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.phone_verified) {
      throw new BadRequestException('Phone number is already verified');
    }

    await this.otpService.invalidateOtps(phone, 'PHONE_VERIFICATION');

    const otp = await this.otpService.generateOtp(
      phone,
      user,
      'PHONE_VERIFICATION',
    );

    const smsSent = await this.smsService.sendOtp(phone, otp);
    if (!smsSent) {
      console.log(`SMS failed, Verification OTP for ${phone}: ${otp}`);
      return {
        message: 'Verification OTP generated but SMS delivery may have failed',
      };
    }

    return { message: 'Verification OTP sent to your phone' };
  }

  async verifyAccount(
    phone: string,
    otpCode: string,
  ): Promise<{ message: string; user?: any; token?: string }> {
    const otp = await this.otpService.findValidOtp(phone, 'PHONE_VERIFICATION');

    if (!otp || !otp.user) {
      throw new BadRequestException('Invalid or expired verification OTP');
    }

    await this.otpService.invalidateOtps(phone, 'PHONE_VERIFICATION');

    await this.userService.updateUser(otp.user.id, { phone_verified: true });

    const updatedUser = await this.userService.findOneById(otp.user.id);
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      phone_number: updatedUser.phone_number,
      role: updatedUser.role,
      phone_verified: true,
    };

    const token = await this.login(userData);

    return {
      message: 'Phone number verified successfully',
      user: userData,
      token,
    };
  }
}
