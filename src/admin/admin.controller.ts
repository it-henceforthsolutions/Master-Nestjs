import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, UseInterceptors, UploadedFile, Put, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
// import { RolesGuard } from 'src/auth/role.guard';
import { Permission, Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/staff/role/staff.role';
import { StripeService } from 'src/stripe/stripe.service';
import { SignInDto } from './dto/create-admin.dto';
import { exportData, importFileDto, paginationsortsearch } from './dto/admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Roles(UsersType.admin, UsersType.staff)
@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private StripeService: StripeService,
        private userService: UsersService
    ) { }

    @ApiBearerAuth('authentication')
    @UseGuards(AuthGuard)
    @Roles(UsersType.admin, UsersType.staff)
    @ApiOperation({ summary: 'admin dashboard' })
    @ApiResponse({ status: 201, description: 'OK' })
    @Get('dashboard')
    dashboard(@Req()req:any) {
        return this.adminService.dashboard(req);
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

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('profile')
    @ApiOperation({summary: 'get your profile'})
    profile(@Request() req) {
        return this.adminService.profile(req.user_data._id)
    }


    @ApiOperation({summary: 'get all users'})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('user')
    getAll(@Query() query: paginationsortsearch ) {
        return this.adminService.getAll(query)
    }

    @Roles(UsersType.admin)
    @Post('user/import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: importFileDto })
    @UseInterceptors(FileInterceptor('file'))
    async uploadProduct(@UploadedFile() file: Express.Multer.File) {
      console.log("request.....",file)
      let response= await this.adminService.importProduct(file) 
      return response
    }

    @Roles(UsersType.admin, UsersType.staff)
    @Get('user/export')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    async exportProduct(@Query() query:exportData) {
        console.log("-=-=-=-quey-----",query.start_date);
        try {
            let data = await this.adminService.exportUser(query)
            return data
        }
        catch (err) {
            throw err
        }
    }

    @Roles(UsersType.admin, UsersType.staff)
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('user/:id/block')
    @ApiResponse({ status: 201, description: 'BLOCKED' })
    @ApiOperation({summary: 'block user by admin'})
    block(@Param('id') id: string) {
        return this.adminService.block(id)
    }

    @Roles(UsersType.admin, UsersType.staff)
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('user/:id/deactivate')
    @ApiResponse({ status: 201, description: 'DEACTIVE' })
    @ApiOperation({summary: 'deactivate user by admin'})
    deactivate(@Param('id') id: string) {
        return this.adminService.deactivate(id)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('user/:id')
    @ApiOperation({summary: 'get a selected user'})
    getById(@Param('id') id: string) {
        return this.adminService.getById(id)
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
