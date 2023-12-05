import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, CreateStaffResponseDto, PaginationStaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { UsersType } from 'src/users/role/user.role';
import { Permission, Roles } from 'src/auth/role.decorator';
import { Role } from './role/staff.role';

@ApiTags('staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }


  @Post()
  @ApiBearerAuth('authentication')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin,UsersType.staff)
  @Permission(Role.manage)
  @ApiOperation({ summary: 'Add Staff' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin,UsersType.staff)
  @Permission(Role.readonly)
  @Get()
  findAll(@Query() body: PaginationStaffDto) {
    return this.staffService.findAll(body);
  }

  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin,UsersType.staff)
  @Permission(Role.readonly)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin,UsersType.staff)
  @Permission(Role.manage)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin,UsersType.staff)
  @Permission(Role.manage)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
