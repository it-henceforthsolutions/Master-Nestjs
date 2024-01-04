import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import * as dto from '../dto/index'
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe'
// import { ModelService } from 'src/model/model.service';
// import { DAO } from 'src/DAO/queries';
import { on } from 'events';
import * as moment from 'moment'
import { Plan } from './schema/plan';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as dto from './dto/index'
@Injectable()
export class StripeService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    // @InjectModel(Plan.name) private plan: Model<Plan>
  ) { }
  async createCustomer(body: any) {
    try {
      let { email, first_name } = body;
      //  let name= 
      //     console.log('name,',name);
      let data = {
        name: first_name ? first_name : email.split('@')[0],
        email: email.toLowerCase()
      }
      let customer = await this.stripeClient.customers.create(data)
      // console.log('create........',customer);
      return customer;
    } catch (error) {
      throw error
    }
  }

  // async create_plan(body: plan) {
  //   try {
  //     let { name, description, amount, interval, interval_count, currency, highlights } = body;

  //     let add_product = await this.stripeClient.products.create({
  //       name: name,
  //       description: description
  //     })
  //     if (add_product) {
  //       let { id: product_id } = add_product;
  //       let data: any = {
  //         amount: amount * 100,
  //         currency: currency,
  //         interval: interval,
  //         interval_count: interval_count || 1, // Default to 1 if not provided in req.body
  //         product: product_id,
  //       }

  //       let create_plan = await this.stripeClient.plans.create(data)
  //       if (create_plan) {
  //         let { id: plan_id } = create_plan;
  //         let data_to_save = {
  //           name,
  //           description,
  //           amount,
  //           product_id,
  //           interval,
  //           interval_count,
  //           plan_id,
  //           is_delete: false,
  //           highlights,
  //           created_at: moment().utc().valueOf()
  //         }
  //         // let plan = await this.plan.create(data_to_save)
  //         // return plan
  //       } else {
  //         throw new InternalServerErrorException("Error in creating plan")
  //       }
  //     } else {
  //       throw new InternalServerErrorException("Error in creating plan")
  //     }
  //   } catch (error) {
  //     throw error
  //   }
  // }

  async checkout_session(body: any, req: any) {
    try {
      console.log(body);
      
      // let { _id: user_id } = req.user_data
      let { success_url, cancel_url } = body
      let price= await this.create_price(body)
      const session = await this.stripeClient.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          user_id: "user_id"
        }
      });

      return session.url


    } catch (error) {
      throw error
    }
  }

  async create_price(body: dto.checkoutSession) {
    try {
      // let domain = 'https://master.project.henceforthsolutions.com:3000/'

      let { total_price } = body
      const price = await this.stripeClient.prices.create({
        currency: 'usd',
        unit_amount: total_price,
        product_data: {
          name: 'total price of product user'
        }
      });
      console.log(price);

      return price


    } catch (error) {
      throw error
    }
  }

}
