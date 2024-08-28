import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Connections } from './connection.schema'; // Assuming you have a Connection schema
import { Groups } from './group.schema';
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema

const message_type = [null, 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'GROUP_LINK'];
const type = [null, 'NORMAL', 'REPLY', 'FORWARDED', 'DELETED'];

export type MessageDocument = Messages & Document;

@Schema()
export class Messages {
  @Prop({ type: SchemaTypes.ObjectId, ref: Connections.name, default: null })
  connection_id: Connections;
  
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_by: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  sent_to: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Messages.name, default: null })
  message_id: Messages;

  @Prop({ type: SchemaTypes.ObjectId, ref: Groups.name, default: null })
  group_id: Groups;

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
  delivered_to: Users[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref:  "users", default: null }] })
  read_by: Users[];

  @Prop({ type: Number ,default: 0 })
  read_state: number

  @Prop({ default: null })
  deleted_type: number;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref:  "users", default: null }] })
  deleted_for: Users[];

  @Prop({ default: +new Date() })
  created_at: number;

  @Prop({ default: 0 })
  updated_at: number;
}

export const messageSchema = SchemaFactory.createForClass(Messages);








