import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
// import { RolesGuard } from 'src/auth/role.guard';
import { Permission, Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/staff/role/staff.role';
import { StripeService } from 'src/stripe/stripe.service';
import { SignInDto } from './dto/create-admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private StripeService: StripeService,
        private userService: UsersService
    ) { }

    @ApiBearerAuth('authentication')
    // @UseGuards(AuthGuard, RolesGuard)
    @Roles(UsersType.admin, UsersType.staff)
    @Permission(Role.readonly)
    @ApiOperation({ summary: 'admin dashboard' })
    @ApiResponse({ status: 201, description: 'OK' })
    @Get('dashboard')
    dashboard() {
        return this.adminService.dashboard();
    }

    @ApiOperation({ summary: 'sign in' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
    @Post('signin')
    async signIn(@Body() body: SignInDto) {
        try {
            return await this.adminService.signIn(body);

        } catch (error) {
            throw error
        }
    }


    // @UseGuards(AuthGuard)
    // @ApiBearerAuth('access_token')
    // @Post('plan')
    // async create_plan(@Body() body: dto.plan) {
    //     try {
    //         let data = await this.StripeService.create_plan(body)
    //         return data;
    //     } catch (error) {
    //         throw error
    //     }
    // }


    // @Get('plan')
    // async list_plan() {
    //     try {
    //         let data = await this.StripeService.list_plan()
    //         return data;
    //     } catch (error) {
    //         throw error
    //     }
    // }

    // @Get('plan/:_id')
    // async get_plan(@Param('_id') _id: string) {
    //     try {
    //         let data = await this.StripeService.get_plan(_id)
    //         return data;
    //     } catch (error) {
    //         throw error
    //     }
    // }

    // @UseGuards(AuthGuard)
    // @ApiBearerAuth('access_token')
    // @Delete('plan/:_id')
    // async delete_plan(@Param('_id') _id: string) {
    //     try {
    //         let data = await this.StripeService.delete_plan(_id)
    //         return data;
    //     } catch (error) {
    //         throw error
    //     }
    // }

}
