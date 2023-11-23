import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model } from 'mongoose';
import { SignInDto, SignUpDto } from './dto/user.dto';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Sessions } from './schema/sessions.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private model: Model<Users>,
        @InjectModel(Sessions.name) private sessionModel: Model<Sessions>,
        @InjectStripe() private stripe: Stripe
    ) { }
    async signUp(body: SignUpDto) {
        try {
            let existMail = await this.model.find({email:body.email},'email')
            console.log(existMail);
            
           if(existMail == null){
            throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
           }
            const saltOrRounds = 10;
            const password = body.password;
            const hash = await bcrypt.hash(password, saltOrRounds);
            let customer = await this.stripe.customers.create({
                email:body.email,
                name:body.first_name})
            let data = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                password: hash,
                custumer_id: customer.id,
                created_at: moment().utc().valueOf()
            }
            let user = await this.model.create(data)
            return {message:'Sign Up successfully',user}
        } catch (error) {
           return error
        }
    }

    async signIn(body: SignInDto){
        try {
            
        } catch (error) {
            throw error
        }
    }

    findAll() {
        return `This action returns all users`;
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(id: number,) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
