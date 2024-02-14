import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatServiceGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, messageSchema } from "src/chat/schema/message.schemas"
import { Connections, connectionModel } from './schema/connection.schemas';
import { UsersModule } from 'src/users/users.module';
import { Members, memberSchema } from './schema/member.schema';
import { Groups, groupSchema } from './schema/group.schema';
import { ChatController } from './chat.controller';


@Module({
    imports: [MongooseModule.forFeature([
        { name: Connections.name, schema: connectionModel },
        { name: Messages.name, schema: messageSchema },
        { name: Members.name, schema: memberSchema },
        { name: Groups.name, schema: groupSchema },
        
    ]),
    UsersModule
],
    controllers:[ ChatController],
    providers: [ChatService, ChatServiceGateway],
    // exports: [ChatService]
})
export class ChatModule { }
