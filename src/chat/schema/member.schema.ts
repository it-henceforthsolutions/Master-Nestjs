

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Group } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema

export type MemberDocument = Member & Document;

export enum member_role {
   USER= "USER", 
   ADMIN="ADMIN"
}

@Schema()
export class Member {
  @Prop({ type: SchemaTypes.ObjectId, ref: Group.name, default: null })
  group_id: Group;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  user_id: Users;

  @Prop({  enum: member_role, default: member_role.USER })
  role: string;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const memberSchema = SchemaFactory.createForClass(Member);

































// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'


// export const memberSchema = new mongoose.Schema({
//     group_id : { type: Schema.Types.ObjectId, ref: "groups", default: null },
//     user_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     // role: { type:String, enum: , default: }
//     created_at: { type: Number, default: +new Date() },
// });
