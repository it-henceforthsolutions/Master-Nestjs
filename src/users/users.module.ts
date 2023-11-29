import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersModel } from './schema/users.schema';
import { Sessions, SessionsModel } from './schema/sessions.schema';
import { TwilioModule, TwilioService } from 'nestjs-twilio';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersModel },
      { name: Sessions.name, schema: SessionsModel }
    ]),
    TwilioModule.forRootAsync({
      useFactory: () => ({
        accountSid: process.env.TWILIO_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      })
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
