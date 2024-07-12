import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schema/users.schema';
import mongoose, { Model, Types } from 'mongoose';
import { DeactivateDto, ForgetPassDto, NewPassOtpDto, OtpDto, SignInDto, SignUpDto, SocialSignInDto } from './dto/user.dto';
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
import { ModelService } from 'src/model/model.service';
const positiveIntegerRegex = /^\d+$/;
import { ConfigService } from '@nestjs/config';
import { UsersType } from 'src/users/role/user.role';
@Injectable()
export class UsersService {
    private user_scope
    private admin_scope
    private staff_scope

    constructor(
        private model: ModelService,
        private jwtService: JwtService,
        private common: CommonService,
        private readonly StripeService: StripeService,
        private ConfigService: ConfigService
    ) {
        this.user_scope = this.ConfigService.get('USER_SCOPE')
        this.admin_scope = this.ConfigService.get('ADMIN_SCOPE')
        this.staff_scope = this.ConfigService.get('STAFF_SCOPE')


        console.log("user_scope", this.user_scope);

    }
    async signUp(body: SignUpDto) {
        try {
            let existMail = await this.model.UserModel.find({ email: body.email.toLowerCase() })
            if (existMail.length) {
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
                email: body.email,
                country_code: body.country_code,
                phone: body.phone,
                password: hash,
                custumer_id: customer.id,
                email_otp: otp,
                phone_otp: 1234,
                created_at: moment().utc().valueOf()
            }

            let user = await this.model.UserModel.create(data)
            this.common.verification(user.email, otp)
            let tok_gen_at = moment().utc().valueOf()
            let payload = { id: user._id, email: user.email, scope: this.user_scope, tok_gen_at: tok_gen_at }
            let access_token = await this.jwtService.signAsync(payload)
            await this.model.SessionModel.create({
                user_id: user?._id,
                access_token: access_token,
                user_type: user?.user_type,
                tok_gen_at: tok_gen_at
            })
            user = await this.model.UserModel.findOne({ _id: user?._id }, {
                first_name: 1, last_name: 1, temp_phone: 1, country_code: 1, temp_country_code: 1, email: 1
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
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(id) }, { email_otp: 1, phone_otp: 1 }, { lean: true })
            console.log("user_otp", user.email_otp)
            console.log("body_otp", body.otp)
            if (user?.email_otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            let data = {
                is_email_verify: true,
                email_otp: null
            }
            await this.model.UserModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            let token_gen_at = moment().utc().valueOf()
            let payload = { id: user._id, scope: this.user_scope, token_gen_at: token_gen_at }
            let access_token = await this.generateToken(payload)
            await this.common.delete_session(user._id)
            await this.createSession(user._id, access_token, body.fcm_token, user.user_type, token_gen_at)

            // let access_token = await this.generateToken(payload)
            let response = this.user_response(id, access_token)
            return response
        } catch (error) {
            throw error
        }
    }


    async user_response(user_id: string, access_token: string) {
        try {
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(user_id) },
                { email_otp: 0, phone_otp: 0, password: 0 }, { lean: true })

            return {
                access_token,
                ...user
            }
        } catch (error) {
            throw error
        }
    }


    async verifyPhone(body: OtpDto, id: string) {
        try {
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(id) })
            if (user?.phone_otp != body.otp) {
                throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST)
            }
            let data = {
                is_phone_verify: true,
                phone_otp: 1234
            }
            await this.model.UserModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                data,
                { new: true }
            )
            let token_gen_at = moment().utc().valueOf()
            let payload = { id: user._id, scope: this.user_scope, token_gen_at: token_gen_at }
            let access_token = await this.generateToken(payload)
            await this.common.delete_session(user._id)
            await this.createSession(user._id, access_token, body.fcm_token, user.user_type, token_gen_at)

            let response = this.user_response(id, access_token)
            return response
        } catch (error) {
            throw error
        }
    }

    async verifyOtp(body: NewPassOtpDto) {
        try {
            let user = await this.model.UserModel.findOne({ unique_id: body.unique_id })
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
            let user = await this.model.UserModel.findOne({ email: body.email })
            let payload: any = { id: user?._id, email: user?.email, scope: this.user_scope }

            if (!user) {
                throw new HttpException('Invalid Email', HttpStatus.UNAUTHORIZED);
            }

            if (user.is_active === false) {
                throw new HttpException('Deactivate Account ', HttpStatus.UNAUTHORIZED);

            }
            // if (user.user_type == UsersType.admin) {
            //     payload = { id: user?._id, email: user?.temp_mail, scope: this.admin_scope }

            // }
            // if (user.user_type == UsersType.staff) {
            //     payload = { id: user?._id, email: user?.temp_mail, scope: this.staff_scope }

            // }

            // console.log("user?.email", user?.email)
            // if (user?.temp_mail && user?.email) {
            //     let mail = user?.email.slice(0, 5)
            //     throw new HttpException(`This EmailId is Not verified.Please SignIn with Your Previous Email: ${mail}xxxxxx.com`, HttpStatus.UNAUTHORIZED);
            // }
            let tok_gen_at = moment().utc().valueOf()
            payload = { id: user?._id, email: user?.email, scope: this.user_scope, tok_gen_at: tok_gen_at }
            // console.log("user?.temp_mail", user?.temp_mail)
            const isMatch = await this.common.bcriptPass(body.password, user?.password)
            if (!isMatch) {
                throw new HttpException('Wrong Pasosword', HttpStatus.UNAUTHORIZED);
            }
            let access_token = await this.generateToken(payload)
            await this.createSession(user._id, access_token, body.fcm_token, user.user_type, tok_gen_at)
            user = await this.model.UserModel.findOne({ _id: user?._id }, {
                email_otp: 0, phone_otp: 0, password: 0
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
            let user = await this.model.UserModel.findOne({ email: response?.email, is_deleted: false })
            let payload: any
            let access_token: string
            let tok_gen_at = moment().utc().valueOf()
            if (user == null) {
                user = await this.model.UserModel.create(data)
                payload = { id: user?._id, email: response?.email, scope: this.user_scope }
                access_token = await this.generateToken(payload)
                await this.createSession(user?._id, access_token, body.fcm_token, user.user_type, tok_gen_at)
                return { access_token, user }
            }
            payload = { id: user?._id, email: response?.email, scope: this.user_scope }
            access_token = await this.generateToken(payload)
            await this.createSession(user?._id, access_token, body.fcm_token, user.user_type, tok_gen_at)
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

    async createSession(user_id: any, access_token: string, fcm_token: string, user_type: string, tok_gen_at: any) {
        try {
            return await this.model.SessionModel.create({
                user_id: new mongoose.Types.ObjectId(user_id),
                access_token: access_token,
                fcm_token: fcm_token,
                user_type: user_type,
                tok_gen_at: tok_gen_at
            })
        } catch (error) {
            throw error
        }
    }

    async forgetPassword(body: ForgetPassDto) {
        try {
            let user = await this.model.UserModel.findOne({ email: body.email })
            let mail = user?.email
            // if (!user) {
            //     user = await this.model.UserModel.findOne({ temp_mail: body.email })
            //     mail = user?.temp_mail
            // }
            if (!user) {
                throw new HttpException('This User is no Exist', HttpStatus.BAD_REQUEST)
            }
            let otp = Math.floor(1000 + Math.random() * 9000);
            let uniqueId = randomString.generate({
                length: 7,
                charset: 'alphanumeric'
            })
            await this.common.verification(mail, otp)
            await this.model.UserModel.findOneAndUpdate(
                { _id: user._id },
                { email_otp: otp, unique_id: uniqueId },
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

            let data = await this.model.UserModel.findOneAndUpdate(
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
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(id) })
            console.log("user=----------->",user)
            const isMatch =await this.common.bcriptPass(body.old_password, user?.password)
            console.log("isMatch--------------->",isMatch)
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.BAD_REQUEST)
            }
            let newPass = await this.common.encriptPass(body.new_password)
            let updated = await this.model.UserModel.findByIdAndUpdate(
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
            let endSession = await this.model.SessionModel.deleteMany({ user_id: id })
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
            let updatedUser = await this.model.UserModel.findByIdAndUpdate(
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
            let userModel = await this.model.UserModel.findOne({ email: body.email })
            if (userModel) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let check = await this.findUser(id)
            if (check.email == body.email) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let data = {
                email: body.email,
                otp: otp,
                is_email_verify: false,
                updated_at: moment().utc().valueOf(),
            }
            await this.common.verification(body.email, otp)
            let updatedMail = await this.model.UserModel.findByIdAndUpdate(
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
                country_code: body.country_code,
                phone: body.phone,
                otp: 1234,
                is_phone_verify: false,
                updated_at: moment().utc().valueOf(),
            }

            let userModel = await this.model.UserModel.findOne({ country_code: body.country_code, phone: body.phone })
            if (userModel) {
                throw new HttpException('This Phone Number is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let phoneNumber = `${body.country_code}${body.phone}`
            // let response = await this.common.sendOtpOnPhone(otp, phoneNumber)
            // if (response.status == "failed") {
            //     throw new HttpException('OTP not sent', HttpStatus.EXPECTATION_FAILED)
            // }
            let updatedPhone = await this.model.UserModel.findByIdAndUpdate(
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
            return await this.model.UserModel.findOne(query)
        } catch (error) {
            throw error
        }
    }

    async createAdmin(data: any) {
        try {
            return await this.model.UserModel.create(data)
        } catch (error) {
            throw error
        }
    }

    async findUser(id: string) {
        try {
            return await this.model.UserModel.findById({ _id: new Types.ObjectId(id) })
        } catch (error) {
            throw error
        }
    }

    async resendEmailOtp(id: string) {
        try {
            let user = await this.model.UserModel.findOne({ _id: new Types.ObjectId(id) })

            if (user?.is_email_verify == true) {
                throw new HttpException(`Your Email is Already Verified`, HttpStatus.BAD_REQUEST)
            }
            let otp = await this.common.generateOtp()

            let isSendVerification = await this.common.verification(user.email, otp)
            if (!isSendVerification) {
                throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.OK)
            }
            await this.model.UserModel.findByIdAndUpdate(
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
            let user = await this.model.UserModel.findOne({ _id: new Types.ObjectId(id) })

            if (user?.is_phone_verify == true) {
                throw new HttpException(`Your Phone no. is Already Verified`, HttpStatus.BAD_REQUEST)
            }
            let otp = await this.common.generateOtp()
            let phone = `${user.country_code} ${user.phone}`

            // let isSendVerification = await this.common.sendOtpOnPhone(otp, phone)

            // if (!isSendVerification) {
            //    throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.BAD_REQUEST)
            // }
            await this.model.UserModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { phone_otp: 1234 },
                { new: true }
            )
            throw new HttpException('OTP resend to your registered Phone No.', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async resendOtp(body: UpdateEmailDto) {
        try {
            let user = await this.model.UserModel.findOne({ email: body.email })
            let otp = await this.common.generateOtp()
            let mail = user?.email

            let isSendVerification = await this.common.verification(mail, otp)
            if (!isSendVerification) {
                throw new HttpException(`We can't Resend Otp Please connect Administration`, HttpStatus.OK)
            }
            await this.model.UserModel.findByIdAndUpdate(
                { _id: user?._id },
                { email_otp: otp },
                { new: true }
            )
            throw new HttpException('OTP resend to your registered email address.', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async getAll() {
        try {
            let allUsers = await this.model.UserModel.find(
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
            return await this.model.UserModel.findById({ _id: new Types.ObjectId(id) },
                'first_name last_name email temp_mail country_code phone temp_phone temp_country_code last_seen chat_active',
                { lean: true })
        } catch (error) {
            throw error
        }
    }

    async getUsersCount() {
        try {
            return await this.model.UserModel.countDocuments({ is_active: true })
        } catch (error) {
            throw error
        }
    }

    async block(id: string) {
        try {
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(id) })
            if (user?.is_blocked == true) {
                await this.model.UserModel.findByIdAndUpdate(
                    { _id: new Types.ObjectId(id) },
                    { is_blocked: false, updated_at: moment().utc().valueOf() },
                    { new: true }
                )
                throw new HttpException('Unblocked', HttpStatus.OK)
            }
            await this.model.UserModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_blocked: true, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            await this.model.SessionModel.deleteMany({ user_id: id })
            throw new HttpException('Blocked', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async delete(id: string) {
        try {
            let isDeleted = await this.model.UserModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id), is_deleted: false },
                { is_deleted: true, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            if (!isDeleted) {
                throw new HttpException('Already Deleted', HttpStatus.OK)

            }
            await this.model.SessionModel.deleteMany({ user_id: id })
            throw new HttpException('Deleted', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async deactivate(id: string) {
        try {
            let user = await this.model.UserModel.findById({ _id: new Types.ObjectId(id) })
            if (user?.is_active == false) {
                await this.model.UserModel.findByIdAndUpdate(
                    { _id: new Types.ObjectId(id) },
                    { is_active: true, updated_at: moment().utc().valueOf() },
                    { new: true }
                )
                throw new HttpException('Activated', HttpStatus.OK)
            }
            await this.model.UserModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_active: false, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            await this.model.SessionModel.deleteMany({ user_id: id })
            throw new HttpException('Deactivated', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }

    async profile(id: string) {
        try {
            let data = await this.model.UserModel.findOne(
                { _id: new Types.ObjectId(id), is_deleted: false, is_active: true, is_blocked: false },
                { first_name: 1, last_name: 1, country_code: 1, email: 1, is_email_verify: 1, is_phone_verify: 1, profile_pic: 1, phone:1 }
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

    async getUserData(query: any, projection: any, options: any) {
        try {
            let data = await this.model.UserModel.findOne(query, projection, options)
            return data
        } catch (error) {
            throw error
        }
    }

    async findupdateUser(query: any, update: any, options: any) {
        try {
            let data = await this.model.UserModel.findOneAndUpdate(query, update, options)
            return data
        } catch (error) {
            throw error
        }
    }

    async getUsers(query: any, projection: any, options: any) {
        try {
            let data = await this.model.UserModel.find(query, projection, options)
            return data
        } catch (error) {
            throw error
        }
    }

    async deactivateUser(id: string,body:DeactivateDto) {
        try {
            await this.model.UserModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { is_active: false, updated_at: moment().utc().valueOf(),...body },
                { new: true }
            )
            await this.model.SessionModel.deleteMany({ user_id: id })
            throw new HttpException('Deactivated', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }
}
