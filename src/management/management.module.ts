import { Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Managements, ManagementsModel } from './schema/management.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{name:Managements.name, schema:ManagementsModel}])
  ],
  controllers: [ManagementController],
  providers: [ManagementService]
})
export class ManagementModule {}
