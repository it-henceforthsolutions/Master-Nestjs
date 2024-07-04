import { Body, Controller, Delete, Patch, Post, Put, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ForgetPassDto, NewPassOtpDto, OtpDto, SignInDto, SignUpDto, SocialSignInDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guards';
import { ChangePassDto, ResetPassDto, UpdateEmailDto, UpdatePhoneDto, UpdateUserDto } from './users/dto/update-user.dto';
import { AdminService } from './admin/admin.service';
import { UsersType } from './users/role/user.role';
import { Roles } from './auth/role.decorator';

@Roles(UsersType.user)
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
    
    @ApiOperation({ summary: 'sign up' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post('signup')
    signUp(@Body() body: SignUpDto) {
        return this.userService.signUp(body);
    }

    @ApiOperation({ summary: 'sign in' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post('signin')
    signIn(@Body() body: SignInDto) {
        return this.userService.signIn(body);
    }

    @ApiOperation({ summary: 'signin with your social Id' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post('social-signin')
    socialSignIn(@Body() body: SocialSignInDto) {
        return this.userService.socialSignIn(body);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'verify email' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Put('verify-email')
    verifyEmail(@Body() body: OtpDto, @Req() req) {
        return this.userService.verifyEmail(body, req.user_data._id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'verify phone' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Put('verify-phone')
    verifyPhone(@Body() body: OtpDto, @Req() req) {
        return this.userService.verifyPhone(body, req.user_data._id)
    }

    @Put('verify-otp')
    @ApiOperation({ summary: 'verify otp' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    verifyOtp(@Body() body: NewPassOtpDto) {
        return this.userService.verifyOtp(body)
    }

    // @UseGuards(AuthGuard)
    // @ApiBearerAuth('authentication')
    // @ApiOperation({ summary: 'resend otp on email' })
    // @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    // @ApiResponse({ status: 201, description: 'OK' })
    // @Put('resend-otp-email')
    // resendEmailOtp(@Request() req) {
    //     return this.userService.resendEmailOtp(req.user_data._id)
    // }
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'resend otp on phone' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Put('resend-otp-phone')
    resendPhoneOtp(@Request() req) {
        return this.userService.resendPhoneOtp(req.user_data._id)
    }
    
    @ApiOperation({ summary: 'resend otp on email for forget password' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Put('resend-otp')
    resendOtp(@Body() body: UpdateEmailDto) {
        return this.userService.resendOtp(body)
    }
    @ApiOperation({ summary: 'forget password' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Put('forget-password')
    forgetPassword(@Body() body: ForgetPassDto) {
        return this.userService.forgetPassword(body)
    }

    @Put('reset-password')
    @ApiOperation({ summary: 'forget password > reset your password ' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    resetPassward(@Body() body: ResetPassDto) {
        return this.userService.resetPassward(body)
    }
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'change password' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Put('change-password')
    changePassward(@Body() body: ChangePassDto, @Request() req) {
        return this.userService.changePassward(body, req.user_data._id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'update profile' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Patch('profile')
    update(@Body() body: UpdateUserDto, @Req() req) {
        return this.userService.update(req.user_data._id, body);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'update Email' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'VERIFIED' })
    @Patch('email') 
    updateEmail(@Body() body: UpdateEmailDto, @Req() req) {
        return this.userService.updateEmail(req.user_data._id, body);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'update phone number' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'VERIFIED' })
    @Patch('phone')
    updatePhone(@Body() body: UpdatePhoneDto, @Req() req) {
        return this.userService.updatePhone(req.user_data._id, body);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'logout' })
    @ApiResponse({ status: 201, description: "LogOut Successfully!" })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Delete('/logout')
    logOut(@Request() req) {
        return this.userService.logOut(req.user_data._id)
    }

}
