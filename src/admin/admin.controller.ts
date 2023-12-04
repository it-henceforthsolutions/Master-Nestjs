import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { UsersService } from 'src/users/users.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private userService: UsersService
    ) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @ApiOperation({summary: 'admin dashboard'})
    @Get('dashboard')
    dashboard() {
        return this.adminService.dashboard();
    }
}
