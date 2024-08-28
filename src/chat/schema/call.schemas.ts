import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Document, SchemaTypes } from 'mongoose';
import { Groups } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema
import { Connections } from './connection.schema';

export type CallsDocument = Call & Document;

export enum call_type  {
    audio = "audio",
    video = "video"
}

@Schema()
export class Call {  
  @Prop({ type: SchemaTypes.ObjectId, ref: Connections.name, default: null })
  connection_id: Connections;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  creator_id: Users;
    
  @Prop({ type: String,  default: null })
  channel_name: string;  
    
  @Prop({ type: String, default: null })
  agora_token: string;

  @Prop({
    type: [{
      user_id: { type: SchemaTypes.ObjectId, ref:  Users.name, default: null },
      joined_at: { type: Number, default: 0 },
      leave_at: { type: Number, default: 0 },
    }], default: []})
  members: { user_id: string, joined_at: number , leave_at: number}[];

  @Prop({  enum: call_type , required:true })
  type: string;

  @Prop({ type: Boolean , default:false })
  call_ended: boolean; 

  @Prop({ default: +new Date() })
  created_at: number;
}

export const CallSchema = SchemaFactory.createForClass(Call);
