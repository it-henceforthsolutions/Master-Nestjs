import { Global, Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersModel } from 'src/users/schema/users.schema';
import { Sessions, SessionsModel } from 'src/users/schema/sessions.schema';
import { ConnectionSchema } from 'src/chat/schema/connections';
import { BlockSchema } from 'src/chat/schema/block';
import { MessageSchema } from 'src/chat/schema/message';
import { InvitationSchema } from 'src/chat/schema/invitation';
import { NotificationSchema } from 'src/chat/schema/notification';

@Global()
@Module({
  imports: [   MongooseModule.forFeature([
    {  name: Users.name ,schema: UsersModel},
    {  name: Sessions.name ,schema: SessionsModel},
    {  name: "connections" ,schema: ConnectionSchema },
    {  name: "blocks" ,schema: BlockSchema },
    { name: "messages", schema: MessageSchema },
    { name: "invitations", schema: InvitationSchema },
    { name: "notifications", schema: NotificationSchema },
  ]) 
  ],
  providers: [ModelService],
  exports:[ModelService]
})
export class DatabaseModule {}
