import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'; 
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guards';
import * as dto from './dto';
import { ChatService } from './chat.service';


@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatservice: ChatService
    ) {}

  @ApiOperation({summary:"create_group"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Post('group')
  create_group(@Body() body:dto.CreateGroupDto ,@Req() req) {
    return this.chatservice.createGroup(req, body)
  }

  @ApiOperation({summary:"add group members"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Put('group/:_id/members')
  addGroupMember(@Param('_id') _id:string, @Body() body:dto.AddGroupMemberDto ,@Req() req) {
    let user_id = req.user.id;
    return this.chatservice.addGroupMember(_id, body, user_id)
  }


  @ApiOperation({summary:"get user groups"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('group')
  getGroups(@Req() req:any, @Query() query: dto.paginationsort ) {
    return this.chatservice.getGroups(req, query)
  }

  @ApiOperation({summary:"get  group members"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('group/memberlist')
  getGroupMembers(@Param('_id') _id:string, @Req() req:any, @Query() query: dto.paginationsort ) {
    return this.chatservice.getGroupMembers(_id, query)
  }


  @ApiOperation({summary:"get users"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('users')
  getUsers(@Req() req:any, @Query() query: dto.paginationsortsearch ) {
    console.log("heloo")
    return this.chatservice.getUsers(query)
  }

  @ApiOperation({summary:"list user Connections"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('connections')
  listConnection(@Req() req:any, @Query() pagination:dto.pagination ) {
    let user_id = req.user.id;
    return this.chatservice.getUserList(user_id, pagination)
  }

  @ApiOperation({summary:"Connections details"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('connections/:_id')
  ConnectionDetails(@Req() req:any, @Param('_id') _id:string ) {
    let user_id = req.user.id;
    return this.chatservice.connection_details(user_id, _id)
  } 


  @ApiOperation({summary:"list messages by connection"})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authentication')
  @Get('connections/:_id/message')
  listMessage(@Req() req:any,@Param('_id') _id:string, @Query() query: dto.pagination ) {
    let user_id = req.user.id;
      let payload =  { connection_id:_id } 
    return this.chatservice.getAllMessage( payload, query )
  }

}
