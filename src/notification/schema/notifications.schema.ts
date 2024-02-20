import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as moment from "moment";
import { HydratedDocument } from "mongoose";
import { NotificationType } from "../role/notification.role";
export type NotificationDocument = HydratedDocument<Notifications>

@Schema()
export class Notifications {
    @Prop()
    subject: string;

    @Prop()
    text: string;

    @Prop()
    user_id: string

    @Prop()
    from_id: string

    @Prop({ type:String,enum:NotificationType,default:NotificationType.unread})
    notification_type: string;



    @Prop({ default: moment.utc().valueOf() })
    created_at: number

    @Prop({ default: null })
    updated_at: number
}

export const NotificationsModel = SchemaFactory.createForClass(Notifications)