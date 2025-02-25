import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, PaginationDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
// import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post()
    @ApiBearerAuth('authentication')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @ApiOperation({ summary: 'Add Page' })
    @ApiResponse({ status: 201, description: 'OK' })
    create(@Body() createPageDto: CreatePageDto) {
        return this.pagesService.create(createPageDto);
    }

    @ApiOperation({ summary: 'FindAll Page' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Get()
    findAll(@Query() query: PaginationDto) {
        return this.pagesService.findAll(query);
    }

    @ApiOperation({ summary: 'Find Page By Slug' })
    @Get(':id')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    findOne(@Param('id') id: string) {
        return this.pagesService.findOne(id);
    }

    @ApiOperation({ summary: 'update page' })
    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Patch(':id')
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
        return this.pagesService.update(id, updatePageDto);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @ApiOperation({ summary: 'delete page' })
    @ApiResponse({ status: 201, description: 'DELETED' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pagesService.remove(id);
    }
}