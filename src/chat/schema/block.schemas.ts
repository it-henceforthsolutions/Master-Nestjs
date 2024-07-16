import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Groups } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema

export type BlockedDocument = Blocked & Document;

@Schema()
export class Blocked {
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  block_by: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  block_to: Users;
}

export const BlockedSchema = SchemaFactory.createForClass(Blocked);

































// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'


// export const Blockedchema = new mongoose.Schema({
//     group_id : { type: Schema.Types.ObjectId, ref: "groups", default: null },
//     user_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
//     // role: { type:String, enum: , default: }
//     created_at: { type: Number, default: +new Date() },
// });
