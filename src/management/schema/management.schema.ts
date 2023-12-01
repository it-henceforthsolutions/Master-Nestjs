import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum Type{
    HOME = 'HOME'
}

@Schema()
export class Managements {
    @Prop({enum:Type, default:Type.HOME})
    type: string

    @Prop()
    title: string

    @Prop({required:false})
    sub_title: string

    @Prop({required:false})
    description: string

    @Prop()
    image: string
}

export type ManagementsDocument = HydratedDocument<Managements>
export const ManagementsModel = SchemaFactory.createForClass(Managements)
