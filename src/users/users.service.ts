import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model, Types } from 'mongoose';
import { ForgetPassDto, NewPassOtpDto, OtpDto, ResetPassDto, SignInDto, SignUpDto, SocialSignInDto } from './dto/user.dto';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Sessions } from './schema/sessions.schema';
import { JwtService } from '@nestjs/jwt';
import { UpdateEmailDto, UpdatePhoneDto, UpdateUserDto } from './dto/update-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import * as randomString from "randomstring";
import axios from 'axios';
import { TwilioService } from 'nestjs-twilio';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private model: Model<Users>,
        @InjectModel(Sessions.name) private sessionModel: Model<Sessions>,
        @InjectStripe() private stripe: Stripe,
        private jwtService: JwtService,
        private mailerService: MailerService,
        private twilio: TwilioService
    ) {
        const accountSid = process.env.TWILIO_SID
        const auth = process.env.TWILIO_AUTH_TOKEN
    }
    async signUp(body: SignUpDto) {
        try {
            let existMail = await this.model.findOne({ email: body.email, }, 'email temp_mail')
            if (existMail != null) {
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
                temp_mail: body.email,
                temp_phone: body.phone,
                password: hash,
                custumer_id: customer.id,
                otp: otp,
                created_at: moment().utc().valueOf()
            }
            let user = await this.model.create(data)
            await this.verification(user.temp_mail, otp)
            let payload = { id: user._id, email: user.temp_mail }
            let access_token = await this.jwtService.signAsync(payload)
            await this.sessionModel.create({
                user_id: user?._id,
                access_token: access_token,
                user_type: user?.user_type
            })
            return { access_token, user }
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            throw error
        }
    }

    async encriptPass(pass: string) {
        try {
            const saltOrRounds = 10;
            const password = pass;
            return await bcrypt.hash(password, saltOrRounds);
        } catch (error) {
            throw error
        }
    }

    async verification(email: string, otp: any) {
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
            let data = {
                is_email_verify: true,
                email: user?.temp_mail,
                temp_mail: null,
                otp: null
            }
            await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            await this.model.deleteMany({temp_mail:user?.temp_mail})
            throw new HttpException('OTP Verified', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async verifyPhone(body: OtpDto, id: string) {
        try {
            let user = await this.model.findById({ _id: new Types.ObjectId(id) })
            if (user.otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            let data = {
                is_phone_verify: true,
                country_code: user?.temp_country_code,
                phone: user?.temp_phone,
                temp_country_code:null,
                temp_phone: null,
                otp: null
            }
            await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            throw new HttpException('OTP Verified', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async verifyOtp(body: NewPassOtpDto) {
        try {
            let user = await this.model.findOne({ unique_id: body.unique_id })
            if (user.otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            throw new HttpException('OTP Verification Completed. Kindly Reset Your Password', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async signIn(body: SignInDto) {
        try {
            let user = await this.model.findOne({ email: body.email })
            
            let payload = { id: user?._id, email: user?.email }
            if (!user) {
                user = await this.model.findOne({ temp_mail: body.email })
                payload = { id: user?._id, email: user?.temp_mail }
            }
            if (!user) {
                throw new HttpException('Invalid Email', HttpStatus.UNAUTHORIZED);
            }
            const isMatch = await bcrypt.compare(body.password, user?.password);
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.UNAUTHORIZED);
            }
            let access_token = await this.generateToken(payload)
            await this.createSession(user._id, access_token, body.fcm_token, user.user_type)
            return { user, access_token }
        } catch (error) {
            throw error
        }
    }

    async socialSignIn(body: SocialSignInDto) {
        try {
            let response
            let data
            if (body.social_type == 'google') {
                response = this.jwtService.decode(body.social_token)
                data = {
                    first_name: response?.given_name,
                    last_name: response?.family_name,
                    email: response?.email,
                    image: response?.picture,
                    social_id: response?.sub
                }
            } else if (body.social_type == 'facebook') {
                response = await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,first_name,last_name,email&access_token=${body.social_token}`);
                response = response.data
                data = {
                    first_name: response?.first_name,
                    last_name: response?.last_name,
                    email: response?.email,
                    image: response?.picture,
                    social_id: response?.id
                }
            } else {
                throw new HttpException('Invalid Request', HttpStatus.BAD_REQUEST)
            }
            let user = await this.model.findOne({ email: response?.email, is_deleted: false })
            let payload: any
            let newUser: any
            let access_token: string
            if (user == null) {
                newUser = await this.model.create(data)
                payload = { id: newUser?._id, email: response?.email }
                access_token = await this.generateToken(payload)
                await this.createSession(newUser?._id, access_token, body.fcm_token, newUser.user_type)
                return { access_token, newUser }
            }
            payload = { id: user?._id, email: response?.email }
            access_token = await this.generateToken(payload)
            await this.createSession(user?._id, access_token, body.fcm_token, user.user_type)
            return { access_token, user }
        } catch (error) {
            console.log(error);

            throw error
        }
    }

    async generateToken(payload: any) {
        try {
            return await this.jwtService.signAsync(payload)
        } catch (error) {
            throw error
        }
    }
    async createSession(user_id: any, access_token: string, fcm_token: string, user_type: string) {
        try {
            return await this.sessionModel.create({
                user_id: user_id,
                access_token: access_token,
                fcm_token: fcm_token,
                user_type: user_type
            })
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
            console.log(pass, 'pass');

            let data = await this.model.findOneAndUpdate(
                { unique_id: body.unique_id },
                { password: pass },
                { new: true }
            )
            console.log(data, body);
            throw new HttpException('Password Reset Successfully', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async logOut(id: string) {
        try {
            let endSession = await this.sessionModel.deleteMany({ user_id: id })
            if (!endSession) {
                throw new HttpException('No Session Exist', HttpStatus.OK)
            }
            throw new HttpException('LogOut Successfully!', HttpStatus.OK)
        } catch (error) {
            throw error
        }
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

    async updateEmail(id: string, body: UpdateEmailDto) {
        try {
            let otp = Math.floor(1000 + Math.random() * 9000);
            let data = {
                temp_mail: body.email,
                otp: otp,
                is_email_verify: false,
                updated_at: moment().utc().valueOf(),
            }
            let updatedMail = await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            await this.verification(body.email, otp)
            return updatedMail
        } catch (error) {
            throw error
        }
    }
    async updatePhone(id: string, body: UpdatePhoneDto) {
        try {
            let otp = Math.floor(1000 + Math.random() * 9000);
            let data = {
                temp_country_code: body.country_code,
                temp_phone: body.phone,
                otp: otp,
                is_phone_verify: false,
                updated_at: moment().utc().valueOf(),
            }
            let updatedPhone = await this.model.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            let phoneNumber = `${body.country_code}${body.phone}`
            let response = await this.sendOtpOnPhone(otp,phoneNumber)
            if(response.status=="failed"){
                throw new HttpException('OTP not sent',HttpStatus.EXPECTATION_FAILED)
            }
            return updatedPhone
        } catch (error) {
            throw error
        }
    }

    async sendOtpOnPhone(otp: number, phoneNumber: string){
        try {
            return await this.twilio.client.messages.create({
                body: `Do Not Share Your OTP ${otp}`,
                from: process.env.TWILIO_NUMBER,
                to: phoneNumber,
            })
        } catch (error) {
            throw error
        }
    }
}
