import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { UseGuards } from '@nestjs/common';
import { SocketGuard } from 'src/auth/auth.guards';
import * as dto from "./dto"
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { Types, set } from 'mongoose';




interface CustomSocket extends Socket {
   user: any;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})


@UseGuards(SocketGuard)
export class ChatServiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    // private connectedClients: Set<string> = new Set<string>(); 
    constructor(private readonly chatservice: ChatService,
        private userservices: UsersService) { }
    @WebSocketServer()
    server: Server;

    handleConnection(socket: CustomSocket) {      
        const token:any = socket.handshake.headers.token;
        let Bearer_token = token.split(' ')[1];
        this.chatservice.updateUserSocketid(Bearer_token, socket?.id, true)           
        socket.emit('connected', 'Socket connected');
    }

    handleDisconnect(socket: CustomSocket) {
        const token:any = socket.handshake.headers.token;
        let Bearer_token = token.split(' ')[1];
        this.chatservice.updateUserSocketid(Bearer_token, socket?.id, false )           
       // this.server.emit('disconnected', 'Socket disconnected');
        socket.emit('disconnected', 'Socket disconnected');
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('create_connection')
    async handleCreateConnection(socket: CustomSocket, payload: dto.create_connection) {
        const user_id = socket.user.id;  //sent_by
        let { sent_to , group_id } = payload;
        let response = {
            message:"",
            data: null
        }
        response.data =  await this.chatservice.checkConnection(user_id,payload)
        socket.emit("create_connection", response);
    }
    
    @UseGuards(SocketGuard)
    @SubscribeMessage('send_message')
    async handleSendMessage(socket: CustomSocket, payload: dto.sendMessage){
        try {
            const user_id = socket.user.id; 
            let { connection_id } = payload;
            let get_connection = await this.chatservice.get_connection(connection_id)
            let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id)
            let response = {
                message:"",
                data: null
            }
            response.data =  await this.chatservice.saveMessage(user_id, payload , get_connection)
            this.server.to(socket_ids).emit('get_message', response)
            }
        catch (error) {
            console.log(error)
            this.server.to(socket.id).emit('error',error.message)
        }
    }


    @UseGuards(SocketGuard)
    @SubscribeMessage('list_connection')
    async handleUserList(socket: any) {
        try {
            const user_id = socket.user.id;
            let response = {
                message:"",
                data: null
            }
            response.data = await this.chatservice.getUserList(user_id)
            this.server.to(socket.id).emit('list_connection', response)
        } catch (error) {
            this.server.to(socket.id).emit('error',error.message)
        }
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('get_all_message')
    async handleAllMessage(socket: CustomSocket, payload: dto.join_connection) {
        try {
            let { connection_id } = payload
        let response = {
            message:"",
            data: null
        }
        const user_id = socket.user.id;
        response.data = await this.chatservice.getAllMessage(payload, null ,user_id)
        this.server.to(socket.id).emit('get_all_message', response)
        } catch (error) {
            this.server.to(socket.id).emit('error', error.message)
        }
        
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('read_message')
    async handleReadSendMessage(socket: CustomSocket, payload: dto.readMessage) {
        try {
            const user_id = socket.user.id;
            let { message_id } = payload;
           
            let response:any = {
                message:"",
                data: null
            }
            let data = await this.chatservice.readMessage(user_id, payload)
            console.log(data)
            let { connection_id } = data
            response.data = data
            let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id)
            this.server.to(socket_ids).emit('read_message', response)
        } catch (error) {
            this.server.to(socket.id).emit('error', error.message)
        }
    
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('leave_connection')
    async handleLeaveChat(socket: CustomSocket, payload: dto.join_connection) {  
       try {
        const user_id =  socket.user.id;
        const user_name = socket.user.name
        let { connection_id } = payload;
        let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id)
        await this.chatservice.leaveConnection(connection_id, user_id)
        let response = { 
             message:"",
              data: null
             }
        response.message= `${user_name} left the group`
        this.server.to(socket_ids).emit('leave_connection', response)
        response.message= `leave chat successfully`
        this.server.to(socket.id).emit('leave_connection', response)
       } catch (error) {
        this.server.to(socket.id).emit('error', error.message)
       }
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('delete_message')
    async handleDeleteMessage(socket: CustomSocket, payload: dto.deleteMessage) {
     try {
        const user_id = socket.user.id;
        await this.chatservice.deleteMessage(user_id, payload)
        let response = {  message:"", data: null }
        response.message = "message deleted successfully"
        this.server.to(socket.id).emit("delete_message",response )
     } catch (error) {
        this.server.to(socket.id).emit('error', error.message)
     }
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('is_typing')
    async handleTyping(socket: CustomSocket, payload: dto.sendMessage) {
         try {
               let query = { _id:new Types.ObjectId(socket.user.id)}
              let projection = { first_name:1, last_name:1 }
              let options = { lean:true }
              let user_data = await this.userservices.getUserData(query,projection, options)
              let user_name = `${user_data.first_name} ${user_data.last_name}`;
              let { connection_id } = payload;
              let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id)
              let response = {  message:"", data: null }
              response.message =`${user_name} is typing`,
              this.server.to(socket_ids).emit('is_typing', response)
         } catch (error) {
          this.server.to(socket.id).emit('error', error.message)
         }
    }

    @UseGuards(SocketGuard)
    @SubscribeMessage('group_add_member')
    async group_add_member(socket:CustomSocket, payload:dto.addGroupMember){
        try {
            const user_id = socket.user.id;
            let { group_id, members }= payload
            let response = {  message:"", data: null }
            let data = await this.chatservice.addGroupMember(group_id, payload, user_id)
            let { connection_id } = payload;
            let socket_ids = await this.chatservice.get_socket_id_by_connection(connection_id)
            response.data= data
            this.server.to(socket_ids).emit('group_member_added', response)
        } catch (error) {
            this.server.to(socket.id).emit('error', error.message) 
        }
       
    }

}
