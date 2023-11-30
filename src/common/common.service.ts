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
            await bcrypt.compare(old_password, user_pass);
        } catch (error) {
            throw error
        }
    }
}