import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';
import * as mongo from 'mongoose'

export type QuotesDocument = HydratedDocument<Quotes>
@Schema()
export class Quotes {
    @Prop()
    first_name: string

    @Prop()
    last_name: string;

    @Prop()
    email: string;

    @Prop()
    country_code: string

    @Prop()
    phone_no: string

    @Prop()
    message: string;

    @Prop({type: mongo.Schema.Types.ObjectId, ref: 'users', default: null})
    user_id: string

    @Prop({ default: false })
    is_resolved: boolean

    @Prop({ default: false })
    is_deleted: boolean

    @Prop({ type: Number, default: +moment().utc().valueOf() })
    created_at: number

    @Prop({ type: Number, default: null })
    updated_at: number
}

export const QuotesModel = SchemaFactory.createForClass(Quotes);