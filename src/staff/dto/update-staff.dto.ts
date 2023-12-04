import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Role } from '../role/staff.role';

export class UpdateStaffDto {
    @ApiProperty({required:false})
    first_name: string

    @ApiProperty({required: false})
    last_name: string

    @ApiProperty({required:false})
    email: string

    @ApiProperty({enum:Role,default:Role.readonly,required:false})
    role: string
}
