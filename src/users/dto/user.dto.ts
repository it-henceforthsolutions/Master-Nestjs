import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";
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
