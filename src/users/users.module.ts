import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersModel } from './schema/users.schema';
import { Sessions, SessionsModel } from './schema/sessions.schema';
import { TwilioModule, TwilioService } from 'nestjs-twilio';
import { CommonModule } from 'src/common/common.module';
import { StripeService } from 'src/stripe/stripe.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersModel },
      { name: Sessions.name, schema: SessionsModel }
    ]),
    CommonModule
  ],
  controllers: [UsersController],
  providers: [UsersService,StripeService],
  exports: [UsersService]
})
export class UsersModule { }
