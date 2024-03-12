import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgoraService } from './agora.service';
import { AgoraRoleDto } from './dto/agora-role.dto';
import { AuthGuard } from 'src/auth/auth.guards';
@ApiTags('agora')
@Controller('agora')
export class AgoraController {
  constructor(private readonly agoraservice: AgoraService) {}





  @ApiBearerAuth('authentication')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'agora create token' })
  @Get('/agora/channel/name')
  async create_channel_name() {
return await this.agoraservice.create_channel_name()
   
  }


  @ApiOperation({ summary: 'agora create token' })
  @Post('/token')
  async create_token(@Body() agoraRoleDto:AgoraRoleDto) {
    try {
      let data = await this.agoraservice.create_token(agoraRoleDto);
      let response = {
        success: true,
        data: data,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }
}
