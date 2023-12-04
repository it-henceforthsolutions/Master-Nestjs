import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, PaginationDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';


@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
    constructor(private readonly faqsService: FaqsService) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post()
    create(@Body() createFaqDto: CreateFaqDto) {
        return this.faqsService.create(createFaqDto);
    }

    @Get()
    findAll(@Query() body: PaginationDto) {
        return this.faqsService.findAll(body);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.faqsService.findOne(id);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
        return this.faqsService.update(id, updateFaqDto);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard,RolesGuard)
    @Roles(UsersType.admin)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.faqsService.remove(id);
    }
}