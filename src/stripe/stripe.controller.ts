import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { StripeService } from './stripe.service';
import { WebhooksService } from './webhooks.service';
import * as dto from './dto/index'
import { MakePaymentDto } from './dto/stripe.dto';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';

@Roles(UsersType.user)
@ApiTags('stripe')
@Controller('stripe')
export class StripeController {

  constructor(
    private readonly StripeService: StripeService,
    private readonly WebhooksService: WebhooksService
  ) {

  }

  // @Post('web-hooks')
  // async webhooks(@Request() req: any) {
  //   try {
  //     let data = await this.WebhooksService.webhooks(req)
  //     return data;
  //   } catch (error) {
  //     throw error
  //   }
  // }

  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard)
  @Post('/create-checkout-session')
  async checkout_session(@Body() body:dto.checkoutSession ,@Request() req: any) {
    try {
      let data = await this.StripeService.checkout_session(body,req)
      return data;
    } catch (error) {
      throw error
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'make payments ' })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded') 
  @Post()
  makePayment(@Body() body:MakePaymentDto,@Request() req  ) {
    return this.StripeService.paymentIntent(body, req.user_data._id)
  }

  @ApiOperation({ summary: 'stripe webhoook' })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @Post('webhook')
  webhook(@Request() req: Request, @Body() body: any) {
    return this.StripeService.webhook(req.headers, body)
  }

}
