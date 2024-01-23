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

@Injectable()
export class NotificationService {
  constructor(
    private readonly userService: UsersService,
    private common: CommonService,
    @InjectModel(Notifications.name) private notifications: Model<Notifications>
  ) { }

  async send_notification(payload, req) {
    try {
      let query;
      let data;
      if (payload.type === 1) {
        query = {
          user_type: "user",
          email: { $ne: null }
        };
      } else if (payload.type === 2) {
        if (!payload.emails) {
          throw new HttpException({ message: "Please select emails" }, HttpStatus.BAD_REQUEST);
        }
        query = {
          user_type: "user",
          email: { $in: payload.emails }
        };
        const users = await this.userService.users.find(query, { _v: 0 }, { lean: true });
        const emails = users.map(user => user.email);
        const nonExistingEmails = payload.emails.filter(email => !emails.includes(email));

        if (nonExistingEmails.length > 0) {
          throw new HttpException({
            message: `The following emails do not exist: ${nonExistingEmails.join(", ")}`
          }, HttpStatus.BAD_REQUEST);
        }
      }
      data = {
        subject: payload.subject,
        text: payload.text
      };
      if (query) {
        const users = await this.userService.users.find(query, { _v: 0 }, { lean: true });
        const userIds = users.map((user) => user._id.toString());

        console.log(userIds);
        const emails = users.map(user => user.email);

        data = {
          subject: payload.subject,
          text: payload.text
        };
        await this.common.email_notification(data, emails);
        const createdNotifications = [];
        console.log('userIds:', userIds);
        for (const userId of userIds) {
          const data_to_save = {
            subject: payload.subject,
            text: payload.text,
            user_id: userId,
            created_at: moment.utc().valueOf(),
            updated_at: moment.utc().valueOf()
          };
          const notification = await this.notifications.create(data_to_save);
        }
        return { message: "Email sent successfully" };
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
      let users = await this.userService.users.find(query, { _v: 0 }, { lean: true });
      const data = users.map(user => user.email);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get_notifications_list(req) {
    try {
      let user = req.user.id;
      let query = {
        user_id: user
      }
      let data = await this.notifications.find(query);
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
      let updateResult = await this.notifications.updateMany(query, { $set: { notification_type: 'read' } });
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
      let user = request.user.id;
      let query = {
        _id: id
      }
      let find_id = await this.notifications.findOne(query);
      if (!find_id) {
        throw new HttpException({ message: "No such id exists" }, HttpStatus.NOT_FOUND);
      }
      else {
        let updateResult = await this.notifications.updateOne(query, { $set: { notification_type: 'read' } });
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
