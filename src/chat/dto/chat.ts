import { Types } from 'mongoose';
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class create_connection {
  sent_to: string;
  group_id:string;
}

export class join_connection {
  connection_id: string;
}

export class get_all_message {
  connection_id: string;
  pagination: number;
  limit: number;
}

export class sendMessage {
  group_id:string
  connection_id: string;
  message_id: string;
  sent_to: string;
  message: string;
  media_url:string;
  message_type:string;
  type:string
}

export class deliver_message {
  connection_id: string;
  message_id: string
}


export class readMessage {
  connection_id: string;
  message_id: string
}


export class deleteMessage {
  deleted_type:number;  //0
  message_id:string;
}




export class addGroupMember{
  connection_id:string;
  group_id:string;
  members:string[];
}

export class mute_connection_skt{
  mute_upto: number;
  connection_id: string;
}

export class add_pin_items {
  connection_id: string;
  message_id: string;
}

export class call_detail {
  call_id: string;
}

export class join_stream {
  stream_id: string; 
}

export class leave_stream {
  stream_id: string; 
}
