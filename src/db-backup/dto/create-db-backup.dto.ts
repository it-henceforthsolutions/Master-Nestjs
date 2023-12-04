import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BackupDto {
    @ApiProperty()
    @IsString()
    file: string;
}
