import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UsersType } from "../role/user.role";

@Schema()
export class Users {
    @Prop()
    first_name: string

    @Prop()
    last_name:string

    @Prop({unique: true})
    email: string

    @Prop({ type: String, default: null, trim: true })
    country_code: string

    @Prop({required:false})
    phone: string

    @Prop()
    password: string

    @Prop({type:String,enum:UsersType,default:UsersType.user})
    user_type: string

    @Prop()
    otp: number

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
}

export type UsersDocument = HydratedDocument<Users>
export const UsersModel = SchemaFactory.createForClass(Users)