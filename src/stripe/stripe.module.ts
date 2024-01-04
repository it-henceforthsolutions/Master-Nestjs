import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { WebhooksService } from './webhooks.service';
// let stripe_sk_key = process.env.STRIPE_SECRET_KEY;
// console.log("sk....", stripe_sk_key);
import * as stripe from 'nestjs-stripe';
import { MongooseModule } from '@nestjs/mongoose';
// import { StripeService } from './stripe.service';
import { PlansModel, Plan } from './schema/plan';

@Module({
  imports: [        
    MongooseModule.forFeature([
    // { name: Product.name, schema: ProductModel },
    { name: Plan.name, schema: PlansModel}
]),],
  providers: [StripeService,WebhooksService],
  controllers: [StripeController],
  exports:[StripeService]
})

export class StripeModule { }
