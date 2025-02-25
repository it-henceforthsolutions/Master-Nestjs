
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Groups } from './group.schema'; // Assuming you have a Group schema
import { Users } from 'src/users/schema/users.schema';  // Assuming you have a User schema

export type MemberDocument = Members & Document;

export enum member_role {
   USER= "USER", 
   ADMIN="ADMIN"
}

@Schema()
export class Members {
  @Prop({ type: SchemaTypes.ObjectId, ref: Groups.name, default: null })
  group_id: Groups;

  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  user_id: Users;

  @Prop({  enum: member_role, default: member_role.USER })
  role: string;

  @Prop({ default: +new Date() })
  created_at: number;
}

export const memberSchema = SchemaFactory.createForClass(Members);

