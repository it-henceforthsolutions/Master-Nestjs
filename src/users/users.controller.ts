import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
// import { Role } from 'src/staff/role/staff.role';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from './role/user.role';
import { DeactivateDto, exportData, importFileDto, paginationsortsearch } from './dto/user.dto';
import { UserType } from 'utils';
import { FileInterceptor } from '@nestjs/platform-express';


// @Permission(Role.manage)
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('profile')
    @ApiOperation({summary: 'get your profile'})
    profile(@Request() req) {
        return this.usersService.profile(req.user_data._id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get(':id')
    @ApiOperation({summary: 'get a selected user'})
    getById(@Param('id') id: string) {
        return this.usersService.getById(id)
    }
    
    @ApiOperation({summary: 'get all users'})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get()
    getAll(@Query() query: paginationsortsearch ) {
        return this.usersService.getAll(query)
    }
    
   
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Delete(':id/deactivateUser')
    @ApiResponse({ status: 201, description: 'DEACTIVE' })
    @ApiOperation({summary: 'deactivate your account'})
    deactivateUser(@Param('id') id: string,@Body() body:DeactivateDto) {
        return this.usersService.deactivateUser(id,body)
    }


    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @ApiResponse({ status: 201, description: 'DELETED' })
    @Delete(':id')
    @ApiOperation({summary: 'delete user'})
    delete(@Param('id') id: string) {
        return this.usersService.delete(id)
    }


}
