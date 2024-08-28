import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { UnauthorizedException, UseGuards } from '@nestjs/common';
  import { SocketGuard } from 'src/auth/auth.guards';
  import * as dto from './dto';
  import { UsersService } from 'src/users/users.service';

  
  interface CustomSocket extends Socket {
    user: any;
  }
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class SocketGateway
  {
    // private connectedClients: Set<string> = new Set<string>();
    constructor(
      private userservices: UsersService,
    ) {}
    @WebSocketServer()
    server: Server;
  
    async socket_data(event: any, response: any) {
      try {
        console.log("event-------", event)
        console.log("response-------", response)
        this.server.emit(event, response)
      }
      catch (err) {
        throw err;
      }
    }
      
    async socket_to(connection_id: any, event: any, response: any) {
        console.log("socket----", connection_id)
        this.server.to(connection_id).emit(event, response);
      }
      
  }
  