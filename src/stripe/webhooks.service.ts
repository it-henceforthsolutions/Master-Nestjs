import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from 'src/users/schema/users.schema';

@Injectable()
export class WebhooksService {
constructor(
    // @InjectModel(Users.name) private : Model<Users>,
){
    
}
    async webhooks(req: any) {
        try {
            let data = req.body
            console.log('webhooks_data', data);
            let { id, object, status } = req.body?.data?.object
            console.log('webhooks_status',status);
            
            // switch (req.body.type) {
            //     case 'customer.subscription.deleted':
            //         if (object === 'subscription') {
            //             let query = {
            //                 subscription_id: id
            //             }
            //             let data_to_update = {
            //                 status: status
            //             }
            //             await this.model.subscriptionModel.findOneAndUpdate(query, data_to_update, { new: true })
            //         }
            //         break
            //     case 'customer.subscription.updated':
            //         if (object === 'subscription') {
            //             let query = {
            //                 subscription_id: id
            //             }
            //             let data_to_update = {
            //                 status: status
            //             }
            //             await this.model.subscriptionModel.findOneAndUpdate(query, data_to_update, { new: true })
            //         }
            //         break;
            // }
            return data
        } catch (error) {
            throw error
        }
    }

}
