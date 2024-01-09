import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import { Model, Types } from 'mongoose';
import { ForgetPassDto, NewPassOtpDto, OtpDto, SignInDto, SignUpDto, SocialSignInDto } from './dto/user.dto';
import * as moment from 'moment';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { Sessions } from './schema/sessions.schema';
import { JwtService } from '@nestjs/jwt';
import { ChangePassDto, ResetPassDto, UpdateEmailDto, UpdatePhoneDto, UpdateUserDto } from './dto/update-user.dto';
import * as randomString from "randomstring";
import axios from 'axios';
import { CommonService } from 'src/common/common.service';
import { jwtConstants } from 'src/auth/constant';
import { LoginType } from './role/user.role';
import { StripeService } from 'src/stripe/stripe.service';
const positiveIntegerRegex = /^\d+$/;

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private users: Model<Users>,
        @InjectModel(Sessions.name) private sessions: Model<Sessions>,
        @InjectStripe() private stripe: Stripe,
        private jwtService: JwtService,
        private common: CommonService,
        private readonly StripeService:StripeService 
    ) { }
    async signUp(body: SignUpDto) {
        try {
            let existMail = await this.users.findOne({ email: body.email, }, 'email temp_mail')
            if (existMail) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let otp = await this.common.generateOtp()
            let hash = await this.common.encriptPass(body.password)
            let customer = await this.StripeService.createCustomer(body)
            const isPositiveInteger = positiveIntegerRegex.test(body.phone);
            if (!isPositiveInteger) {
                throw new HttpException('please enter a valid phone number', HttpStatus.BAD_REQUEST);
            }
            let data = {
                first_name: body.first_name,
                last_name: body.last_name,
                temp_mail: body.email,
                temp_country_code: body.country_code,
                temp_phone: body.phone,
                password: hash,
                custumer_id: customer.id,
                otp: otp,
                created_at: moment().utc().valueOf()
            }

            let user = await this.users.create(data)
            await this.common.verification(user.temp_mail, otp)
            let payload = { id: user._id, email: user.temp_mail }
            let access_token = await this.jwtService.signAsync(payload)
            await this.sessions.create({
                user_id: user?._id,
                access_token: access_token,
                user_type: user?.user_type
            })
            user = await this.users.findOne({ _id: user?._id }, {
                first_name: 1, last_name: 1, temp_mail: 1, temp_phone: 1, country_code: 1, temp_country_code: 1, email: 1
            }).lean(true)
            return { access_token, ...user }
        } catch (error) {
            console.log(error);
            // if (error.code === 11000) {
            //     throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            // }

            throw error
        }
    }

    async verifyEmail(body: OtpDto, id: string) {
        try {
            let user = await this.users.findById({ _id: new Types.ObjectId(id) })
            if (user?.email_otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            let data = {
                is_email_verify: true,
                email: user?.temp_mail,
                temp_mail: null,
                email_otp: null
            }
            await this.users.findOneAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            let temp_destroy = await this.users.deleteMany({ temp_mail: user?.temp_mail, is_email_verify: false })
            if (temp_destroy) { throw new HttpException('OTP Verified', HttpStatus.OK) }
        } catch (error) {
            throw error
        }
    }

    async verifyPhone(body: OtpDto, id: string) {
        try {
            let user = await this.users.findById({ _id: new Types.ObjectId(id) })
            if (user?.phone_otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            let data = {
                is_phone_verify: true,
                country_code: user?.temp_country_code,
                phone: user?.temp_phone,
                temp_country_code: null,
                temp_phone: null,
                phone_otp: null
            }
            await this.users.findByIdAndUpdate(
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
            let user = await this.users.findOne({ unique_id: body.unique_id })
            if (user?.email_otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            throw new HttpException('OTP Verification Completed. Kindly Reset Your Password', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async signIn(body: SignInDto) {
        try {
            let user = await this.users.findOne({ email: body.email })
            let payload = { id: user?._id, email: user?.email }

            if (!user) {

                user = await this.users.findOne({ temp_mail: body.email })
                payload = { id: user?._id, email: user?.temp_mail }
            }
            if (!user) {
                throw new HttpException('Invalid Email', HttpStatus.UNAUTHORIZED);
            }
            if (user?.temp_mail && user?.email) {
                let mail = user?.email.slice(0, 5)
                throw new HttpException(`This EmailId is Not verified.Please SignIn with Your Previous Email: ${mail}xxxxxx.com`, HttpStatus.UNAUTHORIZED);
            }
            const isMatch = await this.common.bcriptPass(body.password, user?.password)
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.UNAUTHORIZED);
            }
            let access_token = await this.generateToken(payload)
            await this.createSession(user._id, access_token, body.fcm_token, user.user_type)
            user = await this.users.findOne({ _id: user?._id }, {
                first_name: 1, last_name: 1, temp_mail: 1, temp_phone: 1, country_code: 1, temp_country_code: 1, email: 1
            }).lean(true)
            return { access_token, ...user }
        } catch (error) {
            throw error
        }
    }

    async socialSignIn(body: SocialSignInDto) {
        try {
            let response
            let data
            if (body.social_type == LoginType.google) {
                response = this.jwtService.decode(body.social_token)
                data = {
                    first_name: response?.given_name,
                    last_name: response?.family_name,
                    email: response?.email,
                    profile_pic: response?.picture,
                    social_id: response?.sub,
                    is_email_verify: true,
                    is_phone_verify: true
                }
            } else if (body.social_type == LoginType.facebook) {
                response = await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,first_name,last_name,email&access_token=${body.social_token}`);
                response = response.data
                data = {
                    first_name: response?.first_name,
                    last_name: response?.last_name,
                    email: response?.email,
                    profile_pic: response?.picture,
                    social_id: response?.id,
                    is_email_verify: true,
                    is_phone_verify: true
                }
            } else {
                throw new HttpException('Invalid Request', HttpStatus.BAD_REQUEST)
            }
            let user = await this.users.findOne({ email: response?.email, is_deleted: false })
            let payload: any
            let newUser: any
            let access_token: string
            if (user == null) {
                newUser = await this.users.create(data)
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
            return await this.sessions.create({
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
            let user = await this.users.findOne({ email: body.email })
            let mail = user?.email
            if (!user) {
                user = await this.users.findOne({ temp_mail: body.email })
                mail = user?.temp_mail
            }
            if (!user) {
                throw new HttpException('This User is no Exist', HttpStatus.BAD_REQUEST)
            }
            let otp = Math.floor(1000 + Math.random() * 9000);
            let uniqueId = randomString.generate({
                length: 7,
                charset: 'alphanumeric'
            })
            await this.common.verification(mail, otp)
            await this.users.findOneAndUpdate(
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
            let pass = await this.common.encriptPass(body.new_password)

            let data = await this.users.findOneAndUpdate(
                { unique_id: body.unique_id },
                { password: pass },
                { new: true }
            )
            throw new HttpException('Password Reset Successfully', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async changePassward(body: ChangePassDto, id: string) {
        try {
            let user = await this.users.findById({ _id: new Types.ObjectId(id) })
            const isMatch = this.common.bcriptPass(body.old_password, user?.password)
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.BAD_REQUEST)
            }
            let newPass = await this.common.encriptPass(body.new_password)
            let updated = await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { password: newPass },
                { new: true }
            )
            if (!updated) {
                throw new HttpException('Something Went Wrong', HttpStatus.BAD_REQUEST)
            }
            throw new HttpException('Password Changed Successfully', HttpStatus.OK)

        } catch (error) {
            throw error
        }
    }

    async logOut(id: string) {
        try {
            let endSession = await this.sessions.deleteMany({ user_id: id })
            if (!endSession) {
                throw new HttpException('No Session Exist', HttpStatus.OK)
            }
            throw new HttpException('LogOut Successfully!', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async update(id: string, body: any) {
        try {
            let data = { updated_at: moment().utc().valueOf(), ...body }
            let updatedUser = await this.users.findByIdAndUpdate(
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
            let otp = await this.common.generateOtp()
            let check = await this.findUser(id)
            if(check.email == body.email){
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let data = {
                temp_mail: body.email,
                otp: otp,
                is_email_verify: false,
                updated_at: moment().utc().valueOf(),
            }
            await this.common.verification(body.email, otp)
            let updatedMail = await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            return updatedMail
        } catch (error) {
            throw error
        }
    }

    async updatePhone(id: string, body: UpdatePhoneDto) {
        try {
            // let otp = await this.common.generateOtp();
            let data = {
                temp_country_code: body.country_code,
                temp_phone: body.phone,
                otp: 1234,
                is_phone_verify: false,
                updated_at: moment().utc().valueOf(),
            }
            let phoneNumber = `${body.country_code}${body.phone}`
            // let response = await this.common.sendOtpOnPhone(otp, phoneNumber)
            // if (response.status == "failed") {
            //     throw new HttpException('OTP not sent', HttpStatus.EXPECTATION_FAILED)
            // }
            let updatedPhone = await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            return updatedPhone
        } catch (error) {
            throw error
        }
    }

    async findOne(query) {
        try {
            return await this.users.findOne(query)
        } catch (error) {
            throw error
        }
    }

    async createAdmin(data: any) {
        try {
            return await this.users.create(data)
        } catch (error) {
            throw error
        }
    }

    async findUser(id: string) {
        try {
            return await this.users.findById({ _id: new Types.ObjectId(id) })
        } catch (error) {
            throw error
        }
    }

    async resendEmailOtp(id: string) {
        try {
            let user = await this.users.findOne({ _id: new Types.ObjectId(id) })

            if (user?.is_email_verify == true) {
                throw new HttpException(`Your Email is Already Verified`, HttpStatus.BAD_REQUEST)
            }
            let otp = await this.common.generateOtp()

            let isSendVerification = await this.common.verification(user.temp_mail, otp)
            if (!isSendVerification) {
                throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.OK)
            }
            await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { otp: otp },
                { new: true }
            )
            throw new HttpException('OTP resend to your registered email address.', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async resendPhoneOtp(id: string) {
        try {
            let user = await this.users.findOne({ _id: new Types.ObjectId(id) })

            if (user?.is_phone_verify == true) {
                throw new HttpException(`Your Phone no. is Already Verified`, HttpStatus.BAD_REQUEST)
            }
            let otp = await this.common.generateOtp()
            let phone = `${user.temp_country_code} ${user.temp_phone}`
            
            let isSendVerification = await this.common.sendOtpOnPhone(otp, phone)
            
            if (!isSendVerification) {
                throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.BAD_REQUEST)
            }
            await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { otp: otp },
                { new: true }
            )
            throw new HttpException('OTP resend to your registered Phone No.', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async resendOtp(body: UpdateEmailDto) {
        try {
            let user = await this.users.findOne({ temp_mail: body.email })
            let otp = await this.common.generateOtp()
            let mail = user?.temp_mail
            if (!user) {
                user = await this.users.findOne({ email: body.email })
                mail = user?.email
            }
            let isSendVerification = await this.common.verification(mail, otp)
            if (!isSendVerification) {
                throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.OK)
            }
            await this.users.findByIdAndUpdate(
                { _id: user?._id },
                { otp: otp },
                { new: true }
            )
            throw new HttpException('OTP resend to your registered email address.', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async getAll() {
        try {
            let allUsers = await this.users.find(
                { is_deleted: false, user_type: 'user' },
                'first_name last_name email temp_mail country_code phone temp_phone temp_country_code',
                { lean: true }
            )
            return {
                users: allUsers,
                count: allUsers.length
            }
        } catch (error) {
            throw error
        }
    }

    async getById(id: string) {
        try {
            return await this.users.findById({ _id: new Types.ObjectId(id) },
                'first_name last_name email temp_mail country_code phone temp_phone temp_country_code updated_at chat_active',
                { lean: true })
        } catch (error) {
            throw error
        }
    }

    async getUsersCount() {
        try {
            return await this.users.countDocuments({ is_active: true })
        } catch (error) {
            throw error
        }
    }

    async block(id: string) {
        try {
            let user = await this.users.findById({ _id: new Types.ObjectId(id) })
            if (user?.is_blocked == true) {
                await this.users.findByIdAndUpdate(
                    { _id: new Types.ObjectId(id) },
                    { is_blocked: false, updated_at: moment().utc().valueOf() },
                    { new: true }
                )
                throw new HttpException('Unblocked', HttpStatus.OK)
            }
            await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_blocked: true, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            await this.sessions.deleteMany({ user_id: id })
            throw new HttpException('Blocked', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async delete(id: string) {
        try {
            let isDeleted = await this.users.findOneAndUpdate(
                { _id: new Types.ObjectId(id), is_deleted: false },
                { is_deleted: true, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            if (!isDeleted) {
                throw new HttpException('Already Deleted', HttpStatus.OK)

            }
            await this.sessions.deleteMany({ user_id: id })
            throw new HttpException('Deleted', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async deactivate(id: string) {
        try {
            let user = await this.users.findById({ _id: new Types.ObjectId(id) })
            if (user?.is_active == false) {
                await this.users.findByIdAndUpdate(
                    { _id: new Types.ObjectId(id) },
                    { is_active: true, updated_at: moment().utc().valueOf() },
                    { new: true }
                )
                throw new HttpException('Activated', HttpStatus.OK)
            }
            await this.users.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_active: false, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            await this.sessions.deleteMany({ user_id: id })
            throw new HttpException('Deactivated', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async profile(id: string) {
        try {
            let data = await this.users.findOne(
                { _id: new Types.ObjectId(id), is_deleted: false, is_active: true, is_blocked: false },
                { first_name: 1, last_name: 1, temp_mail: 1, temp_phone: 1, country_code: 1, temp_country_code: 1, email: 1, is_email_verify: 1, is_phone_verify: 1, profile_pic: 1 }
            ).lean(true)
            if (!data) {
                throw new HttpException('You May be deactivated', HttpStatus.BAD_REQUEST)
            }
            return data
        } catch (error) {
            console.log(error);

            throw error
        }
    }

    async getUserData(query:any, projection:any, options:any){
        try {
            let data=  await this.users.findOne(query, projection, options)
            console.log("🚀 ~ file: users.service.ts:407 ~ UsersService ~ getUserData ~ data:", data)
            return data
        } catch (error) {
            throw error
        }
    }

    async findupdateUser( query:any , update:any, options:any){
        try {
            console.log("query",query)
            console.log("update",update)
           let data =  await this.users.findOneAndUpdate(query, update, options)
           console.log("🚀 ~ file: users.service.ts:419 ~ UsersService ~ findupdateUser ~ data:", data)
          
            return data
        } catch (error) { 
            throw error
        }
    }
    
    async getUsers(query:any, projection:any, options:any){
        try {
            let data =  await this.users.find(query, projection, options)
            return data
        } catch (error) {
            throw error
        }
    }
}
