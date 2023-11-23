import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Users {
    @Prop()
    first_name: string

    @Prop()
    last_name:string

    @Prop({unique: true})
    email: string

    @Prop()
    password: string
}

export type UsersDocument = HydratedDocument<Users>
export const UsersModel = SchemaFactory.createForClass(Users)