import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blocks } from 'src/chat/schema/block';
import { Connections } from 'src/chat/schema/connections';
import { Messages } from 'src/chat/schema/message';
import { Notifications } from 'src/chat/schema/notification';
import { Sessions } from 'src/users/schema/sessions.schema';
import { Users } from 'src/users/schema/users.schema';

@Global()
@Injectable()
export class ModelService {
   constructor(  
    @InjectModel(Users.name) public users  : Model<Users>,
    @InjectModel(Sessions.name) public sessions : Model<Sessions>,
    @InjectModel("connections") public connections : Model<Connections>,
    @InjectModel("blocks") public blocks: Model<Blocks>,
    @InjectModel("messages") public messages: Model<Messages>,
    @InjectModel("invitations") public invitations: Model<any>,
    @InjectModel('notifications') public notifications: Model<Notifications>,
    ){

   }
}
