

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Users } from 'src/users/schema/users.schema'; // Assuming you have a User schema
import { Messages } from './message.schema';

export type ChatSettingDocument = ChatSetting & Document;



@Schema()
export class ChatSetting {
  @Prop({ type: SchemaTypes.ObjectId, ref: Users.name, default: null })
  user_id: Users;
    
  @Prop({ type: Boolean , default:true })
  notification_alert: boolean;

  @Prop({ type: Boolean , default: true })
  messages_alerts: boolean;
    
  @Prop({ type: Boolean , default: true })
  group_chat_invitation: boolean;

  @Prop({ type: Boolean , default: true })   //active status visibility
  active_status_visiblity: boolean;   
    
}

export const ChatSettingSchema = SchemaFactory.createForClass(ChatSetting);



