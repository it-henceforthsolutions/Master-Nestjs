import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";


export class UpdatePageDto {
    @ApiProperty({ required: false })
    title: string;

    @ApiProperty({ required: false })
    description: string;
}
