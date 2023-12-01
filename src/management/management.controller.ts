import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuards } from 'src/auth/auth.services';
import { Roles } from 'src/staff/role.decorator';
import { StaffRoles } from 'src/staff/roles/StaffRoles';
import { RolesGuard } from 'src/auth/role.guards';

@ApiTags('management')
@Controller('management')
export class ManagementController {
    constructor(private readonly managementService: ManagementService) { }

    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.homepage)
    @ApiConsumes('application/json','application/x-www-form-urlencoded')
    @Post()
    create(@Body() body: CreateManagementDto,@Request() req) {
        return this.managementService.create(body,req.user._id);
    }

    @Get()
    findAll() {
        return this.managementService.findAll();
    }

    @Get('homepage')
    find() {
        return this.managementService.findHome();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.managementService.findOne(id);
    }
}
