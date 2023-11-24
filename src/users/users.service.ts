import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model, Types } from 'mongoose';
import { ForgetPassDto, NewPassOtpDto, OtpDto, ResetPassDto, SignInDto, SignUpDto } from './dto/user.dto';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Sessions } from './schema/sessions.schema';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as randomString from "randomstring";


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private model: Model<Users>,
        @InjectModel(Sessions.name) private sessionModel: Model<Sessions>,
        @InjectStripe() private stripe: Stripe,
        private jwtService: JwtService,
        private mailerService: MailerService
    ) { }
    async signUp(body: SignUpDto) {
        try {
            let existMail = await this.model.find({ email: body.email }, 'email')
            console.log(existMail);
            if (existMail == null) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let otp = Math.floor(1000 + Math.random() * 9000);
            let hash = await this.encriptPass(body.password)
            let customer = await this.stripe.customers.create({
                email: body.email,
                name: body.first_name
            })
            let data = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone: body.phone,
                password: hash,
                custumer_id: customer.id,
                otp: otp,
                created_at: moment().utc().valueOf()
            }
            let user = await this.model.create(data)
            await this.verification(user.email, otp)
            let payload = { id: user._id, email: user.email }
            let access_token = await this.jwtService.signAsync(payload)
            await this.sessionModel.create({
                user_id: user?._id,
                access_token: access_token,
                user_type: user.user_type
            })
            return { access_token, user }
        } catch (error) {
            return error
        }
    }

    async encriptPass(pass: string){
        try{
            const saltOrRounds = 10;
            const password = pass;
            return await bcrypt.hash(password, saltOrRounds);
        }catch(error){
            throw error
        }
    }

    async verification(email: string, otp) {
        try {
            return await this.mailerService
                .sendMail({
                    to: `${email}`,
                    from: `mohini.henceforth@gmail.com`,
                    subject: 'Verify User',
                    text: ` OTP :${otp}`
                });
        } catch (error) {
            throw error
        }
    }

    async verifyEmail(body: OtpDto, id: string) {
        try {
            let user = await this.model.findById({ _id: new Types.ObjectId(id) })
            if (user.otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_email_verify: true },
                { new: true }
            )
            throw new HttpException('OTP Verified', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async verifyOtp(body: NewPassOtpDto){
        try {
            let user = await this.model.findOne({unique_id:body.unique_id})
            if(user.otp != body.otp){
                throw new HttpException('Invalid OTP',HttpStatus.BAD_REQUEST)
            }
            throw new HttpException('OTP Verification Completed. Kindly Reset Your Password',HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async signIn(body: SignInDto) {
        try {
            let user = await this.model.findOne({ email: body.email })
            const isMatch = await bcrypt.compare(body.password, user?.password);
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.UNAUTHORIZED);
            }
            let payload = { id: user._id, email: user.email }
            let access_token = await this.jwtService.signAsync(payload)

            await this.sessionModel.create({
                user_id: user?._id,
                access_token: access_token,
                user_type: user.user_type
            })
            return { user, access_token }
        } catch (error) {
            throw error
        }
    }

    async forgetPassword(body: ForgetPassDto) {
        try {
            let user = await this.model.findOne({ email: body.email })
            if (!user) {
                throw new HttpException('This User is no Exist', HttpStatus.BAD_REQUEST)
            }
            let otp = Math.floor(1000 + Math.random() * 9000);
            let uniqueId = randomString.generate({
                length: 7,
                charset: 'alphanumeric'
            })
            await this.verification(user.email, otp)
            await this.model.findOneAndUpdate(
                { _id: user._id },
                { otp: otp, unique_id: uniqueId },
                { new: true }
            )
            return { message: 'Check Your Registered Mail', uniqueId }
        } catch (error) {
            throw error
        }
    }

    async resetPassward(body: ResetPassDto) {
        try {
            let pass = await this.encriptPass(body.new_password)
            console.log(pass,'pass');
            
            let data = await this.model.findOneAndUpdate(
                { unique_id: body.unique_id },
                { password: pass },
                { new: true }
            )
            console.log(data,body);
            throw new HttpException('Password Reset Successfully', HttpStatus.OK)
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

    async update(id: string, body: UpdateUserDto) {
        try {
            let data = { updated_at: moment().utc().valueOf(), ...body }
            let updatedUser = await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            return updatedUser
        } catch (error) {
            throw error
        }
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
