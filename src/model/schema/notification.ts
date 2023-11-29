import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes, Types, HydratedDocument } from "mongoose";
import moment from "moment";

const type = [null, "CONTACT_US", "STAFF", "ADMIN", "REPORT",
    "INVITATION", "POSTLIKE", "POSTCOMMENT", "PUSH", "EMAIL",
    "FANS", "GROUP", "MESSAGE"]

export type NotificationDocument = HydratedDocument<Notifications>;

@Schema()
export class Notifications {

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "users" })
    user_id: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "users" })
    sent_by: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "users" })
    sent_to: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "contacts" })
    contact_id: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "posts" })
    post_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'fans', required: false })
    fan_id: Types.ObjectId = null;

    @Prop({ type: Types.ObjectId, ref: 'besties', required: false })
    bestie_id: Types.ObjectId = null;
    
    @Prop({ type: Types.ObjectId, ref: 'connections', required: false })
    connection_id: Types.ObjectId = null;

    @Prop({ type: SchemaTypes.ObjectId, default: null, ref: "messages" })
    message_id: Types.ObjectId;

    @Prop({ type: String, default: null })
    subject: string;

    @Prop({ type: String, default: null })
    description: string;

    @Prop({ type: String, default: null })
    message: string;

    @Prop({ type: String, default: null })
    reason: string;

    @Prop({ type: String, default: null })
    email: string;

    @Prop({ type: String, default: null, enum: [null, "INVITATION", "POST_LIKE", "POST_COMMENT", "FAN_REQUEST", "PUSH", "EMAIL","GROUP"] })
    notification_type: string;

    @Prop({
        type: String, default: null, enum: type
    })
    type: string;

    @Prop({ type: Boolean, default: false })
    is_read: boolean;

    @Prop({ type: String, default: "ACCEPTED", enum: ["PENDING", "ACCEPTED","REJECTED"] })
    status: string;

    @Prop({ default: "USER", enum: ["USER", "ADMIN"] })
    to_user_type: string;

    @Prop({ type: Number, default: () => moment().utc().valueOf() })
    created_at: number;

    @Prop({ type: Number, default: +new Date() })
    updated_at: number;
}

export const NotificationSchema = SchemaFactory.createForClass(Notifications);