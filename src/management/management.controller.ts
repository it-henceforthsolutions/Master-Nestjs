import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { UsersType } from 'src/users/role/user.role';
import { Roles } from 'src/auth/role.decorator';


@ApiTags('management')
@Controller('management')
export class ManagementController {
    constructor(private readonly managementService: ManagementService) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @ApiConsumes('application/json','application/x-www-form-urlencoded')
    @Post()
    create(@Body() body: CreateManagementDto) {
        return this.managementService.create(body);
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
