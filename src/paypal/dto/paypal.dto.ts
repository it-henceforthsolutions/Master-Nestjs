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
