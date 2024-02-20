import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelService } from './model.service';
import { Users, UsersModel } from 'src/users/schema/users.schema';
import { Sessions, SessionsModel } from 'src/users/schema/sessions.schema';
import { Pages } from 'src/pages/schema/pages.schema';
import { Faqs } from 'src/faqs/schema/faqs.schema';
import { Notifications } from 'src/notification/schema/notifications.schema';
import { Managements } from 'src/management/schema/management.schema';
import { Connections } from 'src/chat/schema/connection.schemas';
import { Messages } from 'src/chat/schema/message.schemas';
import { Members } from 'src/chat/schema/member.schema';
import { Groups } from 'src/chat/schema/group.schema';
import { Quotes } from 'src/quotes/schema/quotes.schema';

@Global()
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),

  MongooseModule.forFeature([
    {
      name: 'Users', schema: Users,
    },
    {
      name: 'Sessions', schema: Sessions,
    },
    {
      name: 'Pages', schema: Pages
    },
    {
      name: 'Faqs', schema: Faqs
    },
    {
      name: 'Notifications', schema: Notifications
    },
    {
      name: 'Managements', schema: Managements
    },
    {
      name: 'Connections', schema: Connections
    },
    {
      name: 'Messages', schema: Messages
    },
    {
      name: 'Members', schema: Members
    },
    {
      name: 'Groups', schema: Groups
    },
    {
      name: 'Quotes', schema: Quotes
    }
  ])
  ],
  providers: [ModelService],
  exports: [ModelService]
})
export class ModelModule { }
