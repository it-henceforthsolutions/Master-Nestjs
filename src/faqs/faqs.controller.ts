import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, PaginationDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
// import { RolesGuard } from 'src/auth/role.guard';
import { Permission, Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { Role } from 'src/staff/role/staff.role';


@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
    constructor(private readonly faqsService: FaqsService) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.manage)
    @ApiOperation({summary: 'create FAQs'})
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @ApiResponse({ status: 201, description: 'OK' })
    @Post()
    create(@Body() createFaqDto: CreateFaqDto) {
        return this.faqsService.create(createFaqDto);
    }

    @ApiOperation({summary: 'Find All FAQs'})
    @Get()
    findAll(@Query() body: PaginationDto) {
        return this.faqsService.findAll(body);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.readonly)
    @ApiOperation({summary: 'Find FAQs By Id'})
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.faqsService.findOne(id);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.manage)
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiOperation({summary: 'Update FAQs'})
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFaqDto: UpdateFaqDto) {
        return this.faqsService.update(id, updateFaqDto);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin,UsersType.staff)
    @Permission(Role.manage)
    @ApiResponse({ status: 201, description: 'DELETED!!' })
    @ApiOperation({summary: 'Delete FAQs'})
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.faqsService.remove(id);
    }
}