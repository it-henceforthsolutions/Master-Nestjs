import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { connectionModel, Connections } from './schema/connection.schema';
import { Messages, messageSchema } from './schema/message.schema';
import { Members, memberSchema } from './schema/member.schema';
import { Groups, groupSchema } from './schema/group.schema';
import { Blocked, BlockedSchema } from './schema/chatblock.schema';
import { Pins, PinsSchema } from './schema/pinitems.schemas';
import { SocketGateway } from './socket.gateway';
import { ChatServiceGateway } from './chat.gateway';
import { Call, CallSchema } from './schema/call.schemas';
import { ChatSetting, ChatSettingSchema } from './schema/chatsetting.schemas';
import { LiveStreaming, LiveStreamingSchema } from './schema/liveStream.schemas';
import { AgoraModule } from 'src/agora/agora.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Connections.name, schema: connectionModel },
    { name: Messages.name, schema: messageSchema },
    { name: Members.name, schema: memberSchema },
    { name: Groups.name, schema: groupSchema },
    { name: Blocked.name, schema: BlockedSchema },
    { name: Pins.name, schema: PinsSchema },
    { name: Call.name, schema: CallSchema },
    { name: ChatSetting.name, schema: ChatSettingSchema },
    { name: LiveStreaming.name, schema: LiveStreamingSchema },
  ]),
    AgoraModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatServiceGateway, SocketGateway],
})
export class ChatModule {}
