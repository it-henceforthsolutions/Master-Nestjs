import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';

export type FaqaDocument = HydratedDocument<Faqs>

export enum type {
    user = 'user',
    artist = 'artist',
    other = 'other'
}

@Schema()
export class Faqs {
    @Prop()
    questions: string;

    @Prop()
    answer: string;


    @Prop({ enum: type })
    type: string

    @Prop({ default: false })
    isDeleted: boolean

    @Prop({ default: +moment().utc().valueOf() })
    created_at: number

    @Prop({ default: null })
    updated_at: number
}

export const faqsModel = SchemaFactory.createForClass(Faqs)