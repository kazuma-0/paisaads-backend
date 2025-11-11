import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data_source';
import { UserModule } from './user/user.module';
import { ImageModule } from './image/image.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { PaymentModule } from './payment/payment.module';
import { LineAdModule } from './line-ad/line-ad.module';
import { AdCommentsModule } from './ad-comments/ad-comments.module';
import { AdDashboardModule } from './ad-dashboard/ad-dashboard.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReportsModule } from './reports/reports.module';
import { ConfigurationsModule } from './configurations/configurations.module';
import { PosterAdModule } from './poster-ad/poster-ad.module';
import { VideoAdModule } from './video-ad/video-ad.module';
import { AdPositionModule } from './ad-position/ad-position.module';
import { SmsService } from './sms.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    ImageModule,
    AuthModule,
    CategoryModule,
    PaymentModule,
    LineAdModule,
    PosterAdModule,
    VideoAdModule,
    AdCommentsModule,
    AdDashboardModule,
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log(join(__dirname, '..', 'uploads'));
        console.log(configService.get<string>('NODE_ENV'));
        return [
          {
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot:
              configService.get<string>('NODE_ENV') === 'development'
                ? '/uploads'
                : '/uploads',
          },
        ];
      },
      inject: [ConfigService],
    }),
    ReportsModule,
    ConfigurationsModule,
    AdPositionModule,
  ],
  controllers: [AppController],
  providers: [AppService, SmsService],
  exports:[SmsService]
})
export class AppModule {}
