import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, Request } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, PaginationDto } from './dto/create-quote.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) { }

    @ApiOperation({ summary: 'Contact-us' })
    @ApiResponse({ status: 201, description: 'OK' })
    @Post()
    create(@Body() createQuoteDto: CreateQuoteDto) {
        return this.quotesService.create(createQuoteDto);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @ApiOperation({ summary: 'Get All Contact-us' })
    @ApiResponse({description: ''})
    @Get()
    findAll(@Query() searchQuery: PaginationDto) {
        return this.quotesService.findAll(searchQuery);
    }


    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @ApiOperation({ summary: 'Resolve Contact-us' })
    @ApiResponse({ status: 201, description: 'UPDATED' })
    @Patch('resolve/:id')
    update(@Param('id') id: string, @Req() req: any) {
        return this.quotesService.update(id);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @ApiOperation({ summary: 'Delete Contact-us' })
    @ApiResponse({ status: 201, description: 'DELETED' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.quotesService.remove(id);
    }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin)
    @ApiOperation({ summary: 'Get Contact-us View Details' })
    @ApiResponse({description: ''})
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quotesService.findOne(id);
    }

}
