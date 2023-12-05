import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { Permission, Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/staff/role/staff.role';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private userService: UsersService
    ) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.readonly)
    @ApiOperation({summary: 'admin dashboard'})
    @ApiResponse({ status: 201, description: 'OK' })
    @Get('dashboard')
    dashboard() {
        return this.adminService.dashboard();
    }
}
