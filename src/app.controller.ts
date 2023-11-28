import { Body, Controller, Delete, Get, Post, Put, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ForgetPassDto, NewPassOtpDto, OtpDto, ResetPassDto, SignInDto, SignUpDto, SocialSignInDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guards';

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

    @Post('social-signin')
    socialSignIn(@Body() body: SocialSignInDto) {
        return this.userService.socialSignIn(body);
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

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Delete('/logout')
    logOut(@Request() req){
        return this.userService.logOut(req.user.id)
    }

}
