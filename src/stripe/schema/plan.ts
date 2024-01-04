
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';
import * as mongo from 'mongoose'

export type PlanDocument = HydratedDocument<Plan>
@Schema()
export class Plan {
    @Prop({default:null})
    name: string

    @Prop({default:null})
    description: string;

    @Prop({default:null})
    product_id: string;

    @Prop({default:null})
    plan_id: string

    @Prop({default:null})
    amount: number

    @Prop({default:null})
    interval: string;

    @Prop({type: Number, default: null})
    interval_count: number
    
    @Prop({ default: false })
    is_deleted: boolean

    @Prop({ type: Number, default: +moment().utc().valueOf() })
    created_at: number

    @Prop({ type: Number, default: null })
    updated_at: number
}

export const PlansModel = SchemaFactory.createForClass(Plan);