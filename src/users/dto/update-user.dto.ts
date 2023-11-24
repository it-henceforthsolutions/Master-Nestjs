import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
    
    @ApiProperty({required:false})
    first_name: string

    @ApiProperty({required:false})
    last_name: string

    @ApiProperty({ type: String, default: null})
    country_code: string

    @ApiProperty({required:false})
    phone: string

    @ApiProperty({readOnly:true})
    email: string

}
