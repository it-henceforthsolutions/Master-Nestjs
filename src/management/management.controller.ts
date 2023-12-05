import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { UsersType } from 'src/users/role/user.role';
import { Permission, Roles } from 'src/auth/role.decorator';
import { Role } from 'src/staff/role/staff.role';


@ApiTags('management')
@Controller('management')
export class ManagementController {
    constructor(private readonly managementService: ManagementService) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.manage)
    @ApiConsumes('application/json','application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiOperation({summary: 'Add HomePage'})
    @Post()
    create(@Body() body: CreateManagementDto) {
        return this.managementService.create(body);
    }

    @ApiOperation({summary: 'find All Pages'})
    @Get()
    findAll() {
        return this.managementService.findAll();
    }

    @ApiOperation({summary: 'find Home Page'})
    @Get('homepage')
    find() {
        return this.managementService.findHome();
    }

    @ApiOperation({summary: 'findOne Page'})
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.managementService.findOne(id);
    }
}
