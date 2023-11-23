import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SignInDto, SignUpDto } from './users/dto/user.dto';
import { UsersService } from './users/users.service';

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
    signIn(@Body() body: SignUpDto) {
        return this.userService.signIn(body);
    }
}
