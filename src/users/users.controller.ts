import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { UpdateEmailDto, UpdatePhoneDto, UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from './role/user.role';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard,RolesGuard)
  @Roles(UsersType.user)
  @ApiBearerAuth('authentication')
  @Patch('profile')
  update(@Body() body:UpdateUserDto,@Req() req) {
    return this.usersService.update(req.user.id,body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Patch('email')
  updateEmail(@Body() body:UpdateEmailDto,@Req() req) {
    return this.usersService.updateEmail(req.user.id,body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Patch('phone')
  updatePhone(@Body() body:UpdatePhoneDto,@Req() req) {
    return this.usersService.updatePhone(req.user.id,body);
  }

}
