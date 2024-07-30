import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, connection } from 'mongoose';
import * as dto from './dto/index';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { aggregate } from './chat.aggregation';
import { aggregate2 } from './chat.aggregation2';
import * as moment from 'moment';
import { sortBy } from './dto/chat2';
import { Members, member_role } from './schema/member.schema';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constant';
import { Connections } from './schema/connection.schemas';
import { Messages } from './schema/message.schemas';
import { Groups } from './schema/group.schema';
import { UserType, message_deleted_type } from 'utils';
import { ModelService } from 'src/model/model.service';
import { CommonService } from 'src/common/common.service';
import { Blocked } from './schema/block.schemas';
import { AgoraService } from 'src/agora/agora.service';
import { SocketGateway } from './socket.gateway';
import { Call } from './schema/call.schemas';
import { Pins } from './schema/pinitems.schemas';
import { ChatSetting } from './schema/chatsetting.schemas';
import { LiveStreaming } from './schema/liveStream.schemas';
import { channel } from 'diagnostics_channel';
import { first } from 'rxjs';

let options = { lean: true };
let option_new = { new: true };

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Connections.name) private connectionModel: Model<any>,
    @InjectModel(Messages.name) private messageModel: Model<any>,
    @InjectModel(Blocked.name) private BlockedModel: Model<any>,
    @InjectModel(Call.name) private CallModel: Model<any>,
    @InjectModel(Groups.name) private GroupModel: Model<any>,
    @InjectModel(Members.name) private MemberModel: Model<any>,
    @InjectModel(Pins.name) private PinsModel: Model<any>,
    @InjectModel(ChatSetting.name) private ChatSettingModel: Model<any>,
    @InjectModel(LiveStreaming.name) private LiveStreamModel: Model<any>,
    private userservices: UsersService,
    private model: ModelService,
    private jwtService: JwtService,
    private commonService: CommonService,
    private agoraService: AgoraService,
    private socketGateway: SocketGateway,
  ) {}

  async updateUserSocketid(token: any, socket_id: string, is_connect: boolean) {
    console.log('update running');
    try {
      console.log('token------>>>>>>>', token)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      console.log("payload--", payload)
      console.log('token', token);
      let { id: user_id } = payload;
      let query = { _id: new Types.ObjectId(user_id) };
      let update: any;
      if (is_connect === true) {
        update = {
          socket_id: socket_id,
          last_seen: moment().utc().valueOf(),
          chat_active: true,
        };
      } else {
        update = { last_seen: moment().utc().valueOf(), chat_active: false };
      }
      let options = { new: true };
      let updated_data = await this.userservices.findupdateUser(
        query,
        update,
        options,
      );
      console.log('data', updated_data);
      return updated_data;
    } catch (error) {
      console.log('error', error);
      // return error;
    }
  }

  async checkConnection(sent_by: string, payload: dto.create_connection) {
    try {
      let { sent_to, group_id } = payload;
      let connection_id: any;
      let response: any;
      let query = group_id
        ? { group_id: new Types.ObjectId(group_id) }
        : {
            $or: [
              {
                $and: [
                  { sent_by: new Types.ObjectId(sent_by) },
                  { sent_to: new Types.ObjectId(sent_to) },
                ],
              },
              {
                $and: [
                  { sent_by: new Types.ObjectId(sent_to) },
                  { sent_to: new Types.ObjectId(sent_by) },
                ],
              },
            ],
          };

      let projection = { __v: 0 };
      let options = { lean: true };
      let connection: any = await this.connectionModel.find(
        query,
        projection,
        options,
      );

      if (connection.length) {
        //console.log('oldconnection......', connection[0]);
        let { _id } = connection[0];
        let data = await this.create_connection_response(_id, payload); ///create reasponse
        response = {
          connection_id: _id,
          data: data,
        };
      } else {
        const new_connection: any = await this.createConnection(
          sent_by,
          payload,
        ); ///create connection
        //console.log("new connection created", new_connection)
        response = {
          connection_id: new_connection._id,
          data: new_connection,
        };
      }
      return response;
    } catch (error) {
      return error;
    }
  }

  async createConnection(sent_by: string, payload: any) {
    try {
      let { sent_to, group_id } = payload;
      let data_to_save: any;
      if (!!sent_by && !!sent_to) {
        data_to_save = {
          sent_by: sent_by,
          sent_to: sent_to,
        };
        let check_block = await this.check_block(sent_to, sent_by);
        if (check_block) {
          throw new Error('You are Blocked by the User');
        }
      } else if (!!sent_by && !!group_id) {
        //console.log(sent_by, group_id)
        data_to_save = {
          group_id,
        };
      }
      let connection = await this.connectionModel.create(data_to_save);

      let response = await this.create_connection_response(
        connection._id,
        payload,
      );
      //console.log("🚀 ~ file: chat.service.ts:128 ~ createConnection ~ response:", response)
      return response;
    } catch (error) {
      return error;
    }
  }

  create_connection_response = async (connection_id: string, payload: any) => {
    try {
      let { sent_to, group_id } = payload;
      let query = { _id: connection_id };
      let projection = { __v: 0 };
      let options = { lean: true };
      let connection = await this.connectionModel.find(
        query,
        projection,
        options,
      );

      if (connection.length) {
        let query2: any;
        let options = { lean: true };
        if (group_id) {
          query2 = { _id: new Types.ObjectId(group_id) };
          let projection = { __v: 0 };
          let group = await this.GroupModel.findOne(
            query2,
            projection,
            options,
          );
          //console.log("🚀 ~ file: chat.service.ts:156 ~ create_connection_response= ~ group:", group)
          connection[0].group_data = group;
        } else {
          query2 = { _id: new Types.ObjectId(sent_to) };
          let projection = {
            first_name: 1,
            last_name: 1,
            profile_pic: 1,
            _id: 1,
          };
          let user = await this.userservices.getUserData(
            query2,
            projection,
            options,
          );
          connection[0].sent_to_data = user;
        }
        return connection[0];
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  };

  async saveMessage(
    sent_by: string,
    payload: dto.sendMessage,
    connection_data: any,
  ) {
    //dto.sendMessage) {
    try {
      let { sent_to, group_id } = connection_data;
      let {
        message,
        connection_id,
        media_url,
        message_type,
        message_id,
        type,
      } = payload;

      console.log('sent_By==>', new Types.ObjectId(sent_by));

      if (sent_to) {
        console.log('sent_to==>', connection_data?.sent_to?._id);
        if (sent_by === connection_data?.sent_to?._id.valueOf()) {
          ///sent_by == user_id
          sent_to = connection_data.sent_by;
          console.log('match');
        }
      }
      let data_to_save = {
        group_id,
        sent_by,
        type,
        sent_to: sent_to,
        message,
        message_id,
        media_url,
        message_type,
        connection_id,
        created_at: +new Date(),
      };

      let saved_message: any = await this.messageModel.create(data_to_save);

      let { _id: new_msg_id } = saved_message;

      let response = await this.makeMsgResponse(new_msg_id);

      let last_message: any = null;

      if (type == 'NORMAL' && message_type == 'TEXT') {
        last_message = message;
      } else if (type == 'REPLY' && message_type == 'TEXT') {
        last_message = message;
      } else if (type == 'FORWARDED' && message_type == 'TEXT') {
        last_message = 'forwarded message';
      } else if (type == 'NORMAL' && message_type == 'IMAGE') {
        last_message = 'image';
      } else if (type == 'NORMAL' && message_type == 'VIDEO') {
        last_message = 'video';
      } else if (type == 'NORMAL' && message_type == 'AUDIO') {
        last_message = 'audio';
      } else if (type == 'NORMAL' && message_type == 'DOCUMENT') {
        last_message = 'document';
      }
      let update_last: any = {
        last_message: last_message,
        updated_at: +new Date(),
      };
      let options = { new: true };
      //console.log('lastmessage.....', update_last);
      let query = { _id: connection_id };
      await this.connectionModel.findOneAndUpdate(query, update_last, options);
      return response;
    } catch (error) {
      return error;
    }
  }

  async makeMsgResponse(_id: string) {
    try {
      let query = { _id: new Types.ObjectId(_id) };
      let projection = { __v: 0 };
      let options = { lean: true };
      let populate1 = [
        { path: 'sent_by', select: 'first_name last_name profile_pic' },
        { path: 'sent_to', select: 'first_name last_name profile_pic' },
        { path: 'group_id', select: 'name image' },
        { path: 'connection_id', select: 'updated_at' },
      ];

      let response = await this.messageModel
        .find(query, projection, options)
        .populate(populate1)
        .exec();
      // let response = await this.messageModel.find(query,projection,options)
      ////console.log('messageresponse---------', response);
      return response[0];
    } catch (error) {
      throw error;
    }
  }

  async deliverMessage(user_id: string, payload: dto.readMessage) {
    try {
      let { message_id } = payload;
      let query:any = {
        _id:  new Types.ObjectId(message_id),
        delivered_to: { $nin: [user_id] },
        sent_by: { $ne: user_id },
        read_state: 0,
    }
      let update = {
        $addToSet: { delivered_to: new Types.ObjectId(user_id) },
          updated_at: moment().utc().valueOf(),
      }
      let options = {
        new: true
      };
      let response:any = await this.messageModel.findOneAndUpdate(query, update, options);
      console.log("response---", response)
      if (response?.sent_to && response?.delivered_to?.length == +1) {
          response =  await this.model.MessageModel.findOneAndUpdate({_id: response._id},{read_state: 1},{ new:true })
        }
      return response;
    } catch (error) {
       throw error
    }
  }

  async readMessage(user_id: string, payload: dto.readMessage) {
    try {
      let { message_id } = payload;
      let query = { _id: new Types.ObjectId(message_id) };
      let update = {
        $addToSet: { read_by: new Types.ObjectId(user_id) },
        updated_at: moment().utc().valueOf(),
      };
      let options = { new: true };
      let response = await this.messageModel.findOneAndUpdate(
        query,
        update,
        options,
      );
      if (response?.sent_to && response?.read_by?.length == +1) {
        response = await this.model.MessageModel.findOneAndUpdate({_id: response._id},{read_state: 2},{ new:true } )
     }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllMessage(
    payload: dto.join_connection,
    pagin?: dto.pagination,
    user_id?: string,
  ) {
    try {
      let { connection_id } = payload;
      let connnection = await this.model.ConnectionModel.findOne({ _id: new Types.ObjectId(connection_id) }, { __v: 0 }, { new: true });

      let query:any = {
        connection_id: new Types.ObjectId(connection_id),
        deleted_for: { $nin: [new Types.ObjectId(user_id)] },
      };

      let update:any = {
        $addToSet: { read_by: user_id },
        updated_at: moment().utc().valueOf(),
      };

      if (connnection.sent_to) {
        let query2 = {
          connection_id: new Types.ObjectId(connection_id),
          deleted_for: { $nin: [new Types.ObjectId(user_id)] },
          sent_to :new Types.ObjectId(user_id)
        };
        await this.model.MessageModel.updateMany(query2, { read_state: 2 }, { new: true })
      } 
      await this.messageModel.updateMany(query, update, { new: true });

      let projection = {
        sent_to: 1,
        sent_by: 1,
        message: 1,
        read_by: 1,
        created_at: 1,
        updated_at: 1,
        media_url: 1,
        message_id: 1,
        read_state: 1,
      };
      let options: any = { lean: true };
      if (pagin?.pagination || pagin?.limit) {
        options = await this.set_options(pagin?.pagination, pagin?.limit);
      }
      options.sort = {
        _id: -1,
      };
      let populate1 = [
        { path: 'sent_by', select: 'first_name last_name profile_pic' },
        { path: 'sent_to', select: 'first_name last_name profile_pic' },
        { path: 'connection_id', select: 'updated_at group_id' },
        { path: 'group_id', select: 'name image description' },
        {
          path: 'message_id',
          select: 'sent_by message message_type media_url message_url type',
          populate: [
            { path: 'sent_by', select: 'first_name last_name profile_pic' },
          ],
        },
      ];
      let response = await this.messageModel
        .find(query, projection, options)
        .populate(populate1)
        .exec();

      let count = await this.messageModel.countDocuments(query);
    
      return {
        count: count,
        data: response,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserConnections(user_id: any, pagin?: dto.list_connection) {
    try {
      let query1 = { user_id: new Types.ObjectId(user_id) };
      let projection = { group_id: 1 };
      let options = { lean: true };
      let gruop = await this.MemberModel.find(
        query1,
        projection,
        options,
      ).exec();
      let options2 = await this.set_options(pagin?.pagination, pagin?.limit);
      let pagin_status: boolean = false;
      if (pagin?.pagination || pagin?.limit) {
        pagin_status = true;
      }
      let ids = [];
      if (gruop && gruop.length) {
        for (let i = 0; i < gruop.length; i++) {
          ids.push(gruop[i].group_id);
        }
      }

      console.log(ids);
      let query: any = [
        await aggregate.match(user_id, ids),
        await aggregate.set_data(user_id),
        await aggregate.lookupUser(),
        await aggregate.unwindUser(),
        await aggregate.lookup_group(),
        await aggregate.unwindGroup(),
        await aggregate.lookupMessage(user_id),
        await aggregate.unread_messages(),
        await aggregate.search(pagin.search),
        await aggregate.group_data(user_id),
        await aggregate.remove_same_user_data(user_id),
        await aggregate.facetData(options2.skip, options2.limit, pagin_status),
        { $sort: { updated_at: -1 } },
      ];
      let data: any = await this.connectionModel.aggregate(query);
      console.log('Dta===>', data);
      return {
        count: data[0].metadata[0]?.count ? data[0].metadata[0]?.count : 0,
        data: data[0]?.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(user_id: string, payload: any) {
    try {
      let { message_id, deleted_type } = payload;
      let query = { _id: new Types.ObjectId(message_id) };
      let projection = { __v: 0 };
      //let update = { is_read: true };
      let options = { new: true };
      let response: any = await this.messageModel.find(
        query,
        projection,
        options,
      );
      let data_to_update: any;
      if (response.length) {
        let { sent_by, sent_to } = response[0];
        if (
          new Types.ObjectId(user_id) == sent_by &&
          deleted_type == message_deleted_type.BOTH
        ) {
          data_to_update = {
            $push: {
              deleted_for: {
                $each: [
                  new Types.ObjectId(sent_by),
                  new Types.ObjectId(sent_to),
                ],
              },
            },
          };
        } else {
          data_to_update = { deleted_for: new Types.ObjectId(user_id) };
        }
      } else {
        throw {
          type: 'NOT_FOUND',
          error_message: 'request message not exits or already deleted',
        };
      }
      const updated_data: any = await this.messageModel.findOneAndUpdate(
        query,
        data_to_update,
        options,
      );
      //console.log("updated_at", updated_data)
      return {
        type: 'SUCCESS',
        message: `${updated_data._id} is deleted`,
        connection_id: updated_data.connection_id,
      };
    } catch (error) {
      throw error;
    }
  }

  async get_connections() {
    try {
      let query = {};
      let projection = { __v: 0 };
      let options = { lean: true };
      let connections = await this.connectionModel.find(
        query,
        projection,
        options,
      );
      return connections;
    } catch (err) {
      throw err;
    }
  }
  async get_connection(connection_id: string) {
    try {
      if (!connection_id) throw Error('Connection_id is mandatory');
      let query = { _id: new Types.ObjectId(connection_id) };
      let projection = { __v: 0 };
      let options = { lean: true };
      let connections = await this.connectionModel
        .findOne(query, projection, options)
        .populate([
          { path: 'sent_to', select: 'socket_id' },
          { path: 'sent_by', select: 'socket_id' },
        ])
        .exec();
      if (!connections) throw Error('Connection not found');
      console.log('connection==>', connections);
      return connections;
    } catch (err) {
      throw err;
    }
  }

  async get_socket_id_by_connection(_id: string, user_id: string) {
    let connection = await this.get_connection(_id);
    let { group_id, sent_to } = connection;
    let socket_ids: any;
    if (group_id) {
      socket_ids = await this.getGroupSocketids(group_id);
    } else if (sent_to) {
      let check_block = await this.check_block(connection.sent_to._id, connection.sent_by._id)
      if (!!check_block) {
        if (user_id == connection.sent_by._id.toString()) {
          socket_ids = [connection.sent_by.socket_id]
        } else {
          socket_ids = [connection.sent_to.socket_id]
        }
      } else {
        socket_ids = [connection.sent_by.socket_id, connection.sent_to.socket_id];
      }
    }
    return socket_ids;
  }

  async getGroupSocketids(group_id: string, ) {
    try {
      let query = { group_id: new Types.ObjectId(group_id) };
      let users = await this.MemberModel.find(query)
        .populate({ path: 'user_id', select: 'socket_id' })
        .exec();
      console.log('socket_ids of users:', users);
      let socket_ids = users.map((res) => res.user_id.socket_id);
      return socket_ids;
    } catch (error) {
      throw error;
    }
  }

  async get_tokens(_id: any, user_id: any) {
    try {
      let currentUtc = moment().utc().valueOf();
      let connection = await this.get_connection(_id);
      let { group_id, sent_to } = connection;
      console.log('🚀 ~ get_tokens ~ connection:', connection);
      let s_query: any;
      let sessions: any = [];
      if (group_id) {
        let query = {
          group_id: new Types.ObjectId(group_id),
          mute: { $ne: 0, $lt: currentUtc },
        };
        let members = await this.MemberModel.find(
          query,
          { user_id: 1 },
          { lean: true },
        );
        let user_ids = members.map((res) => res.user_id);
        s_query = {
          user_id: { $and: [{ $in: user_ids }, { $ne: user_id }] },
          fcm_token: { $ne: null },
        };
        sessions = await this.model.SessionModel.find(
          s_query,
          { fcm_token: 1 },
          options,
        );
      } else if (sent_to) {
        if (sent_to._id == user_id) {
          if (
            connection.sender_mute == 0 ||
            connection.sender_mute < currentUtc
          ) {
            s_query = {
              user_id: connection.sent_by._id,
              fcm_token: { $ne: null },
            };
            sessions = await this.model.SessionModel.find(
              s_query,
              { fcm_token: 1 },
              options,
            );
          }
        } else {
          console.log('connection mute time--', connection.reciever_mute);
          console.log('currentutc===', currentUtc);
          if (
            connection.reciever_mute == 0 ||
            connection.reciever_mute < currentUtc
          ) {
            s_query = {
              user_id: connection.sent_to._id,
              fcm_token: { $ne: null },
            };
            sessions = await this.model.SessionModel.find(
              s_query,
              { fcm_token: 1 },
              options,
            );
          }
        }
      }
      console.log('squery====>>', s_query);
      console.log('sessions ===> ', sessions);
      let tokens = sessions.map((res: any) => res?.fcm_token);
      console.log('🚀 ~ get_tokens ~ tokens:', tokens);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async send_push(data: any, tokens: any) {
    try {
      let new_tokens: any = [...new Set(tokens)];
      await this.commonService.push_notification(data, new_tokens);
    } catch (error) {
      throw error;
    }
  }

  // async getConnectionSocketids(sent_to){
  //   try {
  //     let query = {_id:new Types.ObjectId(sent_to)}
  //     let projection= {socket_id:1 }
  //     let options = { lean:true }
  //     let user_data = await this.userservices.getUserData(query, projection, options)
  //     return user_data.socket_id
  //   } catch (error) {
  //     throw error
  //   }
  // }

  async createGroup(req: any, body: dto.CreateGroupDto) {
    try {
      let user_id = req.user.id;
      let check_group = await this.GroupModel.findOne({
        created_by: new Types.ObjectId(user_id),
        name: body.name,
      });
      if (check_group) {
        throw new BadRequestException(
          'You have already created the group with same name',
        );
      }
      let data_to_save = {
        name: body?.name,
        image: body?.image,
        description: body?.description,
        created_by: user_id,
      };
      let saved_data: any = await this.GroupModel.create(data_to_save);
      let data_to_save2 = {
        group_id: saved_data._id,
        user_id: user_id,
        role: member_role.ADMIN,
        created_at: moment().utc().valueOf(),
      };
      let member = await this.MemberModel.create(data_to_save2);
      //console.log("mbmer",member)
      let group_data = { group_id: saved_data._id };
      let create_connection = await this.createConnection(user_id, group_data);
      let response = {
        group_data: saved_data,
        connection_id: create_connection._id,
        members: [member],
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addGroupMember(
    group_id: string,
    body: dto.AddGroupMemberDto,
    user_id: string,
  ) {
    try {
      let { members } = body;

      let admin_query = {
        group_id: new Types.ObjectId(group_id),
        user_id: new Types.ObjectId(user_id),
        role: member_role.ADMIN,
      };
      let check_admin = await this.MemberModel.findOne(
        admin_query,
        { __v: 0 },
        { lean: true },
      );

      if (!check_admin)
        throw new BadRequestException('You are not admin of this group');
      let members_to_save = members.map((_id) => {
        return {
          user_id: new Types.ObjectId(_id),
          group_id: new Types.ObjectId(group_id),
          created_at: moment().utc().valueOf(),
        };
      });

      let new_members_to_save: any = [];
      for (let member of members_to_save) {
        let query = { group_id: member.group_id, user_id: member.user_id };
        let check_member = await this.MemberModel.findOne(query);
        if (!check_member) {
          new_members_to_save.push(member);
        }
      }
      let saved_data = await this.MemberModel.insertMany(new_members_to_save);
      return saved_data;
    } catch (error) {
      throw error;
    }
  }

  async getGroups(req: any, quer: dto.paginationsort) {
    try {
      let user_id = req.user.id;

      let { pagination, limit, sort_by } = quer;
      //console.log('🚀 ~ file: chat.service.ts:361 ~ getGroups ~ quer:', quer);
      let options: any = await this.set_options(pagination, limit);
      if (sort_by) {
        if (sort_by == sortBy.Newest) {
          options.sort = { _id: -1 };
        } else if (sort_by == sortBy.Oldest) {
          options.sort = { _id: 1 };
        } else if (sort_by == sortBy.Name) {
          options.sort = { first_name: 1 };
        }
      } else {
        options.sort = { _id: -1 };
      }
      let query = [
        await aggregate2.matchGroup(),
        await aggregate2.lookupMember(user_id),
        await aggregate2.unwindMember(),
        await aggregate2.group_data(),
        await aggregate2.sortData(options.sort),
        await aggregate2.facetData(options.skip, options.limit),
      ];
      let data = await this.GroupModel.aggregate(query);
      //console.log('getGroups', data);
      return {
        count: data[0].metadata[0]?.count ? data[0].metadata[0]?.count : 0,
        data: data[0]?.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async set_options(pagination: number, limit: number) {
    try {
      ////console.log("-=-=-pagination------",pagination,limit)
      let options: any = {
        lean: true,
        sort: { _id: -1 },
      };

      if (pagination == undefined && limit == undefined) {
        options = {
          lean: true,
          sort: { _id: -1 },
          limit: 100,
          pagination: 0,
          skip: 0,
        };
      } else if (pagination == undefined && typeof limit != undefined) {
        options = {
          lean: true,
          sort: { _id: -1 },
          limit: Number(limit),
          skip: 0,
        };
      } else if (typeof pagination != undefined && limit == undefined) {
        options = {
          lean: true,
          sort: { _id: -1 },
          skip: Number(pagination) * Number(process.env.DEFAULT_LIMIT),
          limit: Number(process.env.DEFAULT_LIMIT),
        };
      } else if (typeof pagination != undefined && typeof limit != undefined) {
        options = {
          lean: true,
          sort: { _id: -1 },
          limit: Number(limit),
          skip: Number(pagination) * Number(limit),
        };
      }
      return options;
    } catch (err) {
      throw err;
    }
  }

  async getGroupMembers(group_id: string, quer: dto.paginationsort) {
    try {
      let { pagination, limit, sort_by } = quer;
      let options: any = await this.set_options(pagination, limit);
      if (sort_by) {
        if (sort_by == sortBy.Newest) {
          options.sort = { _id: -1 };
        } else if (sort_by == sortBy.Oldest) {
          options.sort = { _id: 1 };
        } else if (sort_by == sortBy.Name) {
          options.sort = { first_name: 1 };
        }
      } else {
        options.sort = { _id: -1 };
      }
      let query = { group_id: new Types.ObjectId(group_id) };
      let projection = { _id: 0, group_id: 0, created_at: 0 };
      let populate = [
        { path: 'user_id', select: 'first_name last_name profile_pic' },
      ];
      let data = await this.MemberModel.find(query, projection, options)
        .populate(populate)
        .exec();
      let count = await this.MemberModel.countDocuments(query);
      return {
        count: count,
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUsers(user_id: any, quer: dto.paginationsortsearch) {
    try {
      let { pagination, limit, sort_by, search } = quer;
      let options: any = await this.set_options(pagination, limit);
      if (sort_by) {
        if (sort_by == sortBy.Newest) {
          options.sort = { _id: -1 };
        } else if (sort_by == sortBy.Oldest) {
          options.sort = { _id: 1 };
        } else if (sort_by == sortBy.Name) {
          options.sort = { first_name: 1 };
        }
      } else {
        options.sort = { _id: -1 };
      }
      let blocked_arr = await this.get_blocked_user_arr(user_id);
      let query: any = {
        is_deleted: false,
        _id: { $ne: new Types.ObjectId(user_id), $nin: blocked_arr },
        user_type: 'user',
      };
      if (search) {
        let new_search: any = search.split(' ');
        query.$or = [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          {
            $and: [
              {
                first_name: { $regex: new_search[0].toString(), $options: 'i' },
              },
              {
                last_name: {
                  $regex: new_search[1] ? new_search[1].toString() : '',
                  $options: 'i',
                },
              },
            ],
          },
        ];
      }
      let projection = { _id: 1, first_name: 1, last_name: 1, profile_pic: 1 };
      let data = await this.userservices.getUsers(query, projection, options);
      let count = await this.model.UserModel.countDocuments(query);
      return {
        count,
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async leaveConnection(connection_id: string, user_id: string) {
    try {
      let connection = await this.get_connection(connection_id);
      if (connection.group_id != null) {
        let query = { group_id: connection.group_id, user_id: user_id };
        let member = await this.MemberModel.deleteMany(query);
      } else {
        let query = {
          sent_to: new Types.ObjectId(user_id),
          connection_id: connection_id,
        };
        let deleted = await this.connectionModel.findOneAndUpdate(
          query,
          { sent_to: null },
          { new: true },
        );
        if (!deleted) {
          let query1 = {
            sent_by: new Types.ObjectId(user_id),
            connection_id: connection_id,
          };
          await this.connectionModel.findOneAndUpdate(
            query,
            { sent_by: null },
            { new: true },
          );
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async connection_details(user_id: string, connection_id: string) {
    try {
      let query = { _id: new Types.ObjectId(connection_id) };
      let projection = { __v: 0 };
      let options = { lean: true };
      let populate_to = [
        {
          path: 'sent_to',
          select:
            'first_name last_name profile_pic chat_active email phone temp_mail temp_phone last_seen',
        },
        {
          path: 'sent_by',
          select:
            'first_name last_name profile_pic chat_active email phone temp_mail temp_phone last_seen',
        },
        { path: 'group_id', select: 'name image' },
      ];
      let connections: any = await this.connectionModel
        .findOne(query, projection, options)
        .populate(populate_to)
        .exec();
      let members: any = null;
      let member_count: number = 2;
      let group_data: any = null;
      let other_user: any = null;
      let blocked: any = null;
      if (connections.group_id) {
        group_data = await this.GroupModel.findOne(
          { _id: connections.group_id },
          { __v: 0 },
          { lean: true },
        );
        let membersQuery = { group_id: connections.group_id };
        let projection = { _id: 0, created_at: 0, group_id: 0, __v: 0 };
        members = await this.MemberModel.find(membersQuery, projection, {
          lean: true,
          limit: 5,
        })
          .populate({
            path: 'user_id',
            select: 'first_name last_name profile_pic',
          })
          .exec();
        member_count = await this.MemberModel.countDocuments(membersQuery);
      } else if (connections?.sent_by) {
        if (connections.sent_by._id == user_id) {
          other_user = connections.sent_to;
        } else {
          other_user = connections.sent_by;
        }
      }
      if (other_user) {
        console.log('🚀 ~ connection_details ~ other_user:', other_user);

        let query = {
          $or: [
            {
              block_by: new Types.ObjectId(user_id),
              block_to: new Types.ObjectId(other_user._id),
            },
            {
              block_to: new Types.ObjectId(other_user._id),
              block_by: new Types.ObjectId(user_id),
            },
          ],
        };
        console.log('🚀 ~ connection_details ~ query:', query);
        blocked = await this.BlockedModel.find(query, { block_by: 1 }, options);
      }
      let pin_count = await this.PinsModel.countDocuments({
        connection_id: new Types.ObjectId(connection_id),
      });
      return {
        _id: connections._id,
        other_user_id: other_user?._id ?? null,
        other_user: other_user,
        group_id: group_data?._id ?? null,
        group: group_data,
        group_member: members,
        member_count,
        pin_count,
        block_by: blocked,
      };
    } catch (err) {
      throw err;
    }
  }

  async mute_unmute(
    user_id: string,
    connection_id: string,
    body: dto.mute_connection,
  ) {
    try {
      let { mute_upto } = body;
      let value: number;
      let message: string;
      if (mute_upto == 1) {
        value = moment.utc().add(8, 'hour').valueOf();
        message = 'Successfully muted for 8 hour';
      } else if (mute_upto == 2) {
        value = moment.utc().add(1, 'week').valueOf();
        message = 'Successfully muted for a week';
      } else if (mute_upto == 3) {
        value = moment.utc().add(5, 'years').valueOf();
        message = 'Successfully muted for always';
      } else if (mute_upto == 0) {
        value = 0;
        message = 'Successfully unmuted';
      }
      let connection = await this.get_connection(connection_id);
      if (connection.group_id) {
        let query = {
          group_id: connection.group_id,
          user_id: new Types.ObjectId(user_id),
        };
        let update: any = { mute: value };
        await this.MemberModel.updateOne(query, update);
      } else {
        let query = { _id: connection._id };
        let update_connection: any = { reciever_mute: value };
        if (connection.sent_by == user_id) {
          update_connection = { sender_mute: value };
        }
        await this.connectionModel.updateOne(query, update_connection);
      }
      return {
        message,
      };
    } catch (error) {
      throw error;
    }
  }

  async block_unblock(block_by: string, body: dto.block_unblock) {
    try {
      let { user_id: block_to, status } = body;
      let message= "unblocked successfully"
      if (status === 0) {
        await this.BlockedModel.deleteOne({
          block_by: new Types.ObjectId(block_by),
          block_to: new Types.ObjectId(block_to),
        });
      }
      else if (status === 1) {
        let fetchData = await this.BlockedModel.findOne({ block_by, block_to })
        if (!fetchData) {
          await this.BlockedModel.create({ block_by, block_to });
        } 
        message= "blocked successfully"
      }
      return {
        message 
      }
    } catch (error) {
      throw error;
    }
  }

  async get_blocked_user(block_by: string, body: dto.pagination) {
    try {
      let { pagination, limit } = body;
      let query = { block_by: new Types.ObjectId(block_by) };
      let option = this.commonService.set_options(pagination, limit);
      let populate_to = {
        path: 'block_to',
        select: 'first_name last_name profile_pic',
      };
      let data = await this.BlockedModel.find(query, { __v: 0 }, option)
        .populate(populate_to)
        .exec();
        let count = await this.BlockedModel.countDocuments(query)
        return { data , count};
    } catch (error) {
      throw error;
    }
  }

  async get_blocked_user_arr(user_id: string) {
    try {
      let query = {
        $or: [
          { block_by: new Types.ObjectId(user_id) },
          { block_to: new Types.ObjectId(user_id) },
        ],
      };
      let data = await this.BlockedModel.find(query, { __v: 0 }, options);
      let arr: any = [];
      arr = data.map((res: any) => res?.block_to);
      return arr;
    } catch (error) {
      throw error;
    }
  }

  async check_block(block_by: any, block_to: any) {
    try {
      let query = {
        $or: [
          {
            block_by: new Types.ObjectId(block_by),
            block_to: new Types.ObjectId(block_to),
          },
          {
            block_to: new Types.ObjectId(block_by),
            block_by: new Types.ObjectId(block_to),
          },
        ],
      };
      let data = await this.BlockedModel.countDocuments(query);
      console.log('count_block', data);
      return data > 0 ? true : false;
    } catch (error) {
      throw error;
    }
  }

  async add_pin_items(
    user_id: string,
    connection_id: string,
    message_id: string,
  ) {
    try {
      let count = await this.PinsModel.countDocuments({
        message_id: new Types.ObjectId(message_id),
      });
      if (count > 0) throw new BadRequestException('Item already pinned');
      let data_to_save = { user_id, connection_id, message_id };
      await this.PinsModel.create(data_to_save);
      return;
    } catch (error) {
      throw error;
    }
  }

  async remove_pin_items(
    user_id: string,
    connection_id: string,
    message_id: string,
  ) {
    try {
      let data_to_save = { user_id, connection_id, message_id };
      await this.PinsModel.deleteOne(data_to_save);
      return;
    } catch (error) {
      throw error;
    }
  }

  async get_pin_items(connection_id: string, payload: dto.pagination) {
    try {
      let { pagination, limit } = payload;
      let query = { connection_id: new Types.ObjectId(connection_id) };
      let option = this.commonService.set_options(pagination, limit);
      let populate_to = [
        { path: 'user_id', select: 'first_name last_name profile_pic' },
        { path:"message_id", select: 'message_type message message_url media_url' }
      ];
      let data = await this.PinsModel.find(query, { __v: 0 }, option)
        .populate(populate_to)
        .exec();
      let count = await this.PinsModel.countDocuments( query)
      return {
        data, 
        count
      }
    } catch (error) {
      throw error;
    }
  }

  // async chat_setting(user_id: string, body: dto.chat_setting) {
  //   try {
  //     let {
  //       notification_alert,
  //       message_alert,
  //       group_chat_invitation,
  //       active_status_visiblity,
  //     } = body;
  //     let data: any = {
  //       notification_alert,
  //       message_alert,
  //       group_chat_invitation,
  //       active_status_visiblity,
  //     };
  //     let updated_data: any = await this.ChatSettingModel.findOneAndUpdate(
  //       { user_id: new Types.ObjectId(user_id) },
  //       data,
  //       { new: true },
  //     );
  //     if (!updated_data) {
  //       data.user_id = user_id;
  //       updated_data = await this.ChatSettingModel.create(data);
  //     }
  //     return updated_data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async start_call(user_id: string, body: dto.start_call) {
    try {
      let user = await this.model.UserModel.findOne({
        _id: new Types.ObjectId(user_id),
      });
      let { users_ids, type, connection_id } = body;
      let check_call = await this.CallModel.findOne({
        connection_id: new Types.ObjectId(connection_id),
        call_ended: false,
      });
      if (check_call) throw new BadRequestException('First End Other Call');
      let channel_name = (await this.agoraService.create_channel_name())
        .channel_name;
      let create_token = await this.agoraService.create_token({
        channel_name: channel_name,
        role: 'PUBLISHER',
      });
      let data_to_save: any = {
        connection_id,
        creator_id: user_id,
        channel_name: channel_name,
        agora_token: create_token.token,
        type,
        created_at: moment().utc().valueOf(),
      };
      data_to_save.members = [
        { user_id: user_id, joined_at: moment().utc().valueOf() },
      ];
      for (let i = 0; i < users_ids.length; i++) {
        data_to_save.members.push({ user_id: users_ids[i] });
      }
      let saved_data = await this.CallModel.create(data_to_save);
      for (let i = 0; i < users_ids.length; i++) {
        let fcm_token = await this.getUserSocket(user_id);
        let notification_data = {
          channel_name: data_to_save.channel_name,
          agora_token: data_to_save.agora_token,
          id: saved_data._id,
          type,
          userId: users_ids[i],
          user_id: user?._id,
          user_name: user?.first_name ?? `${user.first_name} ${user.last_name}`,
          user_image: user?.profile_pic ?? null,
        };
        await this.send_push(notification_data, fcm_token);
      }
      return saved_data;
    } catch (error) {
      throw error;
    }
  }

  async join_call(user_id: string, call_id: string) {
    try {
      let check_call = await this.CallModel.findOne({
        members: { $elemMatch: { leave_at: 0, joined_at: { $ne: 0 } } },
      });
      if (check_call) throw new BadRequestException('First End Other Call');
      let query = {
        _id: new Types.ObjectId(call_id),
        'members.user_id': new Types.ObjectId(user_id),
      };
      let update = {
        $set: { 'members.$.joined_at': moment().utc().valueOf() },
      };
      let updated_data = await this.CallModel.findOneAndUpdate(
        query,
        update,
        option_new,
      );
      let user_query = { _id: new Types.ObjectId(user_id) };
      let user_projection = { first_name: 1, last_name: 1, profile_pic: 1 };
      let user_data = await this.model.UserModel.findOne(
        user_query,
        user_projection,
        options,
      );
      let get_users = updated_data.members;
      let socket_ids: any;
      for (let i = 0; i < get_users.length; i++) {
        let { joined_at, leave_at, user_id: member_id } = get_users[i];
        if (joined_at != 0 && leave_at == 0 && member_id != user_id) {
          let socket_id = await this.getUserSocketId(member_id);
          socket_ids.push(socket_id);
        }
      }
      await this.socketEmit(socket_ids, 'join_call', {
        message: `${user_data.first_name} ${user_data.last_name} join call`,
        connection_id: updated_data.connection_id,
        response: updated_data,
      });
      return updated_data;
    } catch (error) {
      throw error;
    }
  }

  async end_call(user_id: string, call_id: string) {
    try {
      let fetch_data = await this.CallModel.findOne(
        { _id: new Types.ObjectId(call_id) },
        { __v: 0 },
        options,
      );
      let members_on_call = fetch_data.members.filter(
        (member) => member.leave_at === 0,
      ).length;
      let query = {
        _id: new Types.ObjectId(call_id),
        'members.user_id': new Types.ObjectId(user_id),
      };
      let update: any = {
        $set: { 'members.$.leave_at': moment().utc().valueOf() },
      };
      if (
        fetch_data.creator_id.toString() == user_id ||
        members_on_call <= +2
      ) {
        update.call_ended = true;
      }
      let data = await this.CallModel.findOneAndUpdate(
        query,
        update,
        option_new,
      );
      let user_query = { _id: new Types.ObjectId(user_id) };
      let user_projection = { first_name: 1, last_name: 1, profile_pic: 1 };
      let user_data = await this.model.UserModel.findOne(
        user_query,
        user_projection,
        options,
      );
      let get_users = data.members;
      let socket_ids: any;
      for (let i = 0; i < get_users.length; i++) {
        let { joined_at, leave_at, user_id: member_id } = get_users[i];
        if (joined_at != 0 && leave_at == 0 && member_id != user_id) {
          let fcm_token = await this.getUserSocket(user_id);
          let notification_data = {
            title: data?.call_ended ? 'Call Ended' : 'Call Leave',
            subject: data?.call_ended ? 'Call Ended' : 'Call Leave',
            id: data?._id,
            userId: member_id,
            user_id: user_id, ////leaved by
            user_name: `${user_data.first_name} ${user_data.last_name}`,
            user_profile_pic: user_data.profile_pic,
          };
          await this.send_push(notification_data, fcm_token);
          let socket_id = await this.getUserSocketId(member_id);
          socket_ids.push = socket_id;
        }
      }
      await this.socketEmit(socket_ids, 'end_call', {
        message: `${user_data.first_name} ${user_data.last_name} ${
          data?.call_ended ? 'end call' : 'leave call'
        }`,
        connection_id: data.connection_id,
        response: data,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async call_detail(user_id: string, _id: string) {
    try {
      let query = { _id: new Types.ObjectId(_id) };
      let populate_to = [
        { path: 'creator_id', select: 'first_name last_name profile_pic' },
        { path: 'members.user_id', select: 'first_name last_name profile_pic' },
        { path: 'members.user_id', select: 'first_name last_name profile_pic' },
      ];
      let detail = await this.CallModel.findOne(
        query,
        { __v: 0 },
        { lean: true },
      )
        .populate(populate_to)
        .exec();
      return detail;
    } catch (error) {
      throw error;
    }
  }

  async getUserSocket(user_id: string) {
    let session = await this.model.SessionModel.findOne(
      { user_id: new Types.ObjectId(user_id) },
      { fcm_token: 1 },
      { sort: { _id: -1 } },
    );
    return session.fcm_token;
  }

  async getUserSocketId(user_id: string) {
    let user = await this.model.UserModel.findOne(
      { _id: new Types.ObjectId(user_id) },
      { socket_id: 1 },
      options,
    );
    return user.socket_id;
  }

  async socketEmit(ids: any, event: string, response: any) {
    await this.socketGateway.socket_to(ids, event, response);
  }

  async create_stream(user_id: any, body: dto.create_stream) {
    try {
      let query = { name: body.name, created_by: new Types.ObjectId(user_id) }
      let check_exists = await this.LiveStreamModel.find(query, { __v: 0 }, { lean: true });
      if (check_exists.length > 0) {
        return check_exists[0];
      }
      let check_joinned:any = await this.check_joined_stream(user_id);
      if (check_joinned) {
        await this.leave_stream( user_id, { stream_id: check_joinned?._id })
      }
      let data_to_save = {
        channel_name: body?.channel_name,
        agora_token: body?.agora_token,
        name: body.name,
        is_live: true,
        created_by: new Types.ObjectId(user_id),
        joined_by: [new Types.ObjectId(user_id)],
        created_at: moment().utc().valueOf()
      }
      console.log("data_to_save", data_to_save)
      let create = await this.LiveStreamModel.create(data_to_save);
      return create;
    } catch (error) {
       throw error
    }
   
  }

  async join_stream(user_id: string, payload: dto.join_stream) {
    try {
      let { stream_id } = payload;
      let check_joinned:any = await this.check_joined_stream(user_id);
      if (check_joinned) {
        if (check_joinned._id != stream_id) {
          console.log("condition not match")
          await this.leave_stream( user_id, { stream_id: check_joinned?._id })
        }
      }
      let query = { _id: new Types.ObjectId(stream_id) }
      let update = {
        $addToSet : {
          joined_by: new Types.ObjectId(user_id)
        },
        updated_at : moment().utc().valueOf()
      }
      let updated_data = await this.LiveStreamModel.findOneAndUpdate(query, update, { new: true })
      return updated_data;
    } catch (error) {
       throw error
    }
  }

  async leave_stream(user_id: string, payload: dto.leave_stream) {
    try {
      let { stream_id } = payload;
      let query = { _id: new Types.ObjectId(stream_id) }
      let fetch_data:any = await this.LiveStreamModel.findOne(query, { created_by: 1 }, { lean: true })
      let update:any = {
        $pull: {
          joined_by: {
              $in: [new Types.ObjectId(user_id)]
          }
        }
      }
      if (fetch_data?.created_by == user_id) {
        update.is_live = false; 
      } 
      let updated_data = await this.LiveStreamModel.findOneAndUpdate(query, update, { new: true })
      return updated_data;
    } catch (error) {
       throw error
    }
  }


  async list_joined_user(joined_by: any) {
    try {
      let query = { _id: { $in: joined_by } }
            let projection = {
              first_name: 1,
              last_name: 1,
              profile_pic:1
            }
            let options = { lean: true }
            let find = await this.model.UserModel.find(query, projection, options)
            return find;
    } catch (error) {
       throw error
    }
  }

  async getUsersSocketIds(joined_by:any) {
    try {
      let query = { _id: { $in: joined_by }}
      let projection = {
        socket_id: 1
      }
      let options = { lean: true }
      let find = await this.model.UserModel.find(query, projection, options)
      let socket_ids = []
      for (let i = 0; i < find.length; i++){
         socket_ids.push(find[i].socket_id) 
      }
      return socket_ids;
    } catch (error) {
       throw error
    }
  }

  async list_stream(payload: dto.paginationsortsearch) {
    try {
      let query = {};
      let { pagination, limit, search, sort_by } = payload;
      if (search) {
        let query =  { name: { $regex: search, $options: 'i' } }
      }
      let projection = { __v:0 }
      let options = await this.set_options(pagination, limit);
      if (sort_by) {
        if (sort_by == sortBy.Newest) {
          options.sort = { _id: -1 };
        } else if (sort_by == sortBy.Oldest) {
          options.sort = { _id: 1 };
        } else if (sort_by == sortBy.Name) {
          options.sort = { first_name: 1 };
        }
      } else {
        options.sort = { _id: -1 };
      }
      let fetch_data = await this.LiveStreamModel.find(query, projection, options);
      return fetch_data;
    } catch (error) {
       throw error
    }
  }

  async check_joined_stream(user_id: any) {
    try {
      let query = { joined_by: new Types.ObjectId(user_id) };
      let fetch_data = await this.LiveStreamModel.findOne( query, { __v: 0 }, { lean: true })
      return fetch_data;
    } catch (error) {
       throw error
    }
  }

  async get_user_data(user_id: any) {
    try {
      let query = { _id: new Types.ObjectId(user_id) };
      let projection = { first_name: 1, last_name: 1, profile_pic: 1 }
      let options = { lean: true }
      let fetch_user = await this.model.UserModel.findOne(query, projection, options);
      return fetch_user;
    } catch (error) {
       throw error
    }
  }


}
