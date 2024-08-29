import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as  moment from 'moment';
import { Model } from 'mongoose';
import { Subject } from 'rxjs';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { Notifications } from './schema/notifications.schema';
import { InjectModel } from '@nestjs/mongoose';
import { notification_type } from 'utils';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { ModelService } from 'src/model/model.service';

@Injectable()
export class NotificationService {
  constructor(
    private model: ModelService,
    private common: CommonService,
  ) { }


  //  
  
  async send_notification(payload, admin_id) {
    try {
      let query;
      let data;
      if (payload.type === 1)  //all_user 
      {
          query = {
          user_type: "user",
      
        };
      } else if (payload.type === 2) //Selected_user
       {
        if (!payload.emails) {
          throw new HttpException({ message: "Please select emails" }, HttpStatus.BAD_REQUEST);
        }
        query = {
          user_type: "user",
          email: { $in: payload.emails }  
        };
      }
        console.log("query",query)
        const users = await this.model.UserModel.find(query, { _v: 0 }, { lean: true });
        console.log("query",query)
        console.log("users",users)
        const emails = users.map(user => user.email);

        console.log("emails",emails)
        const nonExistingEmails = payload.emails.filter(temp_mail => !emails.includes(temp_mail));

        if (nonExistingEmails.length > 0) {
          throw new HttpException({
            message: `The following emails do not exist: ${nonExistingEmails.join(", ")}`
          }, HttpStatus.BAD_REQUEST);
        }
      
      data = {
        subject: payload.subject,
        text: payload.text
      };
      if (query) {
        const users = await this.model.UserModel.find(query, { _v: 0 }, { lean: true });
        const userIds = users.map(user => user._id.toString());
        let user_fcm_tokens=await this.model.SessionModel.find({user_id:userIds})
        console.log(userIds);
        console.log("user_fcm_tokens",user_fcm_tokens);
        const emails = users.map(user => user.email);
        const fcm_token = user_fcm_tokens.map(user_fcm_token => user_fcm_token.fcm_token);
        data = {
          subject: payload.subject,
          text: payload.text
        };
        //add push 
        if(payload.notification_type == 1){
          console.log('user_fcm_tokens[0].fcm_token',fcm_token)
        await this.common.push_notification(data,fcm_token)

        }

        if(payload.notification_type == 2){

          await this.common.email_notification(data, emails);
          
        }
        const createdNotifications = [];
        console.log('userIds:', userIds);
        for (const userId of userIds) {
          const data_to_save = {
            subject: payload.subject,
            text: payload.text,
            user_id: userId,
            from_id:admin_id,
            created_at: moment.utc().valueOf(),
            updated_at: moment.utc().valueOf()
          };
          const notification = await this.model.NotificationModel.create(data_to_save);
        }
        return { message: "Notification sent successfully" };
      }
    } catch (error) {
      throw error;
    }
  }

  async list_emails() {
    try {
      let query = {
        email: { $ne: null },
        user_type: "user"
      }
      let users = await this.model.UserModel.find(query, { _v: 0 }, { lean: true });
      const data = users.map(user => user.email);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get_notifications_list(req) {
    try {
      let user_id = req.user_data._id;
      let query = {
        user_id: user_id
      }
      let data = await this.model.NotificationModel.find(query);
      let unreadNotifications = data.filter(notifications => notifications.notification_type === "unread");
      let readNotifications = data.filter(notifications => notifications.notification_type === "read");

      let unread_count = unreadNotifications.length;
      let read_count = readNotifications.length;

      return {
        "unread": unreadNotifications,
        "unread_count": unread_count,
        "read": readNotifications,
        "read_count": read_count
      }
    } catch (error) {
      throw error;
    }
  }

  async mark_all_read(req) {
    try {
      let user = req.user.id;
      let query = {
        user_id: user,
        notification_type: "unread",
      };
      let updateResult = await this.model.NotificationModel.updateMany(query, { $set: { notification_type: 'read' } });
      if (updateResult.modifiedCount > 0) {
        throw new HttpException({ message: "Successfully marked as read" }, HttpStatus.OK);
      }
      else {
        throw new HttpException({ message: "Nothing to mark as read" }, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw error;
    }
  }

  async read_notification(id, request) {
    try {
      let user_id = request.user_data._id;
      let query = {
        _id: id
      }
      let find_id = await this.model.NotificationModel.findOne(query);
      if (!find_id) {
        throw new HttpException({ message: "No such id exists" }, HttpStatus.NOT_FOUND);
      }
      else {
        let updateResult = await this.model.NotificationModel.updateOne(query, { $set: { notification_type: 'read' } });
        if (updateResult.modifiedCount > 0) {
          throw new HttpException({ message: "Successfuly marked as read" }, HttpStatus.OK);
        }
        else {
          throw new HttpException({ message: "Nothing to mark as read" }, HttpStatus.BAD_REQUEST);
        }
      }
    } catch (error) {
      throw error;
    }
  }

}
