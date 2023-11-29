import { Global, Module } from "@nestjs/common";
import { CommonServices } from "./common.services";
import { StripeModule } from 'nestjs-stripe';
import { config } from 'dotenv';

config();
let { STRIPE_KEY } = process.env;

@Global()
@Module({
    imports: [
        // StripeModule.forRoot({
        //     apiKey: STRIPE_KEY,
        //     apiVersion: '2020-08-27',
        //   })
        StripeModule
    ],
    providers: [CommonServices],
    exports: [CommonServices]
})

export class CommonModule { }