import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateNotificationDto {
    @ApiProperty()
    subject: string;

    @ApiProperty()
    text: String;

    @ApiProperty()
    type: 1|2;

    @ApiProperty()
    @IsOptional()
    emails: string[];
}
