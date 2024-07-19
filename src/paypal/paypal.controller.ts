import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, Patch } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { amountDto, captureDto, createPayoutDto, createPlanDto, createProductDto, createSubscriptionDto, PaypalWebhookDto, refundDto, updateSubscriptionDto } from './dto/paypal.dto';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { AuthGuard } from 'src/auth/auth.guards';



@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('create-payment')
  async createPayment(@Req() req: any, @Body() body:amountDto ) {
    return this.paypalService.createPayment(req, body);
  }

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('capture-payment')
  async capturePayment(@Req() req: any, @Body() body: captureDto) {
    return this.paypalService.capturePayment(req, body);
  }

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('refund-payment')
  async refundPayment(@Body() body: refundDto, @Req() req) {
    return  await this.paypalService.refundPayment(req, body);

  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Roles(UsersType.admin)
  @Post('product')
  async createProduct(@Body() body: createProductDto, @Req() req:any) {
    return await this.paypalService.createProduct( body );
  }

  @Roles(UsersType.admin)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('plan')
  async createPlan(@Body() body: createPlanDto, @Req() req) {
    return await this.paypalService.createPlan(body);
  }

  @Roles(UsersType.admin)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Delete('plan/:_id')
  async deletePlan(@Param('_id')_id: string, @Req() req) {
    return await this.paypalService.deletePlan(_id);
  }

  @Get('plan')
  async listPlan() {
    return await this.paypalService.listPlan();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Roles(UsersType.user)
  @Post('subscription')
  async createSubscription(@Body() body: createSubscriptionDto, @Req() req:any) {
    return await this.paypalService.createSubscription2(req, body);
    
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Roles(UsersType.user)
  @Patch('subscription')
  async updateSubscription(@Body() body: updateSubscriptionDto, @Req() req:any) {
    return await this.paypalService.updateSubscriptionPlan(req, body);
  }

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('subscription/active')
  async activeSubscription(@Req() req:any) {
    return await this.paypalService.activeSubscription(req);
    
  }

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('subscription/:id')
  async getSubscriptionDetails(@Param('id') subscriptionId: string, @Req() req:any) {
    return await this.paypalService.getSubscriptionDetails(req,subscriptionId);
    
  }

  @Roles(UsersType.user)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Delete('subscription')
  async cancelSubscription(@Req() req:any) {
    return await this.paypalService.cancelSubscription(req);
   
  }

  @Roles(UsersType.admin)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('payout')
  async createPayout(@Body() body: createPayoutDto, @Req() req:any) {
    return await this.paypalService.createPayout(body);
   
  }

  @Post('webhook')
  async handleWebhook(@Body() body: PaypalWebhookDto) {
    await this.paypalService.handleWebhook(body);
  }
  
}

