import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { DeviceType, LoginType, UsersType } from "../role/user.role";

@Schema()
export class Sessions {
    @Prop()
    user_id: string

    @Prop({type:String,enum:UsersType,default:UsersType.user})
    user_type: string

    @Prop()
    access_token: string

    @Prop({required: false})
    fcm_token:string

    @Prop({type:String,enum: DeviceType,default: DeviceType.web})
    device_type: string

    @Prop({type:String,enum: DeviceType})
    login_type: string

    @Prop()
    created_at: string

    @Prop({default: null})
    updated_at: string

    @Prop({default: false})
    is_deleted: boolean
}

export type SessionsDocument = HydratedDocument<Sessions>
export const SessionsModel = SchemaFactory.createForClass(Sessions)