import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { DeviceType, LoginType, UsersType } from "../role/user.role";
import { Types } from "mongoose"

@Schema()
export class Sessions {
    @Prop({ type:Types.ObjectId, required: true  })
    user_id: Types.ObjectId

    @Prop({type:String,enum:UsersType,default:UsersType.user})
    user_type: string

    @Prop({required: false})
    fcm_token:string

    @Prop({type:String,enum: DeviceType,default: DeviceType.web})
    device_type: string

    @Prop({type:String,enum: DeviceType})
    login_type: string

    @Prop({ type:Number, default: 0 })
    updated_at: number

    @Prop({ type:Number, default: 0 })
    created_at: number
}

export type SessionsDocument = HydratedDocument<Sessions>
export const SessionsModel = SchemaFactory.createForClass(Sessions)