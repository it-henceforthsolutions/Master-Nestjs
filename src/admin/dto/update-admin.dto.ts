import { ApiProperty } from "@nestjs/swagger";

export class UpdateAdminDto {
    @ApiProperty({required:false})
    first_name: string

    @ApiProperty({required:false})
    last_name: string
}
