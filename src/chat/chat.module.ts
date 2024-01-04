import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatServiceGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, messageSchema } from "src/chat/schema/message.schemas"
import { Connection, connectionSchema } from './schema/connection.schemas';
import { UsersModule } from 'src/users/users.module';
import { Member, memberSchema } from './schema/member.schema';
import { Group, groupSchema } from './schema/group.schema';
import { ChatController } from './chat.controller';


@Module({
    imports: [MongooseModule.forFeature([
        { name: Connection.name, schema: connectionSchema },
        { name: Message.name, schema: messageSchema },
        { name: Member.name, schema: memberSchema },
        { name: Group.name, schema: groupSchema },
        
    ]),
    UsersModule
],
    controllers:[ ChatController],
    providers: [ChatService, ChatServiceGateway],
    // exports: [ChatService]
})
export class ChatModule { }
