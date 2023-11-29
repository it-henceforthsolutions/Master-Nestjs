import { IsString,IsNotEmpty, IsNumber, IsOptional, IsEnum } from "class-validator";
import { Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import {DeviceType} from "../../../utils";

export class itoken {
    @ApiProperty({type: Types.ObjectId})
    _id:Types.ObjectId

    @ApiProperty()
    @IsString()
    scope:string


    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    token_gen_at:Number

    
}

export class random_token {
    @ApiProperty({type: Types.ObjectId})
    _id:Types.ObjectId

    @ApiProperty()
    @IsString()
    scope:string


    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    token_gen_at:Number

    
}

export class generate_token {
    
    @ApiProperty()
    user_id:Types.ObjectId

    @ApiProperty()
    @IsString()
    access_token:string

    @ApiProperty()
    @IsEnum(DeviceType)
    device_type: DeviceType;

    @ApiProperty()
    @IsString()
    fcm_token:string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    token_gen_at:Number
}

