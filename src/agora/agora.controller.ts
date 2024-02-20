import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgoraService } from './agora.service';
import { AgoraRoleDto } from './dto/agora-role.dto';
@ApiTags('agora')
@Controller('agora')
export class AgoraController {
  constructor(private readonly agoraservice: AgoraService) {}

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
