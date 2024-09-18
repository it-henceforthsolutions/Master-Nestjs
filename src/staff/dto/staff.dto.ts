import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsStrongPassword } from "class-validator";
import { Role } from "../role/staff.role";

export class CreateStaffDto {

    @ApiProperty()
    first_name: string

    @ApiProperty()
    last_name: string

    @IsEmail()
    @ApiProperty()
    email: string

    @ApiProperty({required:false})
    country_code?: string

    @ApiProperty({ required: false })
    phone?: string

    @ApiProperty({ required:false })
    profile_pic ?: string

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    @ApiProperty()
    password: string

    @ApiProperty({ description: 'roles', default: ["PROFILE"], })
    @IsArray()
    role: Array<string>;
}
export class CreateStaffResponseDto {
    @ApiProperty({default: 'xyz'})
    first_name: string
    @ApiProperty({default:'abc'})
    last_name: string
    @ApiProperty({default:'a***@gmail.com'})
    temp_mail: string
    @ApiProperty({default:'a***@gmail.com'})
    email: string
    

}

export class PaginationStaffDto {
    @ApiProperty({ required: false, description: "search " })
    search: string

    @ApiProperty({ required: false, default: 1, description: "pagination number" })
    pagination: number

    @ApiProperty({ required: false, default: 10, description: "select the limit how much user want to see in first and another page" })
    limit: number
}
