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
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { Types, set } from 'mongoose';
import { ModelService } from 'src/model/model.service';
import { Unauthorized } from 'src/handler/error.services';

interface CustomSocket extends Socket {
  user: any;
}

let response = {
  message: '',
  connection_id:'',
  data: null,
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(SocketGuard)
export class ChatServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // private connectedClients: Set<string> = new Set<string>();
  constructor(
    public readonly chatservice: ChatService,
    private userservices: UsersService,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(socket: CustomSocket) {
    try {
      const token: any = socket.handshake.headers.token;
      let Bearer_token = token.split(' ')[1];
      let update = await this.chatservice.updateUserSocketid(Bearer_token, socket?.id, true);
      if (!update) {
        throw new Error('unauthorized!')
      }
      socket.emit('connected', 'Socket connected');
    } catch (error) {
       socket.emit('error', error.message);
        socket.disconnect(true)
    }
  }

  async handleDisconnect(socket: CustomSocket) {
    try {
      console.log("handle disconnect run")
      const token: any = socket.handshake.headers.token;
      let Bearer_token = token.split(' ')[1];
      this.chatservice.updateUserSocketid(Bearer_token, socket?.id, false);
      // this.server.emit('disconnected', 'Socket disconnected');
      socket.emit('disconnected', 'Socket disconnected');
    } catch (error) {
      socket.emit('error', error.message)
      return error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('create_connection')
  async handleCreateConnection(
    socket: CustomSocket,
    payload: dto.create_connection,
  ) {
    try {
      console.log("create_connection")
      const user_id = socket.user.id; //sent_by
      let { sent_to, group_id } = payload;
      response.data = await this.chatservice.checkConnection(user_id, payload);
      response.connection_id = response.data.connection_id
      socket.emit('create_connection', response);
    } catch (error) {
      socket.emit('error', error.message)
      return error
    }
  
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(socket: CustomSocket, payload: dto.sendMessage) {
    try {
      console.log('socket called send_message-->', payload);
      const user_id = socket.user.id;
      let { connection_id } = payload;
      let get_connection = await this.chatservice.get_connection(connection_id);
      let socket_ids =
        await this.chatservice.get_socket_id_by_connection(connection_id, user_id);
      let data = await this.chatservice.saveMessage(
        user_id,
        payload,
        get_connection,
      );
      response.data = data;
      response.connection_id = connection_id;
      console.log('get_message', response.data);
      this.server.to(socket_ids).emit('get_message', response);
      let tokens = await this.chatservice.get_tokens(connection_id, user_id);
      let push_data = {
        title: 'Recieved a message',
        body: `${data.sent_by.first_name} ${data.sent_by.last_name} sent a message`,
        last_message: `${data.connection_id.last_message}`,
        connection_id: connection_id,
        profile_pic:`${data.sent_by.profile_pic}`,
        sent_by: user_id,
      };
      console.log("tokens", tokens)
      if (tokens.length > 0) {
        await this.chatservice.send_push(push_data, tokens);
      }
      return;
    } catch (error) {
      console.log(error);
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('list_connection')
  async handleUserList(socket: any, payload:dto.list_connection) {
    try {
      console.log('socket called ===>  list_conneciton');
      const user_id = socket.user.id;
      response.data = await this.chatservice.getUserConnections(user_id, payload);
      socket.emit('list_connection', response)
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('get_all_message')
  async handleAllMessage(socket: CustomSocket, payload: dto.join_connection) {
    try {
      console.log('socket called ===>get_all_message', payload);
      let { connection_id } = payload;
      const user_id = socket.user.id;
      response.data = await this.chatservice.getAllMessage(
        payload,
        null,
        user_id,
      );
      response.connection_id = connection_id;
      console.log(
        '🚀 ~ ChatServiceGateway ~ handleAllMessage ~ response:',
        response,
      );
      // this.server.to(socket.id).emit('get_all_message', response);
      socket.emit('get_all_message', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('deliver_message')
  async handleDeliverMessage(socket: CustomSocket, payload: dto.deliver_message) {
    try {
      console.log('socket called ===>deliver_message', payload);
      const user_id = socket.user.id;
      let { message_id } = payload;
      let data = await this.chatservice.deliverMessage(user_id, payload);
      if (data) {
        let { connection_id } = data;
        response.data = data;
        response.connection_id = connection_id;
        let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id, user_id);
        this.server.to(socket_ids).emit('deliver_message', response);
      }
      console.log(data);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('read_message')
  async handleReadMessage(socket: CustomSocket, payload: dto.readMessage) {
    try {
      console.log('socket called ===>read_message', payload);
      const user_id = socket.user.id;
      let { message_id } = payload;
      let data = await this.chatservice.readMessage(user_id, payload);
      console.log(data);
      if (data) {
        let { connection_id } = data;
        response.data = data;
        response.connection_id = connection_id;
        let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id, user_id);
       this.server.to(socket_ids).emit('read_message', response);
      }
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  

  @UseGuards(SocketGuard)
  @SubscribeMessage('leave_connection')
  async handleLeaveChat(socket: CustomSocket, payload: dto.join_connection) {
    try {
      console.log('socket called ===>leave_connection', payload);
      const user_id = socket.user.id;
      const user_name = socket.user.name;
      let { connection_id } = payload;
      let socket_ids =
        await this.chatservice.get_socket_id_by_connection(connection_id, user_id);
      await this.chatservice.leaveConnection(connection_id, user_id);
      response.message = `${user_name} left the group`;
      response.connection_id = connection_id;
      this.server.to(socket_ids).emit('leave_connection', response);
      response.message = `leave chat successfully`;
      socket.emit('leave_connection', response);
      console.log(
        '🚀 ~ ChatServiceGateway ~ handleLeaveChat ~ response:',
        response,
      );
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('delete_message')
  async handleDeleteMessage(socket: CustomSocket, payload: dto.deleteMessage) {
    try {
      console.log('socket called ===>delete_message', payload);
      const user_id = socket.user.id;
      let data = await this.chatservice.deleteMessage(user_id, payload);
      response.message = data.message;
      response.connection_id = data.connection_id;
      console.log(
        '🚀 ~ ChatServiceGateway ~ handleDeleteMessage ~ response:',
        response,
      );
     socket.emit('delete_message', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('is_typing')
  async handleTyping(socket: CustomSocket, payload: dto.join_connection) {
    try {
      console.log('socket called ===>is_typing', payload);
      let query = { _id: new Types.ObjectId(socket.user.id) };
      let projection = { first_name: 1, last_name: 1 };
      let options = { lean: true };
      let user_data = await this.userservices.getUserData(
        query,
        projection,
        options,
      );
      let user_name = `${user_data.first_name} ${user_data.last_name}`;
      let { connection_id } = payload;
      let socket_ids =
        await this.chatservice.get_socket_id_by_connection(connection_id, socket.user.id);
      response.message = `${user_name} is typing`;
      response.connection_id = connection_id;
      this.server.to(socket_ids).emit('is_typing', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('group_add_member')
  async group_add_member(socket: CustomSocket, payload: dto.addGroupMember) {
    try {
      console.log('socket called ===>group_add_member', payload);
      const user_id = socket.user.id;
      let { group_id, members } = payload;
      let data = await this.chatservice.addGroupMember(
        group_id,
        payload,
        user_id,
      );
      let { connection_id } = payload;
      let socket_ids =
        await this.chatservice.get_socket_id_by_connection(connection_id, user_id);
      response.data = data;
      response.connection_id = connection_id;
      response.message = `New members added`
      this.server.to(socket_ids).emit('group_member_added', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }


  @UseGuards(SocketGuard)
  @SubscribeMessage('mute_unmute')
  async mute_unmute(socket: CustomSocket, payload: dto.mute_connection_skt) {
    try {
      console.log('socket called ===>mute_unmute', payload);
      const user_id = socket.user.id;
      let { connection_id, mute_upto } = payload;
    
      let data = await this.chatservice.mute_unmute(
       user_id, connection_id, payload
      );
      response.message = data.message;
      response.connection_id = connection_id;
      socket.emit('mute_unmute', data);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('add_pins')
  async add_pin_items(socket: CustomSocket, payload: dto.add_pin_items) {
    try {
      console.log('socket called ===>add_pins', payload);
      const user_id = socket.user.id;
      let { connection_id, message_id } = payload;
      
      let data = await this.chatservice.add_pin_items(
       user_id, connection_id, message_id
      );
      response.data = data;
      response.message = 'Pinned successfully';
      response.connection_id = connection_id;
      socket.emit('add_pins', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('remove_pins')
  async remove_pin_items(socket: CustomSocket, payload: dto.add_pin_items) {
    try {
      console.log('socket called ===>remove_pins', payload);
      const user_id = socket.user.id;
      let { connection_id, message_id } = payload;
      
      let data = await this.chatservice.remove_pin_items(
       user_id, connection_id, message_id
      );
      response.data = data;
      response.message = 'Pin Removed';
      response.connection_id = connection_id;
      socket.emit('remove_pins', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('get_pins')
  async get_pin_items(socket: CustomSocket, payload: dto.get_pin_items) {
    try {
      console.log('socket called ===>get_pins', payload);
      const user_id = socket.user.id;
      let { connection_id , pagination, limit} = payload;
  
      let data = await this.chatservice.get_pin_items(
       connection_id, {pagination, limit}
      );
      response.message = "get_pins"
      response.data = data;
      response.connection_id = connection_id;
      socket.emit('get_pins', response);
    } catch (error) {
      socket.emit('error', error.message)
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('start_call')
  async start_call(socket: CustomSocket, payload: dto.start_call) {
    try {
      const user_id = socket.user.id;
      let {  users_ids, type, connection_id  } = payload;
 
      let data:any  = await this.chatservice.start_call(
        user_id, payload
      );
      response.data = data;
      response.connection_id = connection_id;
      socket.emit('start_call', response)
    } catch (error) {
      socket.emit('error', error.message)
       throw error
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('join_call')
  async join_call(socket: CustomSocket, payload: dto.join_call) {
    try {
      const user_id = socket.user.id;
     
      let data:any = await this.chatservice.join_call(user_id, payload.call_id);
      response.data = data;
      response.connection_id = data.connection_id;
      socket.emit('join_call', response);
    } catch (error) {
      socket.emit('error', error.message)
       throw error
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('leave_call')
  async end_call(socket: CustomSocket, payload: dto.join_call) {
    try {
      const user_id = socket.user.id;
      
      let data :any =  await this.chatservice.end_call(user_id, payload.call_id)
      response.message = data?.call_ended ? 'end call' : 'leave call';
      response.data = data;
      response.connection_id = data.connection_id;
      if (data?.call_ended) {
        socket.emit('end_call', response)
      }
      socket.emit('leave_call', response);
    } catch (error) {
      socket.emit('error', error.message)
       throw error
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('call_detail')
  async call_detail(socket: CustomSocket, payload: dto.call_detail) {
    try {
      const user_id = socket.user.id;
      let data = await this.chatservice.call_detail(user_id, payload.call_id);
      response.data = data;
      response.connection_id;
      socket.emit('call_detail', response);
    } catch (error) {
      socket.emit('error', error.message)
       throw error
    }
  }


}
