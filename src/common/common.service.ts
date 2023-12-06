import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { TwilioService } from "nestjs-twilio";
import * as bcrypt from 'bcrypt';


@Injectable()
export class CommonService {
    constructor(
        private mailerService: MailerService,
        private twilio: TwilioService
    ) {
        const accountSid = process.env.TWILIO_SID
        const auth = process.env.TWILIO_AUTH_TOKEN
    }

    async verification(email: string, otp: any) {
        try {
            return await this.mailerService
                .sendMail({
                    to: `${email}`,
                    from: process.env.EMAIL,
                    subject: 'Verify User',
                    text: ` OTP :${otp}`
                });
        } catch (error) {
            throw error
        }
    }

    async generateOtp() {
        try {
            return Math.floor(1000 + Math.random() * 9000);
        } catch (error) {
            throw error
        }
    }

    async sendOtpOnPhone(otp: number, phoneNumber: string) {
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

    async encriptPass(pass: string) {
        try {
            const saltOrRounds = 10;
            const password = pass;
            return await bcrypt.hash(password, saltOrRounds);
        } catch (error) {
            throw error
        }
    }

    async bcriptPass(old_password,user_pass){
        try {
            return await bcrypt.compare(old_password, user_pass);
        } catch (error) {
            throw error
        }
    }

    async set_options(pagination: any, limit: any) {
        try {
            let options: any = {
                lean: true,
                sort: { _id: -1 }
            }
            if (pagination == undefined && limit == undefined) {
                options = {
                    lean: true,
                    sort: { _id: -1 },
                    limit: 100,
                    pagination: 0,
                    skip: 0
                }
            }
            else if (pagination == undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    sort: { _id: -1 },
                    limit: Number(limit),
                    skip: 0,
                }
            }
            else if (typeof pagination != undefined && limit == undefined) {
                options = {
                    lean: true,
                    sort: { _id: -1 },
                    skip: Number(pagination) * Number(process.env.DEFAULT_LIMIT),
                    limit: Number(process.env.DEFAULT_LIMIT)
                }
            }
            else if (typeof pagination != undefined && typeof limit != undefined) {
                options = {
                    lean: true,
                    sort: { _id: -1 },
                    limit: Number(limit),
                    skip: (0 + (pagination - 1) * limit)
                }
            }
            return options
        }
        catch (err) {
            throw err;
        }
    }
}