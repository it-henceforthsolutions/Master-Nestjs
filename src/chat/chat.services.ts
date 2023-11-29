import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import moment from "moment";
import { Types } from "mongoose";

import * as dto from "./dto/index";
import { CommonServices } from "src/common/common.services";
const moment_tz = require('moment-timezone');
import { Server, Socket } from 'socket.io';
// import { AgoraService } from "src/agora/agora.service";
import { ModelService } from "src/model/model.service";

@Injectable()
export class ChatServices {
    constructor(
        private models: ModelService,
        private commonServices: CommonServices,
        // private agoraService: AgoraService,
    ) { }


    check_connection = async (sent_by: string, sent_to: string, group_code: string, chat_type: string) => {
        try {
            let query: any;
            let response: any
            let projection = { __v: 0 };
            let options = { lean: true };
            if (chat_type == "GROUP" && group_code != null && group_code != undefined && group_code != '') {
                console.log("inside group");
                query = { group_code: group_code }
                // console.log("check_connection----query", query);
                response = await this.models.connections.find(query, projection, options).exec();
            }
            else if (chat_type == "NORMAL") {
                query = {
                    $or: [
                        { $and: [{ sent_by: new Types.ObjectId(sent_by) }, { sent_to: new Types.ObjectId(sent_to) }] },
                        { $and: [{ sent_by: new Types.ObjectId(sent_to) }, { sent_to: new Types.ObjectId(sent_by) }] }
                    ]
                }
                console.log("check_connection----query", query);
                response = await this.models.connections.find(query, projection, options).exec();

            }
            console.log("check_connection----response", response);
            if (response && response?.length) {
                let { members } = response[0];
                let memeber_index = members.findIndex((member) => member._id.toString() === sent_by.toString());
                if (memeber_index == -1) {
                    let arr = {
                        _id: new Types.ObjectId(sent_by),
                        role: "USER"
                    }
                    let update = { $addToSet: { members: arr } }
                    let options = { new: true }
                    await this.models.connections.findOneAndUpdate(query, update, options).exec();
                    // return save_join;
                    // let save_data = {
                    //     sent_to: new Types.ObjectId(sent_by),
                    //     sent_by: new Types.ObjectId(fan_id),
                    //     fan_id: new Types.ObjectId(make_fan?._id),
                    //     type: "FANS"
                    // }
                    // await this.model.notifications.create(save_data);
                }
            }
            return response;
        }
        catch (err) {
            throw err
        }
    }

    make_connection = async (sent_by: string, sent_to: string, group_code: string,
        chat_type: string, name: string, image_url: string, group_members: Array<string>) => {
        try {
            console.log("make_connection");
            let data_to_save: any = (chat_type == "NORMAL")
                ? {
                    sent_by: new Types.ObjectId(sent_by),
                    sent_to: new Types.ObjectId(sent_to),
                    chat_type: chat_type,
                    name: name,
                    image_url: image_url,
                    created_at: moment().utc().valueOf(),
                    updated_at: moment().utc().valueOf(),
                }
                : {
                    group_code: group_code,
                    chat_type: chat_type,
                    name: name,
                    image_url: image_url,
                    group_type: "NORMAL",
                    created_at: moment().utc().valueOf(),
                    updated_at: moment().utc().valueOf(),
                };
            let arr = [
                {
                    _id: new Types.ObjectId(sent_by),
                    role: "SUPER_ADMIN",
                    joined_at: moment().utc().valueOf()
                }
            ]
            data_to_save.members = arr;
            data_to_save.creator_id = new Types.ObjectId(sent_by);
            let response = await this.models.connections.create(data_to_save);
            for (let i = 0; i < group_members?.length; i++) {
                let arr = { _id: new Types.ObjectId(group_members[i]), role: "USER", joined_at: moment().utc().valueOf() }
                let update = { $addToSet: { members: arr } }
                let new_query = { _id: new Types.ObjectId(response._id) }
                let options = { new: true }
                await this.models.connections.findOneAndUpdate(new_query, update, options);
                let data: any = {
                    sent_by: new Types.ObjectId(sent_by),
                    sent_to: new Types.ObjectId(group_members[i]),
                    connection_id: new Types.ObjectId(response._id),
                    notification_type: "GROUP",
                    message: `added to group ${name}`,
                    created_at: moment().utc().valueOf()
                }
                await this.models.invitations.create(data);
                data.type = "GROUP";
                await this.models.notifications.create(data);
                let tokens = await this.commonServices.fetch_tokens(group_members[i]);
                let invite_data = { title: "GROUP", subject: "GROUP created" }
                await this.commonServices.send_push(tokens, invite_data)
            }
            return response;
        }
        catch (err) {
            throw err
        }
    }

    save_connection = async (user_id: string, connection_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(connection_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetch_connection = await this.models.connections.find(query, projection, options).exec();
            if (fetch_connection?.length) {
                let { members } = fetch_connection[0];
                let memeber_index = members.findIndex((member) => member._id.toString() === user_id);
                if (memeber_index == -1) {
                    let arr = {
                        _id: new Types.ObjectId(user_id),
                        role: "USER"
                    }
                    let update = { $addToSet: { members: arr } }
                    let options = { new: true }
                    await this.models.connections.findOneAndUpdate(query, update, options).exec();
                    // return save_join;
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    new_admin = async (user_id: string, data: dto.make_admin) => {
        try {
            let { connection_id, user_id: new_admin_id } = data;
            let query = { user_id: new Types.ObjectId(user_id), connection_id: new Types.ObjectId(connection_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetch_connection = await this.models.connections.find(query, projection, options).exec();
            if (!fetch_connection && !fetch_connection?.length) throw new HttpException("No connection found", HttpStatus.NOT_FOUND);
            else if (fetch_connection && fetch_connection?.length) {
                let { members } = fetch_connection[0];
                let admin_id_index = members.findIndex((member) => member._id.toString() === new_admin_id);
                if (admin_id_index !== -1) {
                    members[admin_id_index].role = "ADMIN";
                    let update = { members: members }
                    let new_options = { new: true }
                    let update_member = await this.models.connections.findOneAndUpdate(query, update, new_options).exec();
                    return update_member;
                }
                else {
                    throw new HttpException("Member not found", HttpStatus.NOT_FOUND);
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    remove_admin = async (user_id: string, data: dto.make_admin) => {
        try {
            let { connection_id, user_id: admin_id } = data;
            let query = { connection_id: new Types.ObjectId(connection_id), creator_id: new Types.ObjectId(user_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetch_connection = await this.models.connections.find(query, projection, options).exec();
            if (fetch_connection?.length) {
                let { members } = fetch_connection[0];
                let admin_id_index = members.findIndex((member) => member._id.toString() === admin_id);
                if (admin_id_index !== -1) {
                    members[admin_id_index].role = "USER";
                    let update = { members: members }
                    let new_options = { new: true }
                    let update_member = await this.models.connections.findOneAndUpdate(query, update, new_options).exec();
                    return update_member
                }
                else {
                    throw new HttpException("Group member not found", HttpStatus.NOT_FOUND);
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    leave_group = async (user_id: string, data: dto.join_connection) => {
        try {
            let { connection_id } = data;
            console.log("user_id----", user_id);
            console.log("leave_group_connection_id----", connection_id);

            let query = { _id: new Types.ObjectId(connection_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let fetch_connection = await this.models.connections.find(query, projection, options);
            console.log("leave_group_fetch_connection----", fetch_connection);
            if (fetch_connection?.length) {
                let { creator_id } = fetch_connection[0];
                if (user_id.toString() != creator_id.toString()) {
                    let update = { $pull: { members: { _id: new Types.ObjectId(user_id) } } }
                    await this.models.connections.findOneAndUpdate(query, update, { new: true });
                    let response = {
                        message: "Group Left Successfully"
                    }
                    return response;
                }
                if (user_id.toString() == creator_id.toString()) {
                    let new_options = { new: true }
                    let update = { $pull: { members: { _id: new Types.ObjectId(user_id) } } }
                    let update_member:any = await this.models.connections.findOneAndUpdate(query, update, new_options);
                    if (update_member.members.length) {
                        let new_query = {
                            _id: new Types.ObjectId(connection_id),
                            members: { $elementMatch: { _id: update_member.members[0]._id } }
                        }
                        let update = {
                            $set: {
                                creator_id: new Types.ObjectId(update_member.members[0]._id),
                                "members.$.role": "SUPER_ADMIN"
                            }
                        }
                        await this.models.connections.findOneAndUpdate(new_query, update, new_options)
                        let response = {
                            message: "Group Left Successfully"
                        }
                        return response;
                    }

                }
            }
            else {
                throw new HttpException("Sorry this is not a valid object _id", HttpStatus.BAD_REQUEST);
            }
        }
        catch (err) {
            throw err
        }
    }

    save_message = async (sent_by: string, data: dto.send_message, full_name: string) => {
        try {
            let { connection_id, sent_to, message, type, media_url, message_type, lat, long, time_zone } = data;
            console.log("save_message----data", data);
            let query = { _id: new Types.ObjectId(connection_id) }
            let update = { $pull: { deleted_for: new Types.ObjectId(sent_by) } }
            let options = { lean: true }
            await this.models.connections.findOneAndUpdate(query, update, options)
            let save_data = {
                sent_by: new Types.ObjectId(sent_by),
                sent_to: !sent_to ? null : new Types.ObjectId(sent_to),
                connection_id: new Types.ObjectId(connection_id),
                message,
                media_url,
                type,
                lat,
                long,
                message_type,
                created_at: moment().utc().valueOf()
            }
            let save_message:any = await this.models.messages.create(save_data);
            let { _id: msg_id } = save_message;
            let response = await this.msg_response(msg_id);
            let last_msg = message;
            let projection = { __v: 0 }
            if (sent_to) {
                let query = { block_by: sent_to, block_to: sent_by }
                let check_user = await this.models.blocks.findOne(query, projection, options);
                if (check_user) {
                    let new_query = { _id: new Types.ObjectId(save_message._id) }
                    let update = { $push: { deleted_for: new Types.ObjectId(sent_to) } }
                    await this.models.messages.findOneAndUpdate(new_query, update, options);
                }
                else {
                    let msg = `${full_name} sent you a message`
                    let new_data = {
                        sent_to: new Types.ObjectId(sent_to),
                        sent_by: new Types.ObjectId(sent_by),
                        message_id: new Types.ObjectId(msg_id),
                        type: "MESSAGE",
                        message: msg
                    }
                    await this.models.notifications.create(new_data);
                    let tokens = await this.commonServices.fetch_tokens(sent_to);
                    let notification_data = { title: "message", type: "message", message: msg }
                    await this.commonServices.send_push(tokens, notification_data)
                }
            }
            else {
                let msg = `${full_name} sent a message`
                let connection_query = { _id: new Types.ObjectId(connection_id) }
                let fetch_connection:any = await this.models.connections.findOne(connection_query, projection, options);
                let { members, muted_by } = fetch_connection;
                if (members && members.length) {
                    let len = members.length;
                    for (let i = 0; i < len; i++) {
                        let { _id: user_id } = members[i];
                        let check_user = true
                        if (muted_by && muted_by.length) {
                            let user = muted_by.find(data => JSON.stringify(data._id) == JSON.stringify(user_id))
                            let current_time = moment_tz().tz(time_zone).toDate();
                            if (user && user.time < current_time) { check_user = false }
                        }
                        if (check_user && JSON.stringify(sent_by) !== JSON.stringify(user_id)) {
                            let new_data = {
                                sent_to: new Types.ObjectId(user_id),
                                sent_by: new Types.ObjectId(sent_by),
                                message_id: new Types.ObjectId(msg_id),
                                type: "MESSAGE",
                                message: msg
                            }
                            await this.models.notifications.create(new_data);
                            let tokens = await this.commonServices.fetch_tokens(user_id);
                            let notification_data = { title: "message", type: "messaeg", message: msg }
                            await this.commonServices.send_push(tokens, notification_data)
                        }

                    }
                }
            }
            if (type == "FORWARDED" && message_type == "TEXT") {
                last_msg = "forwarded message";
            }
            else if (type == "NORMAL" && message_type == "IMAGE") {
                last_msg = "image";
            }
            else if (type == "NORMAL" && message_type == "AUDIO") {
                last_msg = "audio";
            }
            else if (type == "NORMAL" && message_type == "VIDEO") {
                last_msg = "video";
            }
            else if (type == "NORMAL" && message_type == "DOCUMENT") {
                last_msg = "document";
            }
            await this.update_last_msg(connection_id, last_msg);
            return response
        }
        catch (err) {
            throw err
        }
    }



    msg_response = async (_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let populate = [
                {
                    path: "sent_to",
                    select: "full_name profile_pic"
                },
                {
                    path: "sent_by",
                    select: "full_name profile_pic"
                }
            ]
            let response = await this.models.messages.find(query, projection, options).populate(populate).exec();
            return response
        } catch (err) {
            throw err
        }
    }

    update_last_msg = async (connection_id: string, last_msg: string) => {
        try {
            let query = { _id: new Types.ObjectId(connection_id) }
            let update = {
                last_message: last_msg,
                updated_at: moment().utc().valueOf()
            }
            let options = { new: true };
            let response = await this.models.connections.findOneAndUpdate(query, update, options).exec();
            return response;
        } catch (err) {
            throw err
        }
    }

    read_message = async (user_id: string, msg_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(msg_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let populate = [{ path: "connection_id", select: "_id" }]
            let message = await this.models.messages.find(query, projection, options).populate(populate).exec();
            if (message?.length == 0) throw new HttpException("Sorry this is not a valid message _id.", HttpStatus.BAD_REQUEST);
            let exist = 0;
            await message[0].read_by.forEach(async (x) => {
                if (x.toString() == user_id.toString()) {
                    exist++;
                }
            });
            if (!exist) {
                let update = { $addToSet: { read_by: new Types.ObjectId(user_id) } }
                let options = { new: true }
                await this.models.messages.findOneAndUpdate(query, update, options).exec();
            }
            let response = await this.msg_response(msg_id);
            return response;
        } catch (err) {
            throw err
        }
    }

    unread_message = async (user_id: string, data: dto.read_message) => {
        try {
            let { message_id } = data;
            let query = { _id: new Types.ObjectId(message_id) }
            let options = { new: true }
            let update = { $pull: { read_by: new Types.ObjectId(user_id) } }
            let response = await this.models.messages.findOneAndUpdate(query, update, options).exec();
            return response;
        } catch (err) {
            throw err
        }
    }

    is_typing = async (user1_id: string, data: dto.is_typing) => {
        try {
            let { user_id: user2_id, connection_id, is_typing } = data;
            let response = {
                is_typing: is_typing,
                user1_id: user1_id,
                user2_id: user2_id,
                connection_id: connection_id
            }
            return response;
        } catch (err) {
            throw err
        }
    }

    clear_message = async (connection_id: string, req: dto.user_data) => {
        try {
            let { _id: user_id } = req.user_data;
            let query = { connection_id: new Types.ObjectId(connection_id) }
            let query2 = { connection_id: new Types.ObjectId(connection_id), sent_by: new Types.ObjectId(user_id) }
            let options = { new: true };
            let update = { $push: { deleted_for: new Types.ObjectId(user_id) } }
            await this.models.messages.updateMany(query, update, options).exec();
            await this.models.messages.deleteMany(query2).exec();
            let response = {
                message: "Messages cleared Successfully"
            }
            return response;
        } catch (err) {
            throw err
        }
    }

    delete_message = async (req: dto.user_data, data: dto.delete_message) => {
        try {
            let { _id: user_id } = req.user_data;
            let { message_id, delete_type, connection_id } = data;
            console.log("delete_message---data", data);

            let len = message_id?.length;
            let options = { new: true };
            let projection = { __v: 0 };
            if (delete_type == Number(1)) { // message deleted for single user 
                for (let i = 0; i < len; i++) {
                    let query = { _id: new Types.ObjectId(message_id[i]) }
                    let update = { $push: { deleted_for: new Types.ObjectId(user_id) } }
                    await this.models.messages.findOneAndUpdate(query, update, options);
                    let query1 = { _id: new Types.ObjectId(message_id[i]), sent_by: new Types.ObjectId(user_id) }
                    await this.models.messages.deleteOne(query1);
                }
            }
            else if (delete_type == Number(2)) { //msg deleted for all
                for (let i = 0; i < len; i++) {
                    let query = { _id: new Types.ObjectId(message_id[i]), sent_by: new Types.ObjectId(user_id) }
                    await this.models.messages.deleteOne(query);
                    let query_new = { _id: new Types.ObjectId(message_id[i]) }
                    let update = { $push: { deleted_for: new Types.ObjectId(user_id) } }
                    await this.models.messages.findOneAndUpdate(query_new, update, options);
                }
            }
            let query2 = { connection_id: new Types.ObjectId(connection_id) }
            let query3 = { _id: new Types.ObjectId(connection_id) }
            let options2 = { lean: true, sort: { _id: -1 } };
            let fetch_last_msg = await this.models.messages.findOne(query2, projection, options2).exec();
            console.log("fetch_last_msg", fetch_last_msg);

            let update = { last_message: fetch_last_msg?.message ?? null }
            await this.models.connections.findOneAndUpdate(query3, update, options)
            let response = {
                message: "Messages deleted Successfully"
            }
            return response;
        } catch (err) {
            throw err
        }
    }

    all_msg = async (connection_id: string) => {
        try {
            let query = { connection_id: new Types.ObjectId(connection_id) }
            let projection = {
                sent_to: 1,
                sent_by: 1,
                message: 1,
                read_by: 1,
                connection_id: 1,
                created_at: 1,
            }
            let options = { lean: true }
            let populate = [
                { path: "sent_to", select: "full_name profile_pic" },
                { path: "sent_by", select: "full_name profile_pic" },
                { path: "connection_id", select: "updated_at" },
            ]
            let fetch_messages = await this.models.messages.find(query, projection, options).populate(populate).exec();

            return fetch_messages;
        }
        catch (err) {
            throw err
        }
    }

    update_lst_seen = async (user_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(user_id) }
            let update = { last_seen: moment().utc().valueOf() }
            let options = { new: true }
            await this.models.users.findOneAndUpdate(query, update, options).exec();
        } catch (err) {
            throw err
        }
    }

    update_status_online = async (user_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(user_id) }
            let update = { is_online: true }
            let options = { new: true }
            await this.models.users.findOneAndUpdate(query, update, options).exec();
        } catch (err) {
            throw err
        }
    }

    update_status_offline = async (user_id: string) => {
        try {
            let query = { _id: new Types.ObjectId(user_id) }
            let update = { is_online: false }
            let options = { new: true }
            await this.models.users.findOneAndUpdate(query, update, options).exec();
        } catch (err) {
            throw err
        }
    }

    mute_notification = async (dto: dto.mute_notification, req: dto.user_data) => {
        try {
            console.log("dto---", dto);

            let { _id: user_id } = req.user_data;
            let { connection_id, time_zone, type } = dto;
            let time;
            let current_time = moment_tz().tz(time_zone).toDate();
            if (type == "HOUR") {
                time = moment(current_time).add(12, 'hours').toDate();
            }
            if (type == "WEEK") {
                time = moment(current_time).add(1, 'weeks').toDate();
            }
            let query = { _id: new Types.ObjectId(connection_id) }
            let options = { new: true }
            let arr = {
                _id: new Types.ObjectId(user_id),
                time,
                type
            }
            let update1 = { $pull: { muted_by: { _id: new Types.ObjectId(user_id), } } }
            await this.models.connections.findOneAndUpdate(query, update1, options).exec();
            let update2 = { $addToSet: { muted_by: arr } }
            await this.models.connections.findOneAndUpdate(query, update2, options).exec();
            return "Notification Muted"
        }
        catch (err) {
            throw err
        }
    }

    add_participants = async (user_id: string, dto: dto.add_participants) => {
        try {
            let { connection_id, users_id } = dto;
            let query = { _id: new Types.ObjectId(connection_id) }
            let options = { new: true }
            if (users_id?.length) {
                let len = users_id?.length;
                for (let i = 0; i < len; i++) {
                    let arr = {
                        _id: new Types.ObjectId(users_id[i]),
                        role: "USER",
                        joined_at: moment().utc().valueOf()
                    }
                    let update = { $addToSet: { members: arr } }
                    let connection = await this.models.connections.findOneAndUpdate(query, update, options).exec();
                    let data: any = {
                        sent_by: new Types.ObjectId(user_id),
                        sent_to: new Types.ObjectId(users_id[i]),
                        connection_id: new Types.ObjectId(connection_id),
                        post_type: "GROUP",
                        message: `added to group ${connection.name}`,
                        created_at: moment().utc().valueOf()
                    }
                    await this.models.invitations.create(data);
                    data.type = "GROUP";
                    await this.models.notifications.create(data);
                    let tokens = await this.commonServices.fetch_tokens(users_id[i]);
                    let invite_data = { title: "GROUP", subject: "GROUP created" }
                    await this.commonServices.send_push(tokens, invite_data)
                }
            }
            return "member added"

        }
        catch (err) {
            throw err
        }
    }

    broadcast_message = async (socket: Socket, sent_by: string, dto: dto.broadcast_message) => {
        try {
            let { users_id } = dto;
            if (users_id && users_id?.length) {
                console.log("users_id", users_id);
                let len = users_id?.length;
                for (let i = 0; i < len; i++) {
                    let response;
                    let check_connection = await this.check_connection(sent_by, users_id[i], null, "NORMAL");
                    if (check_connection && check_connection?.length) {
                        response = await this.save_broadcast_message(sent_by, users_id[i], check_connection[0]._id, dto);
                        socket.join(check_connection[0]._id.toString());
                        let send_response = {
                            message: "Message Sent Successfully",
                            data: response[0]
                        }
                        socket.emit("send_message", send_response);
                        let received_response = {
                            message: "message received",
                            data: response[0]
                        }
                        socket.to(check_connection[0]._id).emit("receive_message", received_response)
                    } else {
                        let new_connection:any = await this.make_connection(sent_by, users_id[i], null, "NORMAL", null, null, null);
                        response = await this.save_broadcast_message(sent_by, users_id[i], new_connection._id, dto);
                        socket.join(new_connection._id.toString());
                        let send_response = {
                            message: "Message Sent Successfully",
                            data: response[0]
                        }
                        let received_response = {
                            message: "message received",
                            data: response[0]
                        }
                        socket.emit("send_message", send_response);
                        socket.to(new_connection._id).emit("receive_message", received_response)
                    }
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    save_broadcast_message = async (sent_by: string, sent_to: string, connection_id: string, dto: dto.broadcast_message) => {
        try {
            let { message, message_type, media_url, lat, long, type, time_zone } = dto;
            let save_data = {
                sent_by: new Types.ObjectId(sent_by),
                sent_to: new Types.ObjectId(sent_to),
                connection_id: new Types.ObjectId(connection_id),
                message,
                media_url,
                type,
                lat,
                long,
                message_type,
                created_at: moment().utc().valueOf()
            }
            let save_message :any = await this.models.messages.create(save_data);
            let { _id: msg_id } = save_message;
            let response = await this.msg_response(msg_id);
            let last_msg = message;
            await this.update_last_msg(connection_id, last_msg);
            return response
        }
        catch (err) {
            throw err
        }
    }

    // broadcast_message = async (sent_by: string, dto: dto.broadcast_message) => {
    //     try {
    //         let { users_id, message, message_type } = dto;
    //         console.log("make_connection");
    //         let group_code = await this.commonServices.generateUniqueCode()
    //         let data_to_save: any =
    //         {
    //             creator_id: new Types.ObjectId(sent_by),
    //             chat_type: "GROUP",
    //             group_type: "BROADCAST",
    //             group_code,
    //             message,
    //             created_at: moment().utc().valueOf(),
    //             updated_at: moment().utc().valueOf(),
    //         };
    //         let arr = [
    //             {
    //                 _id: new Types.ObjectId(sent_by),
    //                 role: "SUPER_ADMIN"
    //             }
    //         ]
    //         data_to_save.members = arr;
    //         let create_connection = await this.models.connections.create(data_to_save);
    //         let { _id } = create_connection;
    //         let query = { _id: new Types.ObjectId(_id) }
    //         let options = { new: true }
    //         let len = users_id?.length;
    //         for (let i = 0; i < len; i++) {
    //             let arr = {
    //                 _id: new Types.ObjectId(users_id[i]),
    //                 role: "USER"
    //             }
    //             let update = { $addToSet: { members: arr } }
    //             await this.models.connections.findOneAndUpdate(query, update, options).exec();
    //             let data: any = {
    //                 sent_by: new Types.ObjectId(sent_by),
    //                 sent_to: new Types.ObjectId(users_id[i]),
    //                 connection_id: new Types.ObjectId(_id),
    //                 post_type: "GROUP",
    //                 message: `added to broadcast group ${create_connection.name}`,
    //                 created_at: moment().utc().valueOf()
    //             }
    //             await this.models.invitations.create(data);
    //             data.type = "GROUP";
    //             await this.models.notifications.create(data);
    //             let tokens = await this.commonServices.fetch_tokens(users_id[i]);
    //             let invite_data = { title: "GROUP", subject: "Broadcast GROUP created" }
    //             await this.commonServices.send_push(tokens, invite_data)
    //         }
    //         let data = await this.save_broadcast_message(sent_by, _id, message, message_type)
    //         let response = { data, connection_id: _id }
    //         return response;
    //     }
    //     catch (err) {
    //         throw err
    //     }
    // }

    add_broadcast_info = async (data: dto.broadcast_info) => {
        try {
            let { connection_id, image_url, name } = data;
            let query = { _id: new Types.ObjectId(connection_id) }
            let update = { name, image_url }
            let options = { new: true }
            let response = await this.models.connections.findOneAndUpdate(query, update, options);
            return response;
        } catch (err) {
            throw err
        }
    }

    remove_connection = async (connection_id: string, req: dto.user_data) => {
        try {
            let { _id: user_id } = req.user_data;
            let query1 = { _id: new Types.ObjectId(connection_id) }
            let query2 = { connection_id: new Types.ObjectId(connection_id) }
            let update = { $addToSet: { deleted_for: new Types.ObjectId(user_id) } }
            let options = { new: true }
            let remove_data = await this.models.connections.findOneAndUpdate(query1, update, options).exec();
            await this.models.messages.updateMany(query2, update, options).exec();
            if (remove_data) {
                return "chat deleted";
            }
        } catch (err) {
            throw err
        }
    }

    // video_chat = async (req: dto.user_data, dto: dto.video_chat) => {
    //     try {
    //         let { users_ids } = dto;
    //         let { channelName, token } = await this.agoraService.create_token();
    //         if (users_ids && users_ids.length) {
    //             for (let i = 0; i < users_ids.length; i++) {
    //                 let tokens = await this.commonServices.fetch_tokens(users_ids[i]);
    //                 let notification_data = { channel_name: channelName, agora_token: token }
    //                 await this.commonServices.send_push(tokens, notification_data)
    //             }
    //         }
    //         let response = { channel_name: channelName, agora_token: token }
    //         return response;
    //     } catch (e) {
    //         throw e
    //     }
    // }
}