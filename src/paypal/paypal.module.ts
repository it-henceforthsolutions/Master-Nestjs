import { Module } from '@nestjs/common';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaypalPlan, PaypalPlanSchema } from './schema/plan.schema';
import { PaypalPayment, PaypalPaymentSchema } from './schema/payment.schema';
import { PaypalSubscription, PaypalSubscriptionSchema } from './schema/subscription.schema';

@Module({
  imports: [//ModelModule,
    MongooseModule.forFeature([
      { name: PaypalPlan.name, schema: PaypalPlanSchema },
      { name: PaypalPayment.name, schema: PaypalPaymentSchema },
      { name: PaypalSubscription.name, schema: PaypalSubscriptionSchema }
]),],
  controllers: [PaypalController],
  providers: [PaypalService]
})
export class PaypalModule {}
