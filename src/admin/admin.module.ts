import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { StripeService } from 'src/stripe/stripe.service';
import { StripeModule } from 'nestjs-stripe';

@Module({
  imports: [
    CommonModule,
    UsersModule
  ],
  controllers: [AdminController],
  providers: [AdminService,StripeService],
  exports: [AdminService]
})
export class AdminModule {}
