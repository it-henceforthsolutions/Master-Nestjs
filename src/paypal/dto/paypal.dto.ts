import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class amountDto{
    @ApiProperty({ type: String})
    amount: string
}

export class captureDto{
    @ApiProperty()
    paymentId: string
}

export class refundDto{
    @ApiProperty()
    captureId: string

    @ApiProperty({required:false })
    amount?: string
}

export class createProductDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ default:"SERVICE"})
    type: string;

    @ApiProperty({default:"SOFTWARE"})
    category: string;

}

export class createSubscriptionDto {
    @ApiProperty()
    plan_id: string
}

export class updateSubscriptionDto {
    @ApiProperty()
    plan_id: string
}

export enum plan_interval {
    week = "WEEK",
    month = 'MONTH',
    year = 'YEAR',
}

export class createPlanDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    product_id: string;

    @ApiProperty({ enum: plan_interval, default: plan_interval.month })
    interval:string;

    @ApiProperty()
    amount: number;
}
  
export class createPayoutDto {
    @ApiProperty()
    paypal_email: string;

    @ApiProperty()
    amount: number;

}

export class PaypalWebhookDto {
    event_type: string;
    resource: any;
  }
  
  