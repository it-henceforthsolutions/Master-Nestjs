import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, connection } from 'mongoose';
import * as dto from './dto/index';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { aggregate } from './chat.aggregation';
import { aggregate2 } from './chat.aggregation2';
import { Type } from 'class-transformer';
import * as moment from 'moment';
import { sortBy } from './dto/chat2';
import { Member, member_role } from './schema/member.schema';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constant';
import { Connection, connectionSchema } from './schema/connection.schemas';
import { Message } from './schema/message.schemas';
import { Group } from './schema/group.schema';
import { message_deleted_type } from 'utils';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Connection.name) private connectionModel: Model<any>,
    @InjectModel(Message.name) private messageModel: Model<any>,
    @InjectModel(Member.name) private membersModel: Model<any>,
    @InjectModel(Group.name) private groupsModel: Model<any>,
    private userservices: UsersService,
    private jwtService: JwtService,
  ) {}

  async updateUserSocketid(token: any, socket_id: string, is_connect:boolean) {
    //console.log('update running');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      let { id: user_id } = payload;
      let query = { _id: new Types.ObjectId(user_id) };
      let update:any 
      if(is_connect===true){
        update = { socket_id: socket_id, last_seen: moment().utc().valueOf(), chat_active:true };
      }else {
        update = { last_seen: moment().utc().valueOf(), chat_active:false };
      }
      let options = { new: true };
      let updated_data = await this.userservices.findupdateUser(
        query,
        update,
        options,
      );
      //console.log(updated_data);
      return updated_data;
    } catch (error) {
      throw error;
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
                $and: [{ sent_by: new Types.ObjectId(sent_by) }, { sent_to: new Types.ObjectId(sent_to) }],
              },
              {
                $and: [{ sent_by: new Types.ObjectId(sent_to) }, { sent_to: new Types.ObjectId(sent_by) }],
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
      } else if (!!sent_by && !!group_id) {
        //console.log(sent_by, group_id)
        data_to_save = {
          group_id,
        };
      }
      let connection = await this.connectionModel.create(data_to_save)
      
      let response = await this.create_connection_response(
        connection._id,
        payload
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
          let group = await this.groupsModel.findOne( query2, projection, options );
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
          let user = await this.userservices.getUserData( query2, projection, options );
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

  async saveMessage(sent_by: string, payload: dto.sendMessage, connection_data:any) {
    //dto.sendMessage) {
    try {
     let  { sent_to, group_id } = connection_data
      let {
        message,
        connection_id,
        media_url,
        message_type,
        type,
      } = payload;
     
      console.log("sent_By==>",new Types.ObjectId(sent_by))
      
     if(sent_to){
      console.log("sent_to==>",connection_data?.sent_to?._id)
      if (sent_by === connection_data?.sent_to?._id.valueOf()){ ///sent_by == user_id
        sent_to = connection_data.sent_by
        console.log("match")
      }
     }
      let data_to_save = {
        group_id,
        sent_by,
        type,
        sent_to:sent_to,
        message,
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
      throw error
    }
  }

  async readMessage(user_id: string, payload: dto.readMessage) {
    try {
      let { message_id } = payload;
      let query = { _id: new Types.ObjectId(message_id)  };
      let update = { $addToSet: { read_by: new Types.ObjectId(user_id) }, updated_at:moment().utc().valueOf() };
      let options = { new: true };
      const response = await this.messageModel.findOneAndUpdate(
        query,
        update,
        options,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllMessage(payload: dto.join_connection, pagin?:dto.pagination, user_id?:string) {
    try {
      let { connection_id } = payload;
     
      let query = { connection_id: new Types.ObjectId(connection_id), deleted_for: { $nin:[new Types.ObjectId(user_id)] }, };
      let projection = {
        sent_to: 1,
        sent_by: 1,
        message: 1,
        read_by: 1,
        created_at: 1,
        updated_at:1,
        media_url: 1,
      };
      let options:any = { lean: true };
      if(pagin?.pagination || pagin?.limit ){
        options = await this.set_options(pagin?.pagination,pagin?.limit )
      }
      options.sort= {
        _id:-1
      }
      let populate1 = [
        { path: 'sent_by', select: 'first_name, last_name, profile_pic ' },
        { path: 'sent_to', select: 'first_name, last_name, profile_pic ' },
        { path: 'connection_id', select: 'updated_at group_id' ,populate:{ path:"group_id" ,select:"name image description"} },
      ];
      let response = await this.messageModel
        .find(query, projection, options)
        .populate(populate1)
        .exec();
      // let data=await this.messageModel.find(query,{sent_to:1,sent_by:1,message:1},{lean:true})
      let count = await this.messageModel.countDocuments(query)
      let update = { $addToSet: { read_by: user_id }, updated_at:moment().utc().valueOf() };
      let updated_Data = await this.messageModel.updateMany(query, update, {new:true})
      return {
        count: count,
        data: response
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserList(user_id: any, pagin?:dto.pagination) {
    try {
     
      let query1 = { user_id: new Types.ObjectId(user_id) };
      let projection = { group_id: 1 };
      let options = { lean: true };
      let gruop = await this.membersModel.find(query1, projection, options).exec();
      let options2 = await this.set_options(pagin?.pagination, pagin?.limit)
      let pagin_status:boolean=false
      if(pagin?.pagination || pagin?.limit){
        pagin_status=true 
      }
	  let ids =[]
	  if(gruop && gruop.length){
		for(let i = 0; i< gruop.length;i++){
			ids.push(gruop[i].group_id)
		}
	  }
    //console.log(ids)
      let query: any = [
        await aggregate.match(user_id,ids),
        await aggregate.set_data(user_id),
        await aggregate.lookupUser(),
        await aggregate.unwindUser(),
        await aggregate.lookup_group(),
        await aggregate.unwindGroup(),
        await aggregate.lookupMessage(user_id),
        await aggregate.unread_messages(),
        await aggregate.group_data(user_id),
        await aggregate.remove_same_user_data(user_id),
        await aggregate.facetData(options2.skip, options2.limit, pagin_status ),
        { $sort: { updated_at: -1 } },
      ];
      let data: any = await this.connectionModel.aggregate(query);
      console.log("Dta===>",data)
      return {
        count: data[0].metadata[0]?.count ? data[0].metadata[0]?.count : 0,
        data: data[0]?.data,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage ( user_id: string, payload:any )  {
    try {
      let { message_id, deleted_type } = payload
      let query = { _id: new Types.ObjectId(message_id) };
      let projection = { __v:0 }
      //let update = { is_read: true };
      let options = { new: true };
      let response: any = await this.messageModel.find(
        query,
        projection,
        options
      );
      let data_to_update: any;
      if (response.length) {
        let { sent_by, sent_to } = response[0];
        if (new Types.ObjectId(user_id) == sent_by && deleted_type == message_deleted_type.BOTH ) {
          data_to_update = {
            $push: { deleted_for: { $each: [new Types.ObjectId(sent_by), new Types.ObjectId(sent_to)] } },
          };
        } else {
          data_to_update = { deleted_for: new Types.ObjectId(user_id) };
        }
      } else {
        throw {
          type: "NOT_FOUND",
          error_message: "request message not exits or already deleted",
        };
      }
      const updated_data: any = await this.messageModel.findOneAndUpdate(
        query ,
        data_to_update,
       options
      );
      //console.log("updated_at", updated_data)
      return { type: "SUCCESS", message: `${updated_data._id} is deleted` };
    } catch (error) {
      throw error;
    }
  };

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
  async get_connection(connection_id:string) {
    try {
      if(!connection_id) throw Error("Connection_id is mandatory")
      let query = {_id: new Types.ObjectId(connection_id)};
      let projection = { __v: 0 };
      let options = { lean: true };
      let connections = await this.connectionModel.findOne(
        query,
        projection,
        options,
      ).populate([{path:"sent_to",select:'socket_id'},{path:"sent_by", select:'socket_id'}]).exec()
      if(!connections)  throw  Error("Connection not found")
      console.log("connection==>", connections)
      return connections;
    } catch (err) {
      throw err;
    }
  }

  async get_socket_id_by_connection(_id:string){
    let connection = await this.get_connection(_id)
    let { group_id, sent_to} = connection;
    let socket_ids:any
    if(group_id){
      socket_ids = await this.getGroupSocketids(group_id)
    }
    else if(sent_to){
      socket_ids = [connection.sent_by.socket_id, connection.sent_to.socket_id]
    }
    console.log("socket_ids==>", socket_ids)
    return socket_ids
  }

  async getGroupSocketids(group_id: string) {
    try {
      let query = { group_id: new Types.ObjectId(group_id)}
      let users = await this.membersModel.find(query).populate({path:"user_id",select:"socket_id"}).exec()
      //console.log('socket_ids of users:', users);
      let socket_ids = users.map((res) => res.user_id.socket_id);
      return socket_ids;
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
      let check_group = await this.groupsModel.findOne({created_by:new Types.ObjectId(user_id), name: body.name })
      if(check_group){
        throw new BadRequestException("You have already created the group with same name")
      }
      let data_to_save = {
        name: body?.name,
        image: body?.image,
        description: body?.description,
        created_by: user_id,
      };
      let saved_data:any = await this.groupsModel.create(data_to_save);
      let data_to_save2 = {
        group_id: saved_data._id,
        user_id: user_id,
        role: member_role.ADMIN,
        created_at: moment().utc().valueOf()
      }
      let member = await this.membersModel.create(data_to_save2);
      //console.log("mbmer",member)
      let group_data ={ group_id: saved_data._id}
      let create_connection = await this.createConnection(user_id, group_data)
      let response = {
        group_data: saved_data,  connection_id:create_connection._id , members:[member]
      }
      return response
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
      let check_admin = await this.membersModel.findOne(
        admin_query ,
        { __v: 0 },
        {lean:true},
      );
    
      if (!check_admin) throw new BadRequestException('You are not admin of this group');
      let members_to_save = members.map((_id) => {
        return {
          user_id: new Types.ObjectId(_id),
          group_id: new Types.ObjectId(group_id),
          created_at: moment().utc().valueOf(),
        };
      });

      let new_members_to_save:any =[]
      for(let member of members_to_save){
        let query ={ group_id: member.group_id, user_id: member.user_id }
        let check_member = await this.membersModel.findOne(query)
        if(!check_member){
          new_members_to_save.push(member)
        }
      }
      let saved_data = await this.membersModel.insertMany(new_members_to_save);
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
      let data = await this.groupsModel.aggregate(query);
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
      let data = await this.membersModel
        .find(query, projection, options)
        .populate(populate)
        .exec();
      let count = await this.membersModel.countDocuments(query)
      return {
        count:count,
        data:data
     }
    } catch (error) {
      throw error;
    }
  }

  async getUsers(quer: dto.paginationsortsearch) {
    try {
      let { pagination, limit, sort_by, search } = quer;
      let options: any = await  this.set_options(pagination, limit);
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
      let query:any = { is_deleted:false };
      if (search) {
        let new_search:any = search.split(' ')
        query.$or = [
          { first_name: { $regex: search, $options: "i" } },
          {last_name: { $regex: search, $options: "i" }},
          {email:{ $regex: search, $options: "i" }},
          {  $and: [ 
            { first_name :{ $regex: new_search[0].toString(), $options:'i'}},
            { last_name :{ $regex: new_search[1]?new_search[1].toString():'', $options:'i'}}
          ]
          }
        ]
      }
      let projection = { _id: 1, first_name: 1, last_name: 1, profile_pic: 1 };
      let data = await this.userservices.getUsers(query, projection, options);
      let alluser = await this.userservices.getUsers(query, projection,{ lean:true } )
      return {
        count:alluser.length,
        data: data,
      }
    } catch (error) {
      throw error;
    }
  }

  async leaveConnection (connection_id:string, user_id:string){
    try {
      let connection = await this.get_connection(connection_id)
      if(connection.group_id != null){
        let query = { group_id: connection.group_id, user_id: user_id }
        let member = await this.membersModel.deleteMany(query)
      }else{
        let query = { sent_to: new Types.ObjectId(user_id) , connection_id: connection_id }
        let deleted = await this.connectionModel.findOneAndUpdate(query, {sent_to: null }, {new:true })
        if(!deleted){
          let query1 =  { sent_by: new Types.ObjectId(user_id), connection_id: connection_id }
           await this.connectionModel.findOneAndUpdate(query, {sent_by: null }, { new:true })
        }
        
      }
      return true
    } catch (error) {
      throw error
    }
  }

  async connection_details (user_id:string, connection_id: string){
    try {
      let query = {_id: new Types.ObjectId(connection_id)};
      let projection = { __v: 0 };
      let options = { lean: true };
      let populate_to = [
        { path: "sent_to", select: 'first_name last_name profile_pic chat_active email phone temp_mail temp_phone last_seen' },
        { path: "sent_by", select: 'first_name last_name profile_pic chat_active email phone temp_mail temp_phone last_seen' },
        { path: "group_id", select: 'name image' }
      ]
      let connections :any= await this.connectionModel.findOne(
        query,
        projection,
        options,
      ).populate(populate_to).exec()
     let members:any= null;
     let member_count:number = 2
     let group_data:any= null;
     let other_user:any = null;
      if(connections.group_id){
         group_data = await this.groupsModel.findOne({_id:connections.group_id},{__v:0},{lean:true})
        let membersQuery = { group_id : connections.group_id}
        let projection = { _id:0 , created_at:0, group_id:0, __v:0, }
        members = await this.membersModel.find(membersQuery, projection, {lean:true , limit:5 }).populate(   { path: "user_id", select: 'first_name last_name profile_pic' },).exec()
        member_count = await this.membersModel.countDocuments(membersQuery)
      }else if(connections?.sent_by){
         if(connections.sent_by._id == user_id){
          other_user = connections.sent_to
         }else {
           other_user = connections.sent_by
         }
      }
      return {
        _id: connections._id,
        other_user_id:other_user?._id?? null,
        other_user:other_user,
        group_id: group_data?._id?? null,
        group: group_data,
        group_member:members,
        member_count
      };
    } catch (err) {
      throw err;
    }
  }
}
