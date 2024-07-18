import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { amountDto, captureDto, refundDto } from './dto/paypal.dto';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { AuthGuard } from 'src/auth/auth.guards';


@Roles(UsersType.user)
@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}


  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('create')
  async createPayment(@Req() req: any, @Body() body:amountDto ) {
    return this.paypalService.createPayment(req, body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('capture')
  async capturePayment(@Req() req: any, @Body() body: captureDto) {
    return this.paypalService.capturePayment(req, body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('refund-payment')
  async refundPayment(@Body() body: refundDto, @Req() req) {
    const refund = await this.paypalService.refundPayment(req, body);
    return refund;
  }
}

