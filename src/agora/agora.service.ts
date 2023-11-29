import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CommonServices } from 'src/common/common.services';
import { ConfigService } from "@nestjs/config";
const { RtcTokenBuilder, RtcRole } = require('agora-token')

@Injectable()
export class AgoraService {
    private AGORA_APP_ID: string;
    private AGORA_APP_CERTIFICATE: string;

    constructor(
        private commonServices: CommonServices,
        private readonly configService: ConfigService,
    ) {
        this.AGORA_APP_ID = this.configService.get<string>('AGORA_APP_ID');
        this.AGORA_APP_CERTIFICATE = this.configService.get<string>('AGORA_APP_CERTIFICATE');
     }

    create_token = async () => {
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const privilegeExpireTime = currentTime + 360000;
            let channelName = await this.commonServices.generateChannelName();
            let role = RtcRole.PUBLISHER;
            let uid = 0;
            console.log("AGORA_APP_ID", this.AGORA_APP_ID);
            console.log("AGORA_APP_CERTIFICATE", this.AGORA_APP_CERTIFICATE);

            let token = await RtcTokenBuilder.buildTokenWithUid(this.AGORA_APP_ID, this.AGORA_APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
            let response = {
                channelName,
                token
            }
            return response
        } catch (e) {
            throw e
        }
    }
}