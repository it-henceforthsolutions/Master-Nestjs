import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, PaginationDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuards } from 'src/auth/auth.services';
import { RolesGuard } from 'src/auth/role.guards';
import { Roles } from 'src/staff/role.decorator';
import { StaffRoles } from 'src/staff/roles/StaffRoles';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
    constructor(private readonly faqsService: FaqsService) { }

    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.faqs)
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post()
    create(@Body() createFaqDto: CreateFaqDto, @Request() req) {
        return this.faqsService.create(req.user._id, createFaqDto);
    }

    @Get()
    findAll(@Query() query: PaginationDto) {
        return this.faqsService.findAll(query);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.faqs)
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.faqsService.findOne(id, req.user._id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.faqs)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto, @Request() req) {
        return this.faqsService.update(id, req.user._id, updateFaqDto);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards,RolesGuard)
    @Roles(StaffRoles.faqs)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.faqsService.remove(id, req.user._id);
    }
}