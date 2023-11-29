import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class create_connection {
    sent_to: string;
    chat_type: string;
    group_code: string;
    name: string;
    image_url: string;
    members: Array<string>
}


export class join_connection {
    connection_id: string;
}

export class make_admin {
    connection_id: string;
    user_id: string;
}


export class send_message {
    connection_id: string;
    message: string;
    sent_to: string;
    type: string;
    media_url: string;
    message_type: string;
    lat: string;
    long: string;
    time_zone: string;
}

export class read_message {
    message_id: string;
}


export class is_typing {
    connection_id: string;
    is_typing: string;
    user_id: string;
}

export class clear_message {
    connection_id: string;
}

export class delete_message {
    @ApiProperty({ default: 1, enum: [1, 2], required: true })
    delete_type: number; // 1- single, 2-all

    @ApiProperty({ isArray: true })
    @IsArray()
    @IsString({ each: true })
    message_id: Array<string>;

    @ApiProperty({ description: "Enter connection id here", required: true })
    @IsString()
    connection_id: string;
}


export class all_message {
    connection_id: string;
}



export class mute_notification {
    @ApiProperty({ required: true })
    @IsString()
    connection_id: string;

    @ApiProperty({ required: true })
    time_zone: string;

    @ApiProperty({ required: true, enum: ["HOUR", "WEEK", "ALWAYS"] })
    type: String;
}

export class add_participants {
    @ApiProperty({ required: true })
    @IsString()
    connection_id: string;

    @ApiProperty({ required: true })
    users_id: Array<string>;
}


export class broadcast_message {

    @ApiProperty({ required: true })
    users_id: Array<string>;
    message: string;
    type: string;
    media_url: string;
    message_type: string;
    lat: string;
    long: string;
    time_zone: string;
}

export class broadcast_info {

    @ApiProperty({ required: true })
    @IsString()
    connection_id: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    image_url?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;
}

export class listing {
    @ApiProperty({ required: false })
    @IsOptional()
    pagination?: number;


    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number;
}

export class search_user {
    @ApiProperty({ required: false })
    @IsOptional()
    pagination?: number;


    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    search?: string;
}

export class video_chat {
    @ApiProperty({ required: true })
    users_ids: Array<string>;
}