import { ApiProperty } from "@nestjs/swagger"
import { IsEmail } from "class-validator"

export class UpdateUserDto {
    
    @ApiProperty({required:false})
    first_name: string

    @ApiProperty({required:false})
    last_name: string

    @ApiProperty({ type: String, default: null,readOnly:true})
    country_code: string

    @ApiProperty({required:false,readOnly:true})
    phone: string

    @ApiProperty({required:false,readOnly:true})
    email: string

}

export class UpdateEmailDto{
    @ApiProperty({required:false})
    email: string
}

export class UpdatePhoneDto{
    @ApiProperty({ type: String,required:false})
    country_code: string

    @ApiProperty({required:false})
    phone: string
}
