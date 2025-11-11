import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Customer } from './entities/customer.entity';
import { ImageModule } from 'src/image/image.module';
import { SmsService } from 'src/sms.service';
import { OtpService } from 'src/otp/otp.service';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Customer]), ImageModule,OtpModule],
  controllers: [UserController],
  providers: [UserService,SmsService],
  exports: [UserService],
})
export class UserModule {}
