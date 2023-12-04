import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put(':id/block')
    @ApiOperation({summary: 'block user by admin'})
    block(@Param('id') id: string) {
        return this.usersService.block(id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put(':id/deactivate')
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
    @Delete(':id')
    @ApiOperation({summary: 'delete user'})
    delete(@Param('id') id: string) {
        return this.usersService.delete(id)
    }

}
