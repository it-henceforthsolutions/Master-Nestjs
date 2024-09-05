import { UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketGuard } from 'src/auth/auth.guards';
import * as dto from './dto';
import { ChatService } from 'src/chat/chat.service';
import { UsersService } from 'src/users/users.service';
import {  Types } from 'mongoose';
import { chat_emitter as emitter} from './chat.message';
import { chat_listener as listner } from './chat.message';
import { Unauthorized } from 'src/handler/error.services';

interface CustomSocket extends Socket {
  user: any;
}

let response = {
  message: '',
  connection_id: '',
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
  constructor(
    public readonly chatservice: ChatService,
    private userservices: UsersService,
  ) {}
  @WebSocketServer()
  server: Server;
  async handleConnection(socket: CustomSocket) {
    try {
      const token: any = socket.handshake.headers.token;
      let Bearer_token = token?.split(' ')[1];
      if (!Bearer_token) throw new Error('Invalid Token check Bearer');
      let update_user = await this.chatservice.updateUserSocket(
        Bearer_token,
        true,
      );
      if (!update_user) {
         throw new Unauthorized()
      }
      if (update_user._id) {
        let fetch_connections = await this.chatservice.fetch_user_connections(
          update_user._id,
        );
        fetch_connections.forEach((connection: any) =>
          socket.join(connection._id.toString())
        );
      }
      socket.emit(emitter.connected, 'Socket connected');
    } catch (error) {
      socket.emit('error', error.message);
      socket.disconnect(true);
    }
  }

  async handleDisconnect(socket: CustomSocket) {
    try {
      const token:any = socket.handshake.headers.token;
      let Bearer_token = token.split(' ')[1];
      await this.chatservice.updateUserSocket(Bearer_token, false);
      socket.emit(emitter.disconnected, 'Socket disconnected');
      socket.disconnect();
    } catch (error) {
      socket.emit(emitter.error, error.message);
      return error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.create_connection)
  async handleCreateConnection(
    socket: CustomSocket,
    payload: dto.create_connection,
  ) {
    try {
      console.log('create_connection');
      const user_id = socket.user.id; //sent_by
      let { sent_to, group_id } = payload;
      let fetch_data = await this.chatservice.checkConnection(user_id, payload);
      response.connection_id = fetch_data.connection_id;
      response.data = fetch_data.data;
      socket.emit(emitter.create_connection, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
      return error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.send_message)
  async handleSendMessage(socket: CustomSocket, payload: dto.sendMessage) {
    try {
      const user_id = socket.user.id;
      let { connection_id } = payload;
      let get_connection = await this.chatservice.get_connection(connection_id);
      let data = await this.chatservice.saveMessage(
        user_id,
        payload,
        get_connection,
      );
      response.data = data;
      response.connection_id = connection_id;
      // socket.to(connection_id).emit('get_message', response);   //to all except sender
      this.server.to(connection_id).emit(emitter.get_message, response); // to all with sender
      let tokens = await this.chatservice.get_tokens(connection_id, user_id);
      if (tokens.length > 0) {
        let push_data = {
          title: 'Recieved a message',
          body: `${data?.sent_by?.first_name} ${data?.sent_by?.last_name} sent a message`,
          last_message: `${data.connection_id?.last_message}`,
          connection_id: connection_id,
          profile_pic: `${data.sent_by?.profile_pic}`,
          sent_by: user_id,
        };
        // await this.chatservice.send_push(push_data, tokens);
      }
      //  return;
    } catch (error) {
      console.log(error);
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.list_connection)
  async handleUserList(socket: any, payload: dto.list_connection) {
    try {
      const user_id = socket.user.id;
      response.data = await this.chatservice.getUserConnections(
        user_id,
        payload,
      );
      socket.emit(emitter.list_connection, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.get_all_message)
  async handleAllMessage(socket: CustomSocket, payload: dto.get_all_message) {
    try {
      let { connection_id, pagination, limit } = payload;
      const user_id = socket.user.id;
      response.data = await this.chatservice.getAllMessage(
        { connection_id },
        { pagination, limit },
        user_id,
      );
      response.connection_id = connection_id;
      socket.emit(emitter.get_all_message, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.deliver_message)
  async handleDeliverMessage(
    socket: CustomSocket,
    payload: dto.deliver_message,
  ) {
    try {
      const user_id = socket.user.id;
      let data = await this.chatservice.deliverMessage(user_id, payload);
      if (data) {
        let { connection_id } = data;
        response.data = data;
        response.connection_id = connection_id;
        socket.emit(emitter.deliver_message, response);
      }
      console.log(data);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.read_message)
  async handleReadMessage(socket: CustomSocket, payload: dto.readMessage) {
    try {
      const user_id = socket.user.id;
      let data = await this.chatservice.readMessage(user_id, payload);
      console.log(data);
      if (data) {
        let { connection_id } = data;
        response.data = data;
        response.connection_id = connection_id;
        socket.emit(emitter.read_message, response);
      }
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }


  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.clear_chat)
  async handleClearChat(socket: CustomSocket, payload: dto.join_connection) {
    try {
      const user_id = socket.user.id;
      let { connection_id } = payload;
      await this.chatservice.clearChat(connection_id, user_id);
      response.connection_id = connection_id;
      response.message = `clear chat successfully`;
      socket.emit(emitter.clear_chat, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.edit_message)
  async handleEditMessage(socket: CustomSocket, payload: dto.editMessage) {
    try {
   
      const user_id = socket.user.id;
      let data:any = await this.chatservice.editMessage(user_id, payload);
      response.connection_id = data.connection_id;
      response.data = data;
      socket.to(data.connection_id.toString()).emit(emitter.edit_message, response);
      response.message = "Message edited successfully";
      socket.emit(emitter.edit_message, response)
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.delete_message)
  async handleDeleteMessage(socket: CustomSocket, payload: dto.deleteMessage) {
    try {
      const user_id = socket.user.id;
      let message_data = await this.chatservice.deleteMessage(user_id, payload);
      
      response.connection_id = message_data.connection_id;
      response.data = { message_id: message_data._id };
      if (message_data.is_deleted) {
        socket.to(message_data.connection_id.toString()).emit(emitter.delete_message,response)
      }
      response.message = "Message deleted successfully";
      socket.emit(emitter.delete_message, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.is_typing)
  async handleTyping(socket: CustomSocket, payload: dto.join_connection) {
    try {
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
      response.message = `${user_name} is typing`;
      response.connection_id = connection_id;
      socket.to(connection_id).emit(emitter.is_typing, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.group_add_member)
  async group_add_member(socket: CustomSocket, payload: dto.addGroupMember) {
    try {
      const user_id = socket.user.id;

      let { group_id } = payload;
      let data = await this.chatservice.addGroupMember(
        group_id,
        payload,
        user_id,
      );
      let { connection_id, user_data, saved_message, member_added } = data
      response.connection_id = connection_id;
      response.message = `${user_data?.first_name} is added ${member_added} new Member`;
      socket.to(data.connection_id.toString()).emit(listner.group_add_member, response);
      socket.to(connection_id).emit(emitter.get_message, { data: data.saved_message, connection_id: connection_id } );
      response.message = `You added ${member_added} new Member`
      socket.emit(listner.group_add_member, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.leave_connection)
  async handleLeaveChat(socket: CustomSocket, payload: dto.join_connection) {
    try {
      const user_id = socket.user.id;
      const user_name = socket.user.name;
      let { connection_id } = payload;
      let data = await this.chatservice.leaveConnection(connection_id, user_id);
      response.message = `${user_name} left the chat`;
      response.connection_id = connection_id;
      socket.to(connection_id).emit(emitter.leave_connection, response);
      socket.to(connection_id).emit(emitter.get_message, { data: data, connection_id: connection_id} );
      response.message = `leave chat successfully`;
      socket.emit(emitter.leave_connection, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.leave_connection)
  async handleRemoveMember(socket: CustomSocket, payload: dto.remove_member) {
    try {
      const user_id = socket.user.id;
      const user_name = socket.user.name;
      let { group_id, member_id } = payload;
      let data = await this.chatservice.remove_member(group_id, user_id, member_id)
      let { connection_id, saved_message, message } = data
      response.message = message
      response.connection_id = connection_id;
      socket.to(connection_id).emit(emitter.leave_connection, response);
      socket.to(connection_id).emit(emitter.get_message, { data: saved_message, connection_id } );
      response.message = `leave chat successfully`;
      socket.emit(emitter.leave_connection, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }



  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.mute_unmute)
  async mute_unmute(socket: CustomSocket, payload: dto.mute_connection_skt) {
    try {
      const user_id = socket.user.id;
      let { connection_id, mute_upto } = payload;

      let data = await this.chatservice.mute_unmute(
        user_id,
        connection_id,
        payload,
      );
      response.message = data.message;
      response.connection_id = connection_id;
      socket.emit(emitter.mute_unmute, data);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.add_pins)
  async add_pin_items(socket: CustomSocket, payload: dto.add_pin_items) {
    try {
      const user_id = socket.user.id;
      let { connection_id, message_id } = payload;

      let data = await this.chatservice.add_pin_items(
        user_id,
        connection_id,
        message_id,
      );
      response.data = data;
      response.message = 'Pinned successfully';
      response.connection_id = connection_id;
      socket.emit(emitter.add_pins, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.remove_pins)
  async remove_pin_items(socket: CustomSocket, payload: dto.remove_pin_items) {
    try {
      const user_id = socket.user.id;
      let { pin_id } = payload;

      let data:any = await this.chatservice.remove_pin_items(
        user_id,
        pin_id
      );
      response.message = 'Pin removed successfully';
      response.connection_id = data?.connection_id
      socket.emit(emitter.remove_pins, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.get_pins)
  async get_pin_items(socket: CustomSocket, payload: dto.get_pin_items) {
    try {
      const user_id = socket.user.id;
      let { connection_id, pagination, limit } = payload;
      let data = await this.chatservice.get_pin_items(connection_id, {
        pagination,
        limit,
      });
      response.data = data;
      response.connection_id = connection_id;
      socket.emit(emitter.get_pins, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.start_call)
  async start_call(socket: CustomSocket, payload: dto.start_call) {
    try {
      const user_id = socket.user.id;
      let { users_ids, type, connection_id } = payload;
      let data: any = await this.chatservice.start_call(user_id, payload);
      response.data = data;
      response.connection_id = connection_id;
      socket.emit(emitter.start_call, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
      throw error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.join_call)
  async join_call(socket: CustomSocket, payload: dto.join_call) {
    try {
      const user_id = socket.user.id;
      let data: any = await this.chatservice.join_call(
        user_id,
        payload.call_id,
      );
      response.data = data;
      response.connection_id = data.connection_id;
      socket.emit(emitter.join_call, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
      throw error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.leave_call)
  async end_call(socket: CustomSocket, payload: dto.join_call) {
    try {
      const user_id = socket.user.id;

      let data: any = await this.chatservice.end_call(user_id, payload.call_id);
      response.message = data?.call_ended ? 'end call' : 'leave call';
      response.data = data;
      response.connection_id = data.connection_id;
      if (data?.call_ended) {
        socket.emit('end_call', response);
      }
      socket.emit('leave_call', response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
      throw error;
    }
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage(listner.call_detail)
  async call_detail(socket: CustomSocket, payload: dto.call_detail) {
    try {
      const user_id = socket.user.id;
      let data = await this.chatservice.call_detail(user_id, payload.call_id);
      response.data = data;
      response.connection_id;
      socket.emit(emitter.call_detail, response);
    } catch (error) {
      socket.emit(emitter.error, error.message);
      throw error;
    }
  }

  // @UseGuards(SocketGuard)
  // @SubscribeMessage('create_stream')
  // async create_stream(socket: CustomSocket, payload:dto.create_stream) {
  //   try {
  //     const user_id = socket.user.id;
  //     let data:any  = await this.chatservice.create_stream(
  //       user_id, payload
  //     );
  //     response.data = data;
  //     response.message = "Stream created"
  //     socket.emit('create_stream', response)
  //   } catch (error) {
  //     socket.emit('error', error.message)
  //      throw error
  //   }
  // }

  // @UseGuards(SocketGuard)
  // @SubscribeMessage('join_stream')
  // async start_stream(socket: CustomSocket, payload: dto.join_stream) {
  //   try {
  //     const user_id = socket.user.id;
  //     let { stream_id  } = payload;

  //     let data:any  = await this.chatservice.join_stream(
  //       user_id, payload
  //     );
  //     let user_data = await this.chatservice.get_user_data(user_id)
  //     let user_list = await this.chatservice.list_joined_user(data.joined_by)
  //       response.data = {
  //         user: user_data,
  //         stream: data,
  //         user_list: user_list
  //       };
  //     let socket_ids = await this.chatservice.getUsersSocketIds(data.joined_by)
  //     socket.to(connection_id).emit('join_stream',response)
  //     socket.emit('join_stream', response)
  //   } catch (error) {
  //     socket.emit('error', error.message)
  //      throw error
  //   }
  // }

  // @UseGuards(SocketGuard)
  // @SubscribeMessage('leave_stream')
  // async leave_stream(socket: CustomSocket, payload: dto.leave_stream) {
  //   try {
  //     const user_id = socket.user.id;
  //     let { stream_id } = payload;

  //     let data:any  = await this.chatservice.leave_stream(
  //       user_id, payload
  //     );
  //     let user_data = await this.chatservice.get_user_data(user_id)
  //     let user_list = await this.chatservice.list_joined_user(data.joined_by)
  //     response.data = {
  //       user: user_data,
  //       stream: data,
  //       user_list: user_list
  //     };
  //     let socket_ids = await this.chatservice.getUsersSocketIds(data.joined_by)
  //     this.server.to(socket_ids).emit('leave_stream', response);
  //     //socket.emit('leave_stream', response)
  //   } catch (error) {
  //     socket.emit('error', error.message)
  //      throw error
  //   }
  // }

  // @SubscribeMessage('list_stream')
  // async list_stream(socket: CustomSocket, payload: dto.paginationsortsearch) {
  //   try {
  //     let fetch_data = await this.chatservice.list_stream(payload);
  //     response.data = fetch_data;
  //     socket.emit('list_stream',response)
  //   } catch (error) {
  //     socket.emit('error', error.message)
  //      throw error
  //   }
  // }

  // @SubscribeMessage("joinned_stream")
  // async joinned_stream(socket: CustomSocket) {
  //   try {
  //     const user_id = socket.user.id;
  //     let fetch_data = await this.chatservice.check_joined_stream(user_id);
  //     response.data = fetch_data;
  //     socket.emit('joinned_stream', response)
  //   } catch (error) {
  //     socket.emit('error', error.message)
  //      throw error
  //   }
  // }
}
