

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Users } from 'src/users/schema/users.schema'; // Assuming you have a User schema

export type GroupDocument = Groups & Document;

@Schema()
export class Groups {
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

export const groupSchema = SchemaFactory.createForClass(Groups);



