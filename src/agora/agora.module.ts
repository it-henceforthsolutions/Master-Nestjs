import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { AgoraController } from "./agora.controller";
import { AgoraService } from "./agora.service";
import { CommonServices } from "src/common/common.services";
import {DatabaseModule} from "../model/model.module"
@Module({
    imports: [CommonModule, DatabaseModule],
    providers: [AgoraService, CommonServices],
    controllers: [AgoraController],
    exports: [AgoraService]
})

export class AgoraModule { }
