import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UsersType } from "../role/user.role";
import { IsEmail } from "class-validator";

@Schema()
export class Users {
    @Prop()
    first_name: string

    @Prop()
    last_name:string

    @IsEmail()
    @Prop()
    email: string

    @IsEmail()
    @Prop()
    temp_mail: string

    @Prop({default:null})
    temp_phone:string

    @Prop({ type: String, default: null, trim: true })
    country_code: string

    @Prop({ type: String, default: null, trim: true })
    temp_country_code: string

    @Prop({required:false})
    phone: string

    @Prop()
    password: string

    @Prop({type:String,enum:UsersType,default:UsersType.user})
    user_type: string

    @Prop({default:null})
    email_otp: number

    @Prop({default:null})
    phone_otp: number

    @Prop({default:null})
    role:string

    @Prop({default:null,type:String})
    profile_pic: string

    @Prop()
    unique_id: string

    @Prop({default:null})
    social_id: string

    @Prop()
    custumer_id: string

    @Prop()
    created_at: string

    @Prop({default: null})
    updated_at: string

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
}

export type UsersDocument = HydratedDocument<Users>
export const UsersModel = SchemaFactory.createForClass(Users)