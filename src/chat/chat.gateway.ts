import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketGuard, SocketDisConnect } from 'src/auth/auth.guards';
import { Types } from 'mongoose';
import { CommonServices } from 'src/common/common.services';
import * as dto from "./dto/index";
import { ChatServices } from './chat.services';
import * as Errors from "../../src/handler/error.services";

import { ChatAggregation } from './chat.aggregation';
interface CustomSocket extends Socket {
    user_data: any; // Add your desired type for user_data property
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@UseGuards(SocketGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;


    constructor(
        private chatService: ChatServices,
        private commonServices: CommonServices,
        private ChatAggregation: ChatAggregation,
        private SocketDisConnect: SocketDisConnect
    ) { }

    async handleConnection(socket: CustomSocket, ...args: any[]) {
        console.log(`socket Connected ${socket.id}`);
        console.log(`Connected ${JSON.stringify(socket.handshake.headers)}`);
        const token = socket?.handshake?.headers?.token;
        let fetch_user = await this.SocketDisConnect.verify_token(token);
        console.log("fetch_user----", fetch_user);
        let { _id: user_id } = fetch_user;
        await this.chatService.update_status_online(user_id)
    }

    async handleDisconnect(socket: CustomSocket) {
        try {
            console.log(`dissconnected Connected ${socket.id}`);
            const token = socket?.handshake?.headers?.token;
            let fetch_user = await this.SocketDisConnect.verify_token(token);
            console.log("fetch_user----", fetch_user);
            let { _id: user_id } = fetch_user;
            await this.chatService.update_lst_seen(user_id)
            await this.chatService.update_status_offline(user_id)
            this.server.emit('disconnected', 'Socket disconnected');
        } catch (err) {
            throw err
        }
    }

    @SubscribeMessage("create_connection")
    async create_connection(socket: Socket | any, dto: dto.create_connection) {
        try {
            let { _id: sent_by } = socket.user_data;
            console.log("dto-------", dto);
            let { sent_to, group_code, chat_type, name, image_url, members } = dto;
            let check_connection = await this.chatService.check_connection(sent_by, sent_to, group_code, chat_type);
            console.log("check_connection------", check_connection);
            let response: any; let connection_id: Types.ObjectId;
            if (check_connection?.length) {
                console.log("check---------");
                connection_id = check_connection[0]._id;
                socket.join(connection_id.toString());
                response = {
                    success: true,
                    message: "Old Connection Now connected to chat server",
                    data: {
                        connection_id: connection_id,
                        sent_to: sent_to,
                        name: check_connection[0].name,
                        image_url: check_connection[0].image_url,
                    }
                }
                socket.emit("create_connection", response);
                // socket.join(connection_id);
                // socket.emit("join_connection", "connectionjoined");
            }
            else if (check_connection?.length == 0 || check_connection == undefined) {
                console.log("make");
                let group_code = await this.commonServices.generateUniqueCode()
                let new_connection = await this.chatService.make_connection(sent_by, sent_to, group_code, chat_type, name, image_url, members);
                connection_id = new_connection._id;
                socket.join(connection_id.toString());
                response = {
                    success: true,
                    message: "New Connection Now connected to chat server",
                    data: {
                        connection_id: connection_id,
                        sent_to: sent_to,
                        name: new_connection.name,
                        image_url: new_connection.image_url,
                    }
                }
                socket.emit("create_connection", response);
                // socket.join(connection_id);
                // socket.emit("join_connection", "connectionjoined");
            }
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("join_connection")
    async join_connection(socket: CustomSocket, dto: dto.join_connection) {
        try {
            let { _id: user_id } = socket.user_data;
            let { connection_id } = dto;
            console.log("user_id------", user_id);
            console.log("connection_id------", dto.connection_id);
            await this.chatService.save_connection(user_id, connection_id);
            let response = {
                message: "Joined Successfully",
                data: {
                    connection_id: connection_id
                }
            }
            socket.join(connection_id);
            socket.emit("join_connection", response);
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("make_group_admin")
    async make_group_admin(socket: CustomSocket, dto: dto.make_admin) {
        try {
            let { _id: user_id } = socket.user_data;
            let { connection_id } = dto;
            console.log("user_id------", user_id);
            // console.log("connection_id------", dto.connection_id);
            await this.chatService.new_admin(user_id, dto);
            let response = {
                message: "User Changed To Admin Successfully",
                data: {
                    connection_id: connection_id
                }
            }
            socket.emit("make_group_admin", response);
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("remove_group_admin")
    async remove_group_admin(socket: CustomSocket, dto: dto.make_admin) {
        try {
            let { _id: user_id } = socket.user_data;
            let { connection_id } = dto;
            await this.chatService.remove_admin(user_id, dto);
            let response = {
                message: "Admin Changed To User Successfully",
                data: {
                    connection_id: connection_id
                }
            }
            socket.emit("remove_group_admin", response);
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("leave_group")
    async leave_group(socket: CustomSocket, dto: dto.join_connection) {
        try {
            let { _id: user_id } = socket.user_data;
            let response = await this.chatService.leave_group(user_id, dto);
            socket.emit("leave_group", response);
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("send_message")
    async send_message(socket: CustomSocket, dto: dto.send_message) {
        try {
            let { _id: user_id, full_name } = socket.user_data;
            let { connection_id } = dto;
            let save_message = await this.chatService.save_message(user_id, dto, full_name);
            let { sent_to } = save_message[0];
            let response = {
                message: "Message Sent Successfully",
                data: save_message[0]
            }
            socket.emit("send_message", response);
            let received_response = {
                message: "message received",
                data: save_message[0]
            }
            if (sent_to) {
                console.log("receive_message");
                socket.to(connection_id).emit("receive_message", received_response)
            }
            else {
                console.log("group_message_received");
                socket.to(connection_id).emit("group_message_received", received_response)
            }
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("broadcast_message")
    async broadcast_message(socket: CustomSocket, dto: dto.broadcast_message) {
        try {
            let { _id: user_id } = socket.user_data;
            console.log("broadcast_message_called", dto);
            let data = await this.chatService.broadcast_message(socket, user_id, dto);
            console.log("broadcast_message_data", data);
            
        }
        catch (err) {
            throw err
        }
    }

    // @SubscribeMessage("broadcast_message")
    // async broadcast_message(socket: CustomSocket, dto: dto.broadcast_message) {
    //     try {
    //         let { _id: user_id } = socket.user_data;
    //         let { users_id } = dto;
    //         let { data, connection_id } = await this.chatService.broadcast_message(user_id, dto);
    //         // for(let i =0; i < users_id.length; i++){
    //         //     socket.join(connection_id)
    //         // }
    //         socket.join(connection_id);
    //         console.log("data", data);
    //         socket.to(connection_id).emit("broadcast_message_received", data)
    //     }
    //     catch (err) {
    //         throw err
    //     }
    // }

    // @SubscribeMessage("broadcast_info")
    // async broadcast_info(socket: CustomSocket, dto: dto.broadcast_info) {
    //     try {
    //         let { _id: user_id } = socket.user_data;
    //         let { connection_id } = dto;
    //         let data = await this.chatService.add_broadcast_info(dto);
    //         let response = {
    //             message: "Group Updated Successfully",
    //             data: {
    //                 connection_id: connection_id
    //             }
    //         }
    //         socket.to(connection_id).emit("broadcast_info", response)

    //     }
    //     catch (err) {
    //         throw err
    //     }
    // }

    @SubscribeMessage("get_all_msg")
    async get_all_msg(socket: CustomSocket, dto: dto.all_message) {
        try {
            let { connection_id } = dto;
            let fetch_messages = await this.chatService.all_msg(connection_id);
            console.log("fetch_messages", fetch_messages);
            this.server.to(connection_id).emit("get_all_msg", fetch_messages)
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("read_message")
    async read_message(socket: CustomSocket, dto: dto.read_message) {
        try {
            let { _id: user_id } = socket.user_data;
            let response = await this.chatService.read_message(user_id, dto.message_id);
            socket.emit("read_message", response[0])
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("is_typing")
    async is_typing(socket: CustomSocket, dto: dto.is_typing) {
        try {
            let { _id: user_id } = socket.user_data;
            let { connection_id } = dto;
            let response = await this.chatService.is_typing(user_id, dto);
            this.server.to(connection_id).emit("is_typing", response)
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage("unread_message")
    async unread_message(socket: CustomSocket, dto: dto.read_message) {
        try {
            let { _id: user_id } = socket.user_data;
            let data = await this.chatService.unread_message(user_id, dto);
            let response = {
                message: "Message Unread Successfully",
                data: {
                    message_id: data?._id,
                    connection_id: data?.connection_id
                }
            }
            socket.emit("unread_message", response)
        }
        catch (err) {
            throw err
        }
    }

    // @SubscribeMessage("clear_message")
    // async clear_message(socket: CustomSocket, dto: dto.clear_message) {
    //     try {
    //         let { _id: user_id } = socket.user_data;
    //         let data = await this.chatService.clear_message(user_id, dto);
    //         socket.emit("clear_message", data)
    //     }
    //     catch (err) {
    //         throw err
    //     }
    // }

    @SubscribeMessage("delete_message")
    async delete_message(socket: CustomSocket, dto: dto.delete_message) {
        try {
            let data = await this.chatService.delete_message(socket, dto);
            socket.emit("delete_message", data)
        }
        catch (err) {
            throw err
        }
    }

    @SubscribeMessage('leave_chat')
    async leave_chat(socket: CustomSocket, payload: dto.join_connection) {
        let { _id: user_id } = socket.user_data;
        let { connection_id } = payload;
        this.server.to(connection_id).emit('leave_chat', user_id)
        socket.leave(connection_id);
    }


    @SubscribeMessage("add_participants")
    async add_participants(socket: CustomSocket, dto: dto.add_participants) {
        try {
            let { _id: user_id } = socket.user_data;
            let { connection_id } = dto;
            let data = await this.chatService.add_participants(user_id, dto);
            let members = await this.ChatAggregation.members(connection_id)
            this.server.to(connection_id).emit("list_members", members)
        }
        catch (err) {
            throw err
        }
    }

    afterInit() {
        console.log('Native server instance:');
    }
}