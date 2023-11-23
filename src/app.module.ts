import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import * as stripe from 'nestjs-stripe'
import { config } from 'dotenv'

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
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
