import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import * as  moment from "moment";

export type BlockDocument = HydratedDocument<Blocks>;

@Schema()
export class Blocks {

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    block_by: Types.ObjectId = null

    @Prop({ type: Types.ObjectId, ref: 'users', required: false })
    block_to: Types.ObjectId = null

    @Prop({ default: moment().utc().valueOf()})
    created_at: number = moment().utc().valueOf();
}

export const BlockSchema = SchemaFactory.createForClass(Blocks);  