import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, Request } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, PaginationDto } from './dto/create-quote.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuards } from 'src/auth/auth.services';
import { RolesGuard } from 'src/auth/role.guards';
import { Roles } from 'src/staff/role.decorator';
import { StaffRoles } from 'src/staff/roles/StaffRoles';
import { UserAuthguard } from 'src/auth/auth.guards';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

    @ApiBearerAuth()
    @UseGuards(UserAuthguard)
    @ApiOperation({ summary: 'Contact-us' })
    @Post()
    create(@Body() createQuoteDto: CreateQuoteDto, @Request() req) {
        return this.quotesService.create(createQuoteDto, req?.user?._id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards, RolesGuard)
    @Roles(StaffRoles.contact_us)
    @ApiOperation({ summary: 'Get All Contact-us' })
    @Get()
    findAll(@Req() req: any, @Query() searchQuery: PaginationDto) {
        return this.quotesService.findAll(req.user._id, searchQuery);
    }


    @ApiBearerAuth()
    @UseGuards(AuthGuards, RolesGuard)
    @Roles(StaffRoles.contact_us)
    @ApiOperation({ summary: 'Resolve Contact-us' })
    @Patch('resolve/:id')
    update(@Param('id') id: string, @Req() req: any) {
        return this.quotesService.update(id, req.user._id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards, RolesGuard)
    @Roles(StaffRoles.contact_us)
    @ApiOperation({ summary: 'Delete Contact-us' })
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.quotesService.remove(id, req.user._id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuards, RolesGuard)
    @Roles(StaffRoles.contact_us)
    @ApiOperation({ summary: 'Get Contact-us View Details' })
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.quotesService.findOne(req.user._id, id);
    }

}
