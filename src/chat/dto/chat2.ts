import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateGroupDto {
    
    @IsString()
    @ApiProperty()
    name: string

    @IsString()
    @ApiProperty()
    image: string

    @IsString()
    @ApiProperty()
    description: string

}

export class AddGroupMemberDto {
   @ApiProperty()
   @IsArray()
   members: Array<string>

}

export enum sortBy {
    Name= 'Name',
    Newest = 'Newest',
    Oldest = "Oldest"
    }


    
export class paginationsort {

    @ApiProperty({ description:"sort_by" ,enum:sortBy, required:false  })
    @IsOptional()
    sort_by: sortBy;

    @ApiProperty({ required: false })
    @IsOptional()
    pagination: number;
  
    @ApiProperty({ required: false })
    @IsOptional()
    limit: number;
}

export class pagination {

    @ApiProperty({ required: false })
    @IsOptional()
    pagination: number;
  
    @ApiProperty({ required: false })
    @IsOptional()
    limit: number;
}


export class paginationsortsearch {

    @ApiProperty({ description:"sort_by" ,enum:sortBy, required:false  })
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
