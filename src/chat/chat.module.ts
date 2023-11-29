import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatServices } from './chat.services';
import { ChatController } from './chat.controller';
//import { UserAggregation } from 'src/users/user.aggregation';
import { ChatAggregation, MessageListing } from './chat.aggregation';

// import { ChatListingAggregation, ChatUserAggregation } from './chat.aggregation';
// import { AgoraService } from 'src/agora/agora.service';
import { UsersService } from 'src/users/users.service';
import { SocketDisConnect } from 'src/auth/auth.guards';
import { CommonServices } from 'src/common/common.services';
@Module({
    providers: [ChatGateway, ChatServices, ChatAggregation, MessageListing, 
        UsersService, 
        //UserAggregation, 
        SocketDisConnect,
        // AgoraService,
        CommonServices
    ],
    controllers: [ChatController]
})
export class ChatModule { }
