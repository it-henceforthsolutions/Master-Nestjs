import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
enum RoleType{

    PUBLISHER="PUBLISHER",
    SUBSCRIBER='SUBSCRIBER'
}
export class AgoraRoleDto{

    @ApiProperty({ enum: RoleType, default: RoleType.PUBLISHER })
    @IsEnum(RoleType)
    role: string

    @ApiProperty()
    channel_name:string;


}