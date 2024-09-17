import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class exportData {
    @ApiProperty({description: 'is in millisecond'})
    start_date: number;

    @ApiProperty({description: 'is in millisecond'})
    end_date: number;
}

export class importFileDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
}
export enum sortBy {
    Name = 'Name',
    Newest = 'Newest',
    Oldest = 'Oldest',
  }
  

export class paginationsortsearch {
    @ApiProperty({ description: 'sort_by', enum: sortBy, required: false })
    @IsOptional()
    sort_by: sortBy;
  
    @ApiProperty({ required: false })
    @IsOptional()
    search: string;
  
    @ApiProperty({ required: false })
    @IsOptional()
    pagination: number;
  
    @ApiProperty({ required: false })
    @IsOptional()
    limit: number;
  }