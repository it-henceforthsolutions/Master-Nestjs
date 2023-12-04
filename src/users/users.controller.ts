import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put(':id/block')
    @ApiResponse({ status: 201, description: 'BLOCKED' })
    @ApiOperation({summary: 'block user by admin'})
    block(@Param('id') id: string) {
        return this.usersService.block(id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put(':id/deactivate')
    @ApiResponse({ status: 201, description: 'DEACTIVE' })
    @ApiOperation({summary: 'deactivate user by admin'})
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(id)
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
    getAll() {
        return this.usersService.getAll()
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
