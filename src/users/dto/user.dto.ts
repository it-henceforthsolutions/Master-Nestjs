import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { DeviceType, LoginType } from "../role/user.role";

export class SignUpDto {
    @ApiProperty()
    first_name: string

    @ApiProperty()
    last_name: string

    @ApiProperty()
    country_code: string

    @ApiProperty()
    phone: string

    @IsEmail()
    @ApiProperty()
    email: string

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
      })
    @ApiProperty()
    password: string
}

export class SignInDto {
    
    @IsEmail()
    @ApiProperty({default:'admin@gmail.com'})
    email: string

    @ApiProperty({default:'admin@1234'})
    password: string

    @ApiProperty({ type: 'string', required: false })
    fcm_token: string

    @ApiProperty({ type: 'string', enum: DeviceType })
    device_type: string
}

export class SocialSignInDto{
    @ApiProperty({ type: 'string' })
    social_token: string

    @ApiProperty({ type: 'string', enum: LoginType, default:LoginType.google })
    social_type: string

    @ApiProperty({ type: 'string', required: false })
    fcm_token: string

    @ApiProperty({ type: 'string', enum: DeviceType })
    device_type: string
}

export class OtpDto{
    @ApiProperty()
    otp: number

    @ApiProperty()
    @IsString()
    fcm_token:string
}

export class ForgetPassDto{
    @IsEmail()
    @ApiProperty()
    email: string
}


export class NewPassOtpDto{
    @ApiProperty()
    unique_id: string

    @ApiProperty()
    otp: number
}

export class DeactivateDto{
    @ApiProperty()
    deactivate_reason: string

    @ApiProperty()
    deactivate_reason_summary: string
}


export class exportData {
    @ApiProperty({description: 'is in millisecond'})
    start_date: number;

    @ApiProperty({description: 'is in millisecond'})
    end_date: number;
}

export class importFileDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}
export enum sortBy {
    Name = 'Name',
    Newest = 'Newest',
    Oldest = 'Oldest',
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