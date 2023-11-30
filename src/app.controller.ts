import { Body, Controller, Delete, Get, Post, Put, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ForgetPassDto, NewPassOtpDto, OtpDto, SignInDto, SignUpDto, SocialSignInDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guards';
import { ChangePassDto, ResetPassDto } from './users/dto/update-user.dto';
import { AdminService } from './admin/admin.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private userService: UsersService,
        private adminService: AdminService
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        await this.adminService.createAdmin();
    }
    
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
    verifyEmail(@Body() body: OtpDto, @Req() req) {
        return this.userService.verifyEmail(body, req.user.id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('verify-phone')
    verifyPhone(@Body() body: OtpDto, @Req() req) {
        return this.userService.verifyPhone(body, req.user.id)
    }

    @Put('verify-otp')
    verifyOtp(@Body() body: NewPassOtpDto) {
        return this.userService.verifyOtp(body)
    }

    @Put('forget-password')
    forgetPassword(@Body() body: ForgetPassDto) {
        return this.userService.forgetPassword(body)
    }

    @Put('reset-password')
    resetPassward(@Body() body: ResetPassDto) {
        return this.userService.resetPassward(body)
    }
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('change-password')
    changePassward(@Body() body: ChangePassDto, @Request() req) {
        return this.userService.changePassward(body, req.user.id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Delete('/logout')
    logOut(@Request() req) {
        return this.userService.logOut(req.user.id)
    }

}
