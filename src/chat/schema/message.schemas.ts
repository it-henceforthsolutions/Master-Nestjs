import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Connection } from './connection.schemas'; // Assuming you have a Connection schema
import { Group } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema

const message_type = [null, 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'SEND_COINS', 'GROUP_LINK'];
const type = [null, 'NORMAL', 'REPLY', 'FORWARDED', 'DELETED'];

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ type: SchemaTypes.ObjectId, ref: Connection.name, default: null })
  connection_id: Connection;
  
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_by: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_to: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Group.name, default: null })
  group_id: Group;

  @Prop({ default: null, enum: type })
  type: string;

  @Prop({ default: 'TEXT', enum: message_type })
  message_type: string;

  @Prop({ default: 'null' })
  message: string;

  @Prop({ default: null })
  message_url: string;

  @Prop({ default: null })
  media_url: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref:  "users", default: null }] })
  read_by: Users[];

  @Prop({ default: null })
  deleted_type: number;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref:  "users", default: null }] })
  deleted_for: Users[];

  @Prop({ default: +new Date() })
  created_at: number;

  @Prop({ default: 0 })
  updated_at: number;
}

export const messageSchema = SchemaFactory.createForClass(Message);





































// import { Schema, model } from "mongoose";
// import * as mongoose from 'mongoose'
// const message_type = [null, 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT' ,'SEND_COINS',"GROUP_LINK"]
// const type = [null, "NORMAL", "REPLY", "FORWARDED", "DELETED"];

// export const massageSchema =new mongoose.Schema({
//   connection_id       : { type: Schema.Types.ObjectId, ref: "connections", default: null,},
//   group_id            : { type: Schema.Types.ObjectId, ref: "groups", default: null,},
//   sent_by             : { type: Schema.Types.ObjectId, ref: "users", default: null },
//   sent_to             : { type: Schema.Types.ObjectId, ref: "users", default: null },
//   type                : { type: String, default: null, enum: type },
//   message_type        : { type: String, default: "TEXT", enum: message_type },
//   message             : { type: String, default: "null" },
//   message_url         : { type: String, default: null },
//   media_url           : { type: String, default: null },
//   read_by             : [{ type: Schema.Types.ObjectId, ref: "users", default: null }],
//   deleted_type        : { type: Number, default: null }, //1 for selected, 2 for all
//   deleted_for         : [{ type: Schema.Types.ObjectId, ref: "users", default: null }],
//   created_at          : { type: Number, default: +new Date() },

// });