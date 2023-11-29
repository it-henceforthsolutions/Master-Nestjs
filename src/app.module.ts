import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import * as stripe from 'nestjs-stripe'
import { config } from 'dotenv'
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constant';
import { MailerModule } from '@nestjs-modules/mailer';
import { DatabaseModule } from './model/model.module';

config()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.DB_URL
      }),
    }),
    stripe.StripeModule.forRootAsync({
      useFactory: () => ({
        apiKey: process.env.STRIPE_SECRET_KEY,
        apiVersion: '2023-10-16'
      })
    }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
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
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
