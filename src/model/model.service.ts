import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Session } from 'inspector';
import * as mongoose from 'mongoose';
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
    @InjectModel(Users.name) public UserModel: mongoose.Model<Users>,
    @InjectModel(Notifications.name)
    public NotificationModel: mongoose.Model<Notifications>,
    @InjectModel(Sessions.name) public SessionModel: mongoose.Model<Sessions>,
    @InjectModel(Pages.name) public PagesModel: mongoose.Model<Pages>,
    @InjectModel(Faqs.name) public FaqsModel: mongoose.Model<Faqs>,
    @InjectModel(Managements.name)
    public ManagementsModel: mongoose.Model<Managements>,
    @InjectModel(Quotes.name) public QuotesModel: mongoose.Model<Quotes>,
  ) {}
}
