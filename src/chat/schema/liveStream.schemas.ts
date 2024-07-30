import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class LiveStreaming extends Document {

    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null, ref: "games" })
    created_by: Types.ObjectId;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: "users" })
    joined_by: Types.ObjectId[];

    @Prop({ default: moment().utc().valueOf() })
    created_at: number;

    @Prop({ default: 0 })
    updated_at: number;
}

export const LiveStreamingSchema = SchemaFactory.createForClass(LiveStreaming);