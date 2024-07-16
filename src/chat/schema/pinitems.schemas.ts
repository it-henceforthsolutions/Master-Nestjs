import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Groups } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema
import { Messages, messageSchema } from './message.schemas';

export type PinsDocument = Pins & Document;

export enum member_role {
   USER= "USER", 
   ADMIN="ADMIN"
}

@Schema()
export class Pins {
  @Prop({ type: SchemaTypes.ObjectId, ref: Groups.name, default: null })
  connection_id: Groups;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  user_id: Users;

  @Prop({ type: SchemaTypes.ObjectId, ref: Messages.name, default: null })
  message_id: Messages;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const PinsSchema = SchemaFactory.createForClass(Pins);