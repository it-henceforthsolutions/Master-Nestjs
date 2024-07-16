
enum plan_intervel {
    day = 'day',
    month = 'month',
    week = 'week',
    year = 'year'
}

// enum plan_name {
//     BASIC_PLAN = 'BASIC_PLAN',
//     INTERMEDIATE_PLAN = 'INTERMEDIATE_PLAN',
//     PREMIUM_PLAN = 'PREMIUM_PLAN',
//     DIASPORA_MONTHLY_PLAN = 'DIASPORA_MONTHLY_PLAN',
//     DIASPORA_ANNUAL_PLAN = 'DIASPORA_ANNUAL_PLAN'
// }

enum plan_currency {
    usd = 'usd',
    ngn = 'ngn',
}

import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsString } from "class-validator";


export class checkoutSession {

    @ApiProperty()
    @IsString()
    success_url: string;

    @ApiProperty()
    @IsString()
    cancel_url: string

    @ApiProperty()
    @IsNumber()
    total_price: number;

}

export class MakePaymentDto {
    @ApiProperty({ required: false })
    booking: string

}
