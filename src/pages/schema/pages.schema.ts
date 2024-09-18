import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as moment from 'moment';

export type pagesDocument = HydratedDocument<Pages>
@Schema()
export class Pages {

    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop({type:String, default: null })
    image: string;

    @Prop({ unique: true })
    slug: string;

    @Prop({ default: false })
    is_deleted: boolean;

    @Prop({ type: Number})
    created_at: number

    @Prop({ type: Number, default: null })
    deleted_at: number

    @Prop({ type: Number, default: null })
    updated_at: number
}

export const pageModel = SchemaFactory.createForClass(Pages)