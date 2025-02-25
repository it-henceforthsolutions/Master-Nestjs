import { ApiProperty } from "@nestjs/swagger";

export class CreatePageDto {

    @ApiProperty({ required: true })
    title: string;

    @ApiProperty({ required: true })
    description: string;

    @ApiProperty({ required: false })
    image: string;

    @ApiProperty({ required: true })
    slug: string
}

export class PaginationDto {

    @ApiProperty({ required: false, description: "search with page title" })
    search: string

    @ApiProperty({ required: false, default: 1, description: "pagination number" })
    pagination: number

    @ApiProperty({ required: false, default: 10, description: "select the limit how much user want to see in first and another page" })
    limit: number
}
