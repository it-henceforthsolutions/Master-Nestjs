import { Types } from 'mongoose';
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class create_connection {
  sent_to: string;
  group_id:string;
}

export class join_connection {
  connection_id: string;
}

export class sendMessage {
  group_id:string
  connection_id: string;
  sent_to: string;
  message: string;
  media_url:string;
  message_type:string;
  type:string
}


export class readMessage {
  connection_id: string;
  message_id: string
}


export class deleteMessage {
  message_id: string
}


export class list_connection {
  @ApiProperty({ required: false })
  @IsNumber()
  pagination: Number;

  @ApiProperty({ required: false })
  @IsNumber()
  limit: Number;

  //  @ApiProperty({required:false})
  //  @IsString()
  //  search :string;
}

export class addGroupMember{
  group_id:string;
  members:string[];
}