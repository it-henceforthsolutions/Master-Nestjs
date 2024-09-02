import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'; 
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import * as dto from './dto';
import { ChatService } from './chat.service';
import { Roles } from 'src/auth/role.decorator';
import { UsersType } from 'src/users/role/user.role';

@Roles(UsersType.user)
@ApiTags('chat')
@Controller('chat')
export class ChatController {
    constructor(
        private readonly usersService: UsersService,
        private readonly chatservice: ChatService
    ) { }
  
    @ApiOperation({summary:"get users"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('users')
    async getUsers(@Req() req: any, @Query() query: dto.paginationsortsearch) {
      let user_id = req.user_data._id;
      return await this.chatservice.getUsers(user_id,query)
    }
  
    @ApiOperation({ summary: 'block user' })
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Patch('user/block-unblock')
    async block(@Req() req:any, @Body() body: dto.block_unblock) {
      let user_id = req.user_data._id;
      return  await this.chatservice.block_unblock(user_id, body);
    }

    @ApiOperation({ summary: 'get users' })
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('users/blocked')
    async getBlockedUsers(@Req() req: any, @Query() query: dto.paginationsortsearch) {
      let user_id = req.user_data._id;
      return await this.chatservice.get_blocked_user(user_id, query);
    }
  
    @ApiOperation({summary:"list user Connections"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('connections')
    async listConnection(@Req() req:any, @Query() pagination:dto.list_connection ) {
      let user_id = req.user_data._id;
      return await this.chatservice.getUserConnections(user_id, pagination)
    }
  
    @ApiOperation({summary:"Connections details"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('connections/:_id')
    async ConnectionDetails(@Req() req:any, @Param() param:dto.Mongodb_id ) {
      let user_id = req.user_data._id;
      return await this.chatservice.connection_details(user_id, param._id)
    } 
  
    @ApiOperation({ summary: 'list pins by connection' })
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('connections/:_id/pins')
    async listPins(@Param() param:dto.Mongodb_id, @Query() query: dto.pagination) {
      return await this.chatservice.get_pin_items(param._id, query);
    }
  
    @ApiOperation({summary:"list messages by connection_id"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('connections/:_id/message')
    async listMessage(@Req() req:any, @Param() param:dto.Mongodb_id, @Query() query: dto.pagination ) {
      let user_id = req.user_data._id;
      let payload =  { connection_id: param._id } 
      return await this.chatservice.getAllMessage( payload, query, user_id)
    }
  
    @ApiOperation({summary:"mute-unmute connection"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Patch('connection/:_id/mute')
    async connection_mute(@Param() param:dto.Mongodb_id, @Body() body:dto.mute_connection ,@Req() req:any) {
      let user_id = req.user_data._id;
      return await this.chatservice.mute_unmute( user_id, param._id, body)
    }
    
    @ApiOperation({summary:"create_group"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Post('group')
    async create_group(@Body() body:dto.CreateGroupDto , @Req() req) {
      return await this.chatservice.createGroup(req, body)
    }
  
    @ApiOperation({summary:"add group members"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Put('group/:_id/members')
    async addGroupMember(@Param() param:dto.Mongodb_id, @Body() body:dto.AddGroupMemberDto ,@Req() req) {
      let user_id = req.user_data._id;
      return await this.chatservice.addGroupMember(param._id, body, user_id)
    }
  
    @ApiOperation({summary:"get user groups"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('group')
    async getGroups(@Req() req:any, @Query() query: dto.paginationsort ) {
      return await this.chatservice.getGroups(req, query)
    }
  
    @ApiOperation({summary:"get  group members"})
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authentication')
    @Get('group/:_id/memberlist')
    async getGroupMembers(@Param() param:dto.Mongodb_id, @Req() req:any, @Query() query: dto.paginationsort ) {
      return await this.chatservice.getGroupMembers(param._id, query)
    }
    
    @ApiOperation({ summary: "deliver" })
    @Patch('deliver')
    async Deliver(@Req() req:any, @Body() dto: dto.Deliver_message) {
      return await this.chatservice.deliverMessage(req.user_data._id, dto);
    }


    
    
    
 }