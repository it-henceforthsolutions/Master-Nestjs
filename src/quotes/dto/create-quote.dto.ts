import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { InvalidEmailFormat } from "src/handler/error.exception";

export enum type{
    songs ='songs',
    videos ='videos',
    preorder ='preorder'
}

export class CreateQuoteDto {
    @ApiProperty()
    first_name: string

    @ApiProperty()
    last_name: string;

    @IsEmail({}, new InvalidEmailFormat())
    @ApiProperty()
    email: string;

    @ApiProperty()
    country_code: string

    @ApiProperty()
    phone_no: string

    @ApiProperty()
    message: string;
}


export class PaginationDto {
    @ApiProperty({ required: false, description: "search with name" })
    search: string

    @ApiProperty({ required: false, default: 1, description: "pagination number" })
    pagination: number

    @ApiProperty({ required: false, default: 10, description: "select the limit how much user want to see in first and another page" })
    limit: number

    @ApiProperty({ required: false })
    start_date: string;

    @ApiProperty({ required: false })
    end_date: string;
}

export class OrderDto {
    @ApiProperty({enum:type })
    type: string

    @ApiProperty({ required: false, description: "search with name" })
    search: string

    @ApiProperty({ required: false, default: 1, description: "pagination number" })
    pagination: number

    @ApiProperty({ required: false, default: 10, description: "select the limit how much user want to see in first and another page" })
    limit: number

    @ApiProperty({ required: false })
    start_date: string;

    @ApiProperty({ required: false })
    end_date: string;
}

