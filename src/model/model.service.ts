import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Session } from 'inspector';
import * as mongoose from 'mongoose';
import { Connection } from 'src/chat/schema/connection.schemas';
import { Group } from 'src/chat/schema/group.schema';
import { Member } from 'src/chat/schema/member.schema';
import { Message } from 'src/chat/schema/message.schemas';
import { Faqs } from 'src/faqs/schema/faqs.schema';
import { Managements } from 'src/management/schema/management.schema';
import { Notifications } from 'src/notification/schema/notifications.schema';
import { Pages } from 'src/pages/schema/pages.schema';
import { Quotes } from 'src/quotes/schema/quotes.schema';
import { Sessions } from 'src/users/schema/sessions.schema';
import { Users } from 'src/users/schema/users.schema';




@Injectable()
export class ModelService {
  constructor(
    @InjectModel('Users') public UserModel: mongoose.Model<Users>,
    @InjectModel('Notifications') public NotificationModel: mongoose.Model<Notifications>,
    @InjectModel('Sessions') public SessionModel: mongoose.Model<Sessions>,
    @InjectModel('Pages') public PagesModel: mongoose.Model<Pages>,
    @InjectModel('Faqs') public FaqsModel: mongoose.Model<Faqs>,
    @InjectModel('Managements') public ManagementsModel: mongoose.Model<Managements>,
    @InjectModel('Connection') public ConnectionModel: mongoose.Model<Connection>,
    @InjectModel('Message') public MessageModel: mongoose.Model<Message>,
    @InjectModel('Member') public MemberModel: mongoose.Model<Member>,
    @InjectModel('Group') public GroupModel: mongoose.Model<Group>,
    @InjectModel('Quotes') public QuotesModel: mongoose.Model<Quotes>,
  ) { }
}
