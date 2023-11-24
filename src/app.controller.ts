import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ForgetPassDto, NewPassOtpDto, OtpDto, ResetPassDto, SignInDto, SignUpDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guards';
import { UserGuard } from './auth/user.guard';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private userService: UsersService
        ) { }

    @Post('signup')
    signUp(@Body() body: SignUpDto) {
        return this.userService.signUp(body);
    }

    @Post('signin')
    signIn(@Body() body: SignInDto) {
        return this.userService.signIn(body);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('verify-email')
    verifyEmail(@Body() body: OtpDto,@Req() req){
        return this.userService.verifyEmail(body,req.user.id)
    }

    @Put('verify-otp')
    verifyOtp(@Body() body: NewPassOtpDto){
        return this.userService.verifyOtp(body)
    }

    @Put('forget-password')
    forgetPassword(@Body() body: ForgetPassDto){
        return this.userService.forgetPassword(body)
    }

    @Put('reset-password')
    resetPassward(@Body() body: ResetPassDto){
        return this.userService.resetPassward(body)
    }

}
