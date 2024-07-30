import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class LiveStreaming extends Document {
    @Prop({ type: String, default: null })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, default: null, ref: "users" })
    created_by: Types.ObjectId;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: "users" })
    joined_by: Types.ObjectId[];

    @Prop({ type: Boolean, default: true  })
    is_live: boolean;

    @Prop({ type: String,  default: null })
    channel_name: string;  
      
    @Prop({ type: String, default: null })
    agora_token: string;

    @Prop({ default: moment().utc().valueOf() })
    created_at: number;

    @Prop({ default: 0 })
    updated_at: number;
}

export const LiveStreamingSchema = SchemaFactory.createForClass(LiveStreaming);