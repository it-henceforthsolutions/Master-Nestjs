import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { call_type } from '../schema/call.schemas';
//import { call_type } from '../schema/call.schemas';
// import { see_my_activity } from '../schema/chatsetting.schemas';

export class CreateGroupDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  image: string;

  @IsString()
  @ApiProperty()
  description: string;
}

export class addGroupMemberDto {
  @ApiProperty()
  @IsArray()
  members: Array<string>;
}

export class removeGroupMemberDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  member_id: string;
}

export enum sortBy {
  Name = 'Name',
  Newest = 'Newest',
  Oldest = 'Oldest',
}

export class paginationsort {
  @ApiProperty({ description: 'sort_by', enum: sortBy, required: false })
  @IsOptional()
  sort_by: sortBy;

  @ApiProperty({ required: false })
  @IsOptional()
  pagination: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit: number;
}

export class pagination {
  @ApiProperty({ required: false })
  @IsOptional()
  pagination: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit: number;
}

export class paginationsortsearch {
  @ApiProperty({ description: 'sort_by', enum: sortBy, required: false })
  @IsOptional()
  sort_by: sortBy;

  @ApiProperty({ required: false })
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  pagination: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit: number;
}

export class mute_connection {
  @ApiProperty({
    description: 'mute upto - 1 for 8hr ,2 - 1week, 3 - always, 0 for unmute',
  })
  mute_upto: number;
}

export class block_unblock {
  @ApiProperty({ description: '1 for block , 0 for unblock ' })
  status: number;

  @ApiProperty({ description: 'user_id' })
  user_id: string;
}

export class chat_setting {
  @ApiProperty({ description: 'chat notification' })
  notification_alert: boolean;

  @ApiProperty({ description: 'message alerts' })
  message_alert: boolean;

  @ApiProperty({ description: 'group_chat_invitation' })
  group_chat_invitation: boolean;

  @ApiProperty({ description: 'active status visiblity' })
  active_status_visiblity: boolean;

  // @ApiProperty({
  //   description: ' who can see_my_activity',
  //   enum: see_my_activity,
  // })
  // see_my_activity: see_my_activity;

}

export class start_call {
  @ApiProperty({ required: true })
  connection_id: string;

  @ApiProperty({ description: 'user_ids' })
  @IsArray()
  users_ids: Array<string>;

  @ApiProperty({ enum: call_type, description: 'call type' })
  @IsEnum(call_type)
  type: call_type;
}

export class join_call {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  call_id: string;
}

export class get_pin_items extends pagination {
  @ApiProperty({ required: true })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  connection_id: string;
}

export class list_connection {
  @ApiProperty({ required: false })
  @IsOptional()
  pagination: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  search :string;
}

export class create_stream {
  @ApiProperty({ required: false , description:"stream name"})
  @IsOptional()
  name: string;

  @ApiProperty({ required: false , description:"stream name"})
  @IsOptional()
  channel_name: string;

  @ApiProperty({ required: false , description:"stream name"})
  @IsOptional()
  agora_token: string;
}

export class Deliver_message {
  @ApiProperty({ required: true , description:"connection_id"})
  @IsString()
  connection_id: string;

  @ApiProperty({ required: true , description:"message_id"})
  @IsString()
  message_id: string
}

export class Mongodb_id {
  @ApiProperty({ required: true, description: "mongodb_id" })
  @IsString()
  @IsMongoId({ message: "Please provide vaild mongodb id" })
  @IsNotEmpty({ message: "id field is mandatory" })
  _id: string;
}