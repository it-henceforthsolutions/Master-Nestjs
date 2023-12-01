import { ApiProperty } from "@nestjs/swagger";

export enum type {
    user='user',
    artist = 'artist',
    other = 'other'
}
export class CreateFaqDto {
    @ApiProperty()
    questions: string;

    @ApiProperty()
    answer: string;

    @ApiProperty({enum:type})
    type: string
}


export class PaginationDto {

    @ApiProperty({ required: false, description: "search with question" })
    search: string

    @ApiProperty({ required: false, description: "search with type" })
    type: string

    @ApiProperty({ required: false, default: 1, description: "pagination number" })
    pagination: number

    @ApiProperty({ required: false, default: 10, description: "select the limit how much user want to see in first and another page" })
    limit: number
}