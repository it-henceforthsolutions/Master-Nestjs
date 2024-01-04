import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { StripeService } from './stripe.service';
import { WebhooksService } from './webhooks.service';
import * as dto from './dto/index'

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {

  constructor(
    private readonly StripeService: StripeService,
    private readonly WebhooksService: WebhooksService
  ) {

  }

  @Post('web-hooks')
  async webhooks(@Request() req: any) {
    try {
      let data = await this.WebhooksService.webhooks(req)
      return data;
    } catch (error) {
      throw error
    }
  }

  @Post('/create-checkout-session')
  async checkout_session(@Body() body:dto.checkoutSession ,@Request() req: any) {
    try {
      let data = await this.StripeService.checkout_session(body,req)
      return data;
    } catch (error) {
      throw error
    }
  }

}
