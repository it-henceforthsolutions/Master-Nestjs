import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, PaginationDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuards } from 'src/auth/auth.services';
import { RolesGuard } from 'src/auth/role.guards';
import { StaffRoles } from 'src/staff/roles/StaffRoles';
import { Roles } from 'src/staff/role.decorator';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post()
    @ApiBearerAuth()
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.pages)
    create(@Body() createPageDto: CreatePageDto, @Request() req) {
        return this.pagesService.create(req.user._id, createPageDto);
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

    @Patch(':id')
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.pages)
    update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto, @Request() req) {
        return this.pagesService.update(id, req.user._id, updatePageDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.pages)
    remove(@Param('id') id: string, @Request() req: any) {
        return this.pagesService.remove(id, req.user._id);
    }
}