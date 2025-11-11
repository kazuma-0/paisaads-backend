import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { Public } from './decorator/public.decorator';
import { CurrentUser } from './decorator/current_user.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body('emailOrPhone') emailOrPhone: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(emailOrPhone, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.login(user);
    response.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });

    return { response: 'ok', user, };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('token', '');
    return {};
  }

  @Get('profile')
  async profile(@CurrentUser() user: any) {
    if (user.role === Role.VIEWER) {
      return {
        id: null,
        name: null,
        phone_number: user.phone,
        role: 'VIEWER',
      };
    }
    return this.authService.getUserProfile(user.sub);
  }

  @Public()
  @Post('viewer-login')
  async viewerLogin(
    @Body('phone') phone: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateViewer(phone);
    if (!user) {
      throw new UnauthorizedException('Invalid phone number');
    }
    const token = await this.authService.login(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/',
    });
    return { message: 'Viewer login successful', user };
  }

  @Public()
  @Post('send-otp')
  async sendOtp(@Body('phone') phone: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    return this.authService.generateOtp(phone);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!phone || !otp) {
      throw new BadRequestException('Phone number and OTP are required');
    }

    const result = await this.authService.verifyOtp(phone, otp);

    if (result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
      });
    }

    return { message: result.message };
  }

  @Public()
  @Post('send-verification-otp')
  async sendVerificationOtp(@Body('phone') phone: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    return this.authService.sendVerificationOtp(phone);
  }

  @Public()
  @Post('verify-account')
  async verifyAccount(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!phone || !otp) {
      throw new BadRequestException('Phone number and OTP are required');
    }

    const result = await this.authService.verifyAccount(phone, otp);

    if (result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
      });
    }

    return { message: result.message, user: result.user };
  }
}
