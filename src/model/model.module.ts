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
import { Connection } from 'src/chat/schema/connection.schemas';
import { Message } from 'src/chat/schema/message.schemas';
import { Member } from 'src/chat/schema/member.schema';
import { Group } from 'src/chat/schema/group.schema';
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
      name: 'Connection', schema: Connection
    },
    {
      name: 'Message', schema: Message
    },
    {
      name: 'Member', schema: Member
    },
    {
      name: 'Group', schema: Group
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
