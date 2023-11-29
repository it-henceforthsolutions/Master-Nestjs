import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class bank_account {
    @ApiProperty({ required: true })
    @IsString()
    bank_name: string;

    @ApiProperty({ required: true })
    @IsString()
    account_holder_name: string;

    @ApiProperty({ required: true })
    @IsString()
    account_number: string;

    @ApiProperty({ required: true })
    @IsString()
    routing_number: string;

    @ApiProperty({ required: true })
    @IsString()
    ssn_code: string;

    @ApiProperty({ required: true })
    @IsString()
    address: string;

    @ApiProperty({ required: true })
    @IsString()
    city: string;

    @ApiProperty({ required: true })
    @IsString()
    zip_code: string;

    @ApiProperty({ required: true })
    @IsString()
    country: string;

    @ApiProperty({ required: true })
    @IsString()
    state: string;

    @ApiProperty({ required: true })
    @IsString()
    currency: string;

    @ApiProperty({ required: true })
    @IsString()
    email: string;

    @ApiProperty({ required: true })
    @IsString()
    first_name: string;

    @ApiProperty({ required: true })
    @IsString()
    last_name: string;

    @ApiProperty({ required: true })
    @IsString()
    phone_no: string;

    @ApiProperty({ required: false })
    dob: Date;

    @ApiProperty({ required: true })
    @IsString()
    front_image: string;

}

