import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import moment from "moment";
import { chat_type } from "../constant/constants";

export type ConnectionDocument = HydratedDocument<Connections>;

@Schema()
export class Connections {

    // @Prop({ type: [{ type: String, enum: Object.values(chat_type) }], isRequired: true })
    @Prop({ isRequired: true, default: "NORMAL", enum: chat_type })
    chat_type: string;

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_to: Types.ObjectId = null;

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_by: Types.ObjectId = null;

    @Prop()
    name: string = null;

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    creator_id: Types.ObjectId = null;

    @Prop()
    image_url: string = null;

    @Prop()
    members: [{ _id: { type: Types.ObjectId, ref: "users", default: null }, role: String, joined_at: number }];

    @Prop()
    muted_by: [{ _id: { type: Types.ObjectId, ref: "users", default: null }, time: number, type: { default: null, enum: [null, "HOUR", "WEEK", "ALWAYS"] } }];

    @Prop()
    is_private: boolean = false;

    @Prop()
    is_blocked: boolean = false;

    @Prop()
    last_message: string = null;

    @Prop()
    group_code: string = null;

    @Prop({ type: String, default: null, enum: [null, "NORMAL", "BROADCAST", "PRELIVE"] })
    group_type: string = null;

    @Prop([{ type: Types.ObjectId, ref: "users", default: null }])
    deleted_for: Types.ObjectId[];

    @Prop()
    updated_at: number = 0;

    @Prop()
    created_at: number = moment().utc().valueOf();

    @Prop()
    deleted_at: number = 0;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connections);  