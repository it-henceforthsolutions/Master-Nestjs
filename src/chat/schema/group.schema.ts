

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Users } from 'src/users/schema/users.schema'; // Assuming you have a User schema

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  image: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  created_by: Users;

  @Prop({ default: null })
  description: string;

  @Prop({ default: +new Date() })
  updated_at: number;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const groupSchema = SchemaFactory.createForClass(Group);


































// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'

// export const groupSchema = new mongoose.Schema({
//     name: { type:String, default: null },
//     image:{ type:String, default: null },
//     created_by: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     last_message: { type: String, default: null },
//     updated_at: { type: Number, default: +new Date() },
//     created_at: { type: Number, default: +new Date() },
// });
