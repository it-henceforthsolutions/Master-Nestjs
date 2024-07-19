import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { captureDto, createPayoutDto, createPlanDto, createProductDto, createSubscriptionDto, PaypalWebhookDto, refundDto, updateSubscriptionDto } from './dto/paypal.dto';
import * as moment from 'moment';
import { PaypalPayment } from './schema/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaypalPlan, PaypalPlanDocument } from './schema/plan.schema';
import { PaypalSubscription } from './schema/subscription.schema';

@Injectable()
export class PaypalService {
  private clientId: string;
  private clientSecret: string;
  private paypalApiBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(PaypalPayment.name) private paymentModel: Model<PaypalPayment>,
    @InjectModel(PaypalPlan.name) private planModel: Model<PaypalPlanDocument>,
    @InjectModel(PaypalSubscription.name) private subscriptionModel: Model<PaypalSubscription>
  ) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_SECRET_KEY');
    this.paypalApiBaseUrl = this.configService.get<string>('PAYPAL_BASE_URL')
  }

  async createPayment(req:any, body:any) {
    try {
      let { amount } = body;
      let { _id: user_id } = req.user_data
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: amount,
              },
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal payment:', error.response.data);
      throw new Error('Error creating PayPal payment');
    }
  }

  async capturePayment(req:any, body: captureDto) {
    try {
      let { paymentId } = body;
      let { _id: user_id } = req.user_data;
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/checkout/orders/${paymentId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error.response.data);
      throw new Error('Error capturing PayPal payment');
    }
  }

  async refundPayment(req: any, body: refundDto) {
    try {
      const { _id: user_id } = req.user_data;
      const { captureId, amount } = body;
      const accessToken = await this.getAccessToken();
      const data = amount ? { amount: { value: amount, currency_code: 'USD' } } : {};
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v2/payments/captures/${captureId}/refund`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error refunding PayPal payment:', error.response?.data || error.message);
      throw new Error('Error refunding PayPal payment');
    }
  }

   async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString('base64')}`,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.response.data);
      throw new Error('Error getting access token');
    }
   }
  
  
  async createProduct(body:createProductDto) {
    try {
      let { name, description, type, category } = body;
      const product = {
        name,
        description,
        type:type, // Or 'PHYSICAL' or 'DIGITAL'
        category: category, // Category of the product
      };
  
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/catalogs/products`,
        product,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
  
      return { product_id: response.data.id };
    } catch (error) {
      console.error('Error creating PayPal product:', error.response?.data || error.message);
      throw new Error('Error creating PayPal product');
    }
  }
    
  async deletePlan(_id: string) {
    try {
      let query = { _id: new Types.ObjectId(_id) }
      let deleted_data = await this.planModel.findOneAndUpdate(query, { is_deleted: true }, { new: true });
      if (deleted_data) {
        return {
          message:"successfully deleted"
        }
      }
    } catch (error) {
       throw error
    }
  }
  
   async createPlan(body: createPlanDto) {
    try {
      let { product_id, name, description, interval, amount } = body;
      console.log('name',name);
      
      let planjson = JSON.stringify({
        name: name,
        description: description,
        product_id: product_id,
        billing_cycles: [
          {
            frequency: {
              interval_unit: interval,
              interval_count: 1
            },
            tenure_type: "REGULAR",  /// REGULAR OR TRAIL
            sequence: 1,
            total_cycles: 0, //// 0 for infinite cycle
            pricing_scheme: {
              fixed_price: {
                value: amount,
                currency_code: "USD"
              }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD"
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3
        }
      });
      
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/billing/plans`,
        planjson,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      
    
      let data_to_save = {
        product_id: product_id,
        planId: response.data.id,
        name,
        description,
        interval,
        amount,
      }
      let data = await this.planModel.create(data_to_save);
      console.log("saved_---  data", data)
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal plan:', error.response?.data || error.message);
      throw new Error('Error creating PayPal plan');
    }
   }
  
  async listPlan() {
    try {
      let query = {
        is_deleted: false,
      }
      let fetch_data = await this.planModel.find(query, { _v: 0 }, { lean: true });
      return fetch_data;
    } catch (error) {
       throw error
    }
  }

  /// standard subscription
  async createSubscription(req: any, body: createSubscriptionDto) {
    try {
      const { _id: user_id } = req.user_data;
      const { plan_id } = body;
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/billing/subscriptions`,
        {
          plan_id: plan_id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal subscription:', error.response?.data || error.message);
      throw new Error('Error creating PayPal subscription');
    }
  }

  // subcription with delay and free trail
  async createSubscription2(req: any, body: createSubscriptionDto) {
    try {
      const { _id: user_id } = req.user_data;
      const { plan_id } = body;
      let check_subs = await this.subscriptionModel.find({ user_id: new Types.ObjectId(user_id), status:"active" }, {__v:0},{lean:true});
      if (check_subs.length) {
          return {
              message:'Already have subscription'
            }
      }
      let fetch_plan:any = await this.planModel.find({ plan_id: plan_id })
      let { interval_count, interval_unit } = fetch_plan[0]
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/billing/subscriptions`,
        {
          plan_id: plan_id,
          application_context: {
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      let start_time = moment(response.data.start_time).utc().valueOf(); // Convert start_time to Unix timestamp in milliseconds
      console.log('start_time2', Number(start_time));

    let data_to_save = {
      user_id: user_id,
      plan_id: plan_id, // MongoDB document _id
      subscription_id: response.data.id,
      status: response.data.status,
      start_date: Number(start_time),
      renewal_date: Number(moment(start_time).add(interval_count, interval_unit).valueOf()) /// need to correct
    };
      await this.subscriptionModel.create(data_to_save);
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      throw new Error('Error creating PayPal subscription');
    }
  }

  async handleWebhook(body: PaypalWebhookDto) {
    const { event_type, resource } = body;
    if (event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      await this.updateSubscriptionStatus(resource.id, 'ACTIVE');
    } else if (event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      await this.updateSubscriptionStatus(resource.id, 'CANCELLED');
    }else if (event_type === 'BILLING.SUBSCRIPTION.RENEWED') {
      // Update subscription status to 'RENEWED' and calculate the next renewal date
      const { plan_id, start_time } = resource;
      let fetch_plan:any = await this.planModel.find({ plan_id: plan_id })
      let { interval_count, interval_unit } = fetch_plan[0]
      const renewal_date = Number(moment(start_time).add(interval_count, interval_unit).valueOf());
      await this.updateSubscriptionStatus(resource.id, 'ACTIVE', renewal_date);
    }
  }

  async updateSubscriptionStatus(subs_id: string, status:string, renewalDate?: number) {
    try {
      let update:any = {
        status
      }
      if (renewalDate){
        update.renewal_date = renewalDate;
      }
      return await this.subscriptionModel.findOneAndUpdate({ subscription_id: subs_id },update,{ new:true } )
    } catch (error) {
       throw error
    }
  }

  async 

  async activeSubscription(req: any) {
    try {
      let { id: user_id } = req.user_data;
      let query = { user_id: new Types.ObjectId( user_id ), status: "active" }
      let fetch_data = await this.subscriptionModel.find(query, { _v: 0 }, { lean: true })
      return fetch_data[0];
    } catch (error) {
       throw error
    }
  }

  async getSubscriptionDetails(req:any, subscriptionId: string) {
    try {
      const response = await axios.get(
        `${this.paypalApiBaseUrl}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting subscription details:', error.response?.data || error.message);
      throw new Error('Error getting subscription details');
    }
  }


  async updateSubscriptionPlan( req:any, body: updateSubscriptionDto ) {
    try {
      let { plan_id: newPlanId } = body
      let { _id: user_id } = req.user_data;
      let check_subs = await this.subscriptionModel.find({ user_id: new Types.ObjectId(user_id), status: "active" }, { __v: 0 }, { lean: true });
      if (!check_subs.length) {
        return {
           message:"You don't have active subsciption to update"
         }
      }
      const response = await axios.patch(
        `${this.paypalApiBaseUrl}/v1/billing/subscriptions/${check_subs[0].subscription_id}`,
        [
          {
            op: 'replace',
            path: '/plan_id',
            value: newPlanId,
          }
        ],
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );

      let start_time = moment(response.data.start_time).utc().format('x').valueOf()
      let data_to_update = {
        plan_id: newPlanId, 
        start_date: Number(start_time),
        renewal_date: moment(start_time).add(1,'M').valueOf() /// need to correct
      }
      await this.subscriptionModel.findOneAndUpdate({_id: check_subs[0]._id}, data_to_update,{ new:true });
      return response.data;
    } catch (error) {
      console.error('Error updating PayPal subscription plan:', error.response?.data || error.message);
      throw new Error('Error updating PayPal subscription plan');
    }
  }

  async cancelSubscription(req:any ) {
    try {
      let { _id: user_id } = req.user_data;
      let check_subs = await this.subscriptionModel.find({ user_id: new Types.ObjectId(user_id), status: "active" }, { __v: 0 }, { lean: true });
      if (check_subs) {
        return {
           message:"You don't have active subscription"
         }
      }
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/billing/subscriptions/${check_subs[0].subscription_id}/cancel`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      let data_to_update = {
        status:'cancelled'
      }
      await this.subscriptionModel.findOneAndUpdate({_id: check_subs[0]._id}, data_to_update,{ new:true });
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error.response?.data || error.message);
      throw new Error('Error canceling subscription');
    }
  }

  async createPayout(body: createPayoutDto) {
    try {
      let { paypal_email, amount } = body;
      let date = +new Date()
      let body_data = JSON.stringify({
        sender_batch_id: `Payouts_${date}`,    /////UNIQUE ID 
        email_subject: "You have a payout!",
        email_message: "You have received a payout! Thanks for using our service!",
        items: [
          {
            recipient_type: "EMAIL",
            amount: {
              value: amount,
              currency: "USD"
            },
            note: "Thanks for your service!",
            sender_item_id: `test_check_${date}`,
            receiver: paypal_email,
          }
        ]
      })
      const response = await axios.post(
        `${this.paypalApiBaseUrl}/v1/payments/payouts`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating PayPal payout:', error.response?.data || error.message);
      throw new Error('Error creating PayPal payout');
    }
  }
  
  
}

