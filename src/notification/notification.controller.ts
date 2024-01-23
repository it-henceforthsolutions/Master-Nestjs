import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import { UsersType } from 'src/users/role/user.role';
import { Permission, Roles } from 'src/auth/role.decorator';
import { Role } from 'src/staff/role/staff.role';
import { RolesGuard } from 'src/auth/role.guard';


@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post()
  @ApiBearerAuth('authentication')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin, UsersType.staff)
  @Permission(Role.manage)
  @ApiOperation({ summary: 'send notification', description: '1 ->all users , 2 ->selected users' })
  @ApiResponse({ status: 201, description: 'OK' })
  async send_notification(@Body() payload: CreateNotificationDto, @Request() req) {
    return await this.notificationService.send_notification(payload, req);
  }

  @Get('emails')
  @ApiBearerAuth('authentication')
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UsersType.admin, UsersType.staff)
  @Permission(Role.readonly)
  @ApiOperation({ summary: 'listing emails' })
  async list_emails() {
    return await this.notificationService.list_emails();
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'notifications of particular user' })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  async get_notifications_list(@Request() req)
  {
    return await this.notificationService.get_notifications_list(req);
  }

  @Put('mark-all-read')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'mark all notifications as read' })
  @ApiConsumes('application/json', 'application/x-www-form-urlencoded')
  async mark_all_read(@Request() req)
  {
    return await this.notificationService.mark_all_read(req);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({summary:'mark particular notification as read'})
  @ApiConsumes('application/json','application/x-www-form-urlencoded')
  async read_notification(@Request() request, @Param('id') id:string)
  {
    return await this.notificationService.read_notification(id,request);
  }
}
