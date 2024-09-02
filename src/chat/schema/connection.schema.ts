




import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Users } from 'src/users/schema/users.schema'; // Assuming you have a User schema
import { Groups } from './group.schema';
import {Types} from 'mongoose'

export type ConnectionDocument = Connections & Document;

@Schema()
export class Connections {
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_to: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_by: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Groups.name, default: null })
  group_id: Groups;

  @Prop({ default: null })
  last_message: string;

  @Prop({ type: [{ user_id: { type: Types.ObjectId, ref: Users.name, default: null, mute_till:{ type: Number, default: 0 } }}]})
  mute: { user_id:Types.ObjectId, mute_till :number }[];

  @Prop({ default: +new Date() })
  updated_at: number;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const connectionModel = SchemaFactory.createForClass(Connections);





























// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'


// export const connectionSchema = new mongoose.Schema({
//     sent_to: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     sent_by: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     last_message: { type: String, default: null },
//     updated_at: { type: Number, default: +new Date() },
//     created_at: { type: Number, default: +new Date() },
// });
