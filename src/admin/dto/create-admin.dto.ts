import { ApiProperty } from "@nestjs/swagger"
import { IsEmail } from "class-validator"
import { DeviceType } from "utils"

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
