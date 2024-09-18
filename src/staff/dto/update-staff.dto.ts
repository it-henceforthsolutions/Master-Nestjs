import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Role } from '../role/staff.role';

export class UpdateStaffDto {
    @ApiProperty({required:false, default: null })
    first_name: string

    @ApiProperty({required: false, default: null })
    last_name: string

    @ApiProperty({ required: false, default: null })
    email: string;

    @ApiProperty({required:false, default: null })
    country_code?: string

    @ApiProperty({ required: false, default: null  })
    phone?: string

    @ApiProperty({required:false, default: null })
    profile_pic: string

    @ApiProperty({ required: false })
    role: string[];
}
