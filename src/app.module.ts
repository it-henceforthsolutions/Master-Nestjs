import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import * as stripe from 'nestjs-stripe';
import { config } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constant';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminModule } from './admin/admin.module';
import { DbBackupModule } from './db-backup/db-backup.module';
import { ManagementModule } from './management/management.module';
import { FaqsModule } from './faqs/faqs.module';
import { PagesModule } from './pages/pages.module';
import { QuotesModule } from './quotes/quotes.module';
import { StaffModule } from './staff/staff.module';
import { StripeModule } from './stripe/stripe.module';
// import { ChatModule } from './chatold/chat.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { AgoraModule } from './agora/agora.module';
import { ModelModule } from './model/model.module';
import { PaypalModule } from './paypal/paypal.module';
import { UploadModule } from './upload/upload.module';

config();
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.DB_URL,
      }),
    }),
    stripe.StripeModule.forRootAsync({
      useFactory: () => ({
        apiKey: process.env.STRIPE_SECRET_KEY,
        apiVersion: '2023-10-16',
      }),
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' }, ///one months
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      },
    }),
    UsersModule,
    AdminModule,
    DbBackupModule,
    ManagementModule,
    FaqsModule,
    PagesModule,
    QuotesModule,
    StaffModule,
    StripeModule,
    ChatModule,
    NotificationModule,
    AgoraModule,
    ModelModule,
    PaypalModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
