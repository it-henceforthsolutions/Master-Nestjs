import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class SignUpDto {
    @ApiProperty()
    first_name: string

    @ApiProperty()
    last_name: string

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
    @ApiProperty()
    email: string

    @ApiProperty()
    password: string
}
