import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class SignUpDto {
    @ApiProperty()
    first_name: string

    @ApiProperty()
    last_name: string

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
    @ApiProperty()
    email: string

    @ApiProperty()
    password: string
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

export class ResetPassDto{
    @ApiProperty()
    unique_id: string

    @ApiProperty()
    new_password: string
}

export class NewPassOtpDto{
    @ApiProperty()
    unique_id: string

    @ApiProperty()
    otp: number
}
