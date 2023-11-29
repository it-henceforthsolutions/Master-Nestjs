import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import * as  moment from "moment";
import { notification_type, post_type } from "utils";

export type InvitationDocument = HydratedDocument<Invitations>;

@Schema()
export class Invitations {

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_by: Types.ObjectId = null

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    sent_to: Types.ObjectId = null

    @Prop({ type: Types.ObjectId, ref: 'posts', required: false })
    post_id: Types.ObjectId = null;

    @Prop({ default: 'POST', enum: post_type })
    post_type: string;

    @Prop({ default: 'INVITATION', enum: notification_type })
    notification_type: string;

    @Prop({ default: null })
    message: string;

    @Prop({ default: null })
    time_duration: string;

    @Prop({ default: 0 })
    interview_to_attend: number;

    @Prop()
    is_accepted: boolean = false;

    @Prop({ default: false })
    is_participated: boolean;

    @Prop({ default: 0 })
    turn: number;

    @Prop()
    is_deleted: boolean = false;

    @Prop({ default: moment().utc().valueOf() })
    created_at: number = moment().utc().valueOf();
}

export const InvitationSchema = SchemaFactory.createForClass(Invitations);  