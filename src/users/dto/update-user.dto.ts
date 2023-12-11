import { ApiProperty } from "@nestjs/swagger"
import { IsStrongPassword } from "class-validator"

export class UpdateUserDto {
    
    @ApiProperty({required:false})
    first_name: string

    @ApiProperty({required:false})
    last_name: string

    @ApiProperty({required:false})
    profile_pic: string

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

export class ResetPassDto{
    @ApiProperty()
    unique_id: string

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
      })
    @ApiProperty()
    new_password: string
}

export class ChangePassDto{
    @ApiProperty()
    old_password: string

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
      })
    @ApiProperty()
    new_password: string
}
