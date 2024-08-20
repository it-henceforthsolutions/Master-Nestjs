import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { SharpModule } from 'nestjs-sharp';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useFactory: async (configService: ConfigService) => ({
          accessKeyId: configService.get('AWS_ACCESS_KEY'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          region: configService.get('AWS_REGION'),
          endpoint: configService.get('AWS_ENDPOINT'),
        }),
        inject: [ConfigService],
      },
    }),
    SharpModule
  ],
  controllers: [UploadController],
  providers: [UploadService],

})
export class UploadModule { }