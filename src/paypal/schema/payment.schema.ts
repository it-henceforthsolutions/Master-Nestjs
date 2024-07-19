import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as moment from 'moment';



enum PaymentStatus {
  Pending = "Pending",
  // Add other payment statuses as needed
}

@Schema()
export class PaypalPayment extends Document {
    @Prop({ type: 'ObjectId', default: null, ref: 'Users' })
    user_id: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, default: "USD" }) // Replace with the actual currency module or a default value
    currency: string;

    @Prop({ type: String, default: null })
    description: string;

    @Prop({ type: String, default: null })
    payment_method_id: string;

    @Prop({ type: String, default: null })
    payment_intent_id: string;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.Pending })
    payment_type: string;

    @Prop({ type: Number, default: moment().utc().valueOf() })
    created_at: number;
}

export const PaypalPaymentSchema = SchemaFactory.createForClass(PaypalPayment);
