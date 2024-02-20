import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as randomstring from 'randomstring';
import { AgoraRoleDto } from './dto/agora-role.dto';
const { RtcTokenBuilder, RtcRole } = require('agora-token');
@Injectable()
export class AgoraService {
  private AGORA_APP_ID: string;
  private AGORA_APP_CERTIFICATE: string;

  constructor(private readonly configService: ConfigService) {
    this.AGORA_APP_ID = this.configService.get<string>('AGORA_APP_ID');
    this.AGORA_APP_CERTIFICATE = this.configService.get<string>(
      'AGORA_APP_CERTIFICATE',
    );
  }

  async create_token(agoraRoleDto:AgoraRoleDto) {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const privilegeExpireTime = currentTime + 360000;
      let channelName = await this.generateChannelName();
      let role
      if (agoraRoleDto.role == 'PUBLISHER') {
        role = RtcRole.PUBLISHER
    }
    if (agoraRoleDto.role == 'SUBSCRIBER') {
       
        role = RtcRole.SUBSCRIBER
    } //PUBLISHER || SUBSCRIBER
      let uid = 0;
      console.log('AGORA_APP_ID', this.AGORA_APP_ID);
      console.log('AGORA_APP_CERTIFICATE', this.AGORA_APP_CERTIFICATE);

      let token = await RtcTokenBuilder.buildTokenWithUid(
        this.AGORA_APP_ID,
        this.AGORA_APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpireTime,
      );
      let response = {
        channelName,
        token,
      };
      return response;
    } catch (e) {
      throw e;
    }
  }

  async generateChannelName  ()  {
    try {
      let options = {
        length: 9,
        charset: 'alphanumeric',
      };
      console.log('channel');

      // let channel = randomstring.generate(options);
      let channel = randomstring.generate(options);
      console.log('channel', channel);

      return channel;
    } catch (err) {
      throw err;
    }
  };
}
