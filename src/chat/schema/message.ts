import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { type, message_type } from "utils";
import * as moment from "moment";

export type MessageDocument = HydratedDocument<Messages>;

@Schema()
export class Messages {

    @Prop({ type: Types.ObjectId, ref: 'connections', required: false })
    connection_id: Types.ObjectId = null;

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_to: Types.ObjectId = null;

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_by: Types.ObjectId = null;

    @Prop({ default: 'NORMAL', enum: type })
    type: string;

    @Prop({ default: null })
    message: string;

    @Prop({ default: null })
    media_url: string;

    @Prop({ default: null })
    lat: string;

    @Prop({ default: null })
    long: string;

    @Prop({ default: 'TEXT', enum: message_type })
    message_type: string;

    @Prop([{ type: Types.ObjectId, ref: "users", default: null }])
    read_by: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: "users", default: null }])
    deleted_for: Types.ObjectId[];

    @Prop({default: 0})
    delete_type: number = 0; // 1- selected, 2-all

    @Prop()
    is_read: boolean = false;

    @Prop()
    updated_at: number = 0;

    @Prop({default:moment().utc().valueOf()})
    created_at: number = moment().utc().valueOf();

    @Prop()
    deleted_at: number = 0;
}

export const MessageSchema = SchemaFactory.createForClass(Messages);  