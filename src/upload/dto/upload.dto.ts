import { ApiProperty } from '@nestjs/swagger';

export  class imageUploadDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    // image: any;
    file: any;
}