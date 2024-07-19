
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';
import * as mongo from 'mongoose'

export type PaypalPlanDocument = HydratedDocument<PaypalPlan>
@Schema()
export class PaypalPlan {
    @Prop({default:null})
    name: string

    @Prop({default:null})
    description: string;

    @Prop({default:null})
    plan_id: string

    @Prop({default:null})
    amount: number

    @Prop({default:null})
    interval: string;
    
    @Prop({ default: false })
    is_deleted: boolean

    @Prop({ type: Number, default: +moment().utc().valueOf() })
    created_at: number

    @Prop({ type: Number, default: null })
    updated_at: number
}

export const PaypalPlanSchema = SchemaFactory.createForClass(PaypalPlan);