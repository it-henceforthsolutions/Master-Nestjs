import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersModel } from 'src/users/schema/users.schema';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    MongooseModule.forFeature([{ name: Users.name, schema: UsersModel },])
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
