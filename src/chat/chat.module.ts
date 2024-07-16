import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatServiceGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, messageSchema } from 'src/chat/schema/message.schemas';
import { Connections, connectionModel } from './schema/connection.schemas';
import { UsersModule } from 'src/users/users.module';
import { Members, memberSchema } from './schema/member.schema';
import { Groups, groupSchema } from './schema/group.schema';
import { ChatController } from './chat.controller';
import { Blocked, BlockedSchema } from './schema/block.schemas';
import { Call, CallSchema } from './schema/call.schemas';
import { AgoraModule } from 'src/agora/agora.module';
import { SocketGateway } from './socket.gateway';
import { Pins, PinsSchema } from './schema/pinitems.schemas';
import { ChatSetting, ChatSettingSchema } from './schema/chatsetting.schemas';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Connections.name, schema: connectionModel },
      { name: Messages.name, schema: messageSchema },
      { name: Members.name, schema: memberSchema },
      { name: Groups.name, schema: groupSchema },
      { name: Blocked.name, schema: BlockedSchema },
      { name: Call.name, schema: CallSchema },
      { name: Pins.name, schema: PinsSchema },
      { name: ChatSetting.name, schema: ChatSettingSchema },
    ]),
    UsersModule,
    AgoraModule,
    CommonModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatServiceGateway, SocketGateway],
  // exports: [ChatService]
})
export class ChatModule {}
