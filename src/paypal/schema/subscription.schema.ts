import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as moment from 'moment';
import { Users } from "src/users/schema/users.schema";
import { PaypalPlan } from "./plan.schema";

@Schema()
export class PaypalSubscription extends Document {
    @Prop({ type: 'ObjectId', ref: Users.name, required: true })
    user_id: string;

    @Prop({ type: String, required:false })
    plan_id: string;

    @Prop({ type: String, required: false })
    subscription_id: string;

    @Prop({ type: Number, required: true })
    start_date: number;

    @Prop({ type: Number, required: true })
    renewal_date: number;

    // Uncomment the line below if you want to include the 'pm_id' field
    // @Prop({ type: String, default: null })
    // pm_id: string;

    @Prop({ type: Number, default: 0 })
    amount: number;

    @Prop({ type: String, default: null })
    status: string;

    @Prop({ type: Number, default: moment().utc().valueOf() })
    created_at: number;

    @Prop({ type: Number, default: moment().utc().valueOf() })
    updated_at: number;
}

export const PaypalSubscriptionSchema = SchemaFactory.createForClass(PaypalSubscription);
