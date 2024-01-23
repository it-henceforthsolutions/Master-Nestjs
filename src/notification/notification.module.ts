import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Notifications, NotificationsModel } from './schema/notifications.schema';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    MongooseModule.forFeature([{ name: Notifications.name, schema: NotificationsModel }])
  ],
  
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
