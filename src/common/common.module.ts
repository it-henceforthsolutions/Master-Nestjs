import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { TwilioModule } from "nestjs-twilio";

@Module({
    imports:[
        TwilioModule.forRootAsync({
            useFactory: () => ({
              accountSid: process.env.TWILIO_SID,
              authToken: process.env.TWILIO_AUTH_TOKEN,
            })
          }),
    ],
    providers: [CommonService],
    exports: [CommonService]
})

export class CommonModule {}