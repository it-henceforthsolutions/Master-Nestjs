

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Users } from 'src/users/schema/users.schema'; // Assuming you have a User schema
import { Group } from './group.schema';

export type ConnectionDocument = Connection & Document;

@Schema()
export class Connection {
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_to: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_by: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Group.name, default: null })
  group_id: Group;

  @Prop({ default: null })
  last_message: string;

  @Prop({ default: +new Date() })
  updated_at: number;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const connectionSchema = SchemaFactory.createForClass(Connection);
































// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'


// export const connectionSchema = new mongoose.Schema({
//     sent_to: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     sent_by: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     last_message: { type: String, default: null },
//     updated_at: { type: Number, default: +new Date() },
//     created_at: { type: Number, default: +new Date() },
// });