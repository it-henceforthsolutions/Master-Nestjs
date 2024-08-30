import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { LoginType, UsersType } from "../role/user.role";
import { IsEmail } from "class-validator";
import * as moment from "moment"

@Schema()
export class Users {
    @Prop({ type: String, default: null })
    first_name: string

    @Prop({type: String, default: null })
    last_name:string

    @IsEmail()
    @Prop({lowercase: true})
    email: string

    // @IsEmail()
    // @Prop()
    // temp_mail: string

    // @Prop({default:null})
    // temp_phone:string

    @Prop({ type: String, default: null, trim: true })
    country_code: string

    // @Prop({ type: String, default: null, trim: true })
    // temp_country_code: string

    @Prop({type: String, default: null, required:false})
    phone: string

    @Prop()
    password: string

    @Prop({type:String,enum:UsersType,default:UsersType.user})
    user_type: string

    @Prop({default:0})
    email_otp: number

    @Prop({default:0})
    phone_otp: number

    @Prop({default:null})
    role:string

    @Prop({default:null,type:String})
    profile_pic: string

    @Prop({type: String, default: null })
    unique_id: string

    @Prop({default:null})
    social_id: string

    @Prop({default:LoginType.normal,enum:LoginType})
    login_type: string

    @Prop({type: String, default: null })
    custumer_id: string

    @Prop({ type: Number, default: 0 })
    created_at: number

    @Prop({type: Number, default: 0 })
    updated_at: number

    @Prop({default: false})
    is_deleted: boolean

    @Prop({default: false})
    is_email_verify: boolean

    @Prop({default: false})
    is_phone_verify: boolean

    @Prop({default: true})
    is_active: boolean

    @Prop({default: false})
    is_blocked: boolean

    @Prop({default: null})
    socket_id: string

    @Prop({default: false})
    chat_active: boolean

    @Prop({default: 0})
    last_seen: number

    @Prop({default: null})
    deactivate_reason: string

    @Prop({default: null})
    deactivate_reason_summary: string
}

export type UsersDocument = HydratedDocument<Users>
export const UsersModel = SchemaFactory.createForClass(Users)