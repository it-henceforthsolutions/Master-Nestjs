import { Module } from '@nestjs/common';
import { AgoraService } from './agora.service';
import { AgoraController } from './agora.controller';

@Module({
  providers: [AgoraService],
  controllers: [AgoraController],
  exports:[AgoraService]
})
export class AgoraModule {}
