import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, PaginationDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post()
    @ApiBearerAuth('authentication')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    create(@Body() createPageDto: CreatePageDto) {
        return this.pagesService.create(createPageDto);
    }

    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Get()
    findAll(@Query() query: PaginationDto) {
        return this.pagesService.findAll(query);
    }

    @Get(':slug')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    findOne(@Param('slug') slug: string) {
        return this.pagesService.findOne(slug);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @Patch(':id')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
        return this.pagesService.update(id, updatePageDto);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pagesService.remove(id);
    }
}