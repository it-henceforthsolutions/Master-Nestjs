import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersModel } from './schema/users.schema';
import { Sessions, SessionsModel } from './schema/sessions.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Users.name , schema: UsersModel},
      {name: Sessions.name , schema: SessionsModel}
    ])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
