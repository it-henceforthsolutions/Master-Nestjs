import { ApiProperty } from "@nestjs/swagger";
import { Type } from "../schema/management.schema";

export class CreateManagementDto {
    @ApiProperty({enum:Type, default:Type.HOME})
    type: string

    @ApiProperty()
    title: string

    @ApiProperty({required:false})
    sub_title: string

    @ApiProperty({required:false})
    description: string

    @ApiProperty()
    image: string
}
