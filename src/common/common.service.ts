import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { TwilioService } from "nestjs-twilio";
import * as bcrypt from 'bcrypt';
import * as FCM from 'fcm-push';
import { JwtService } from "@nestjs/jwt";
import { ModelService } from "src/model/model.service";
import * as mongoose from 'mongoose'
import { token_payload } from "src/auth/interface/interface";
@Injectable()
export class CommonService {
    constructor(
        private mailerService: MailerService,
        private twilio: TwilioService,
        private jwtService: JwtService,
        private model: ModelService,
    ) {
        const accountSid = process.env.TWILIO_SID
        const auth = process.env.TWILIO_AUTH_TOKEN
    }

    async verification(email: string, otp: any) {
        try {
            return await this.mailerService
                .sendMail({
                    to: `${email}`,
                    from: `MasterModule<${process.env.EMAIL}>`,
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

    async bcriptPass(old_password, user_pass) {
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

    async email_notification(data, emails) {
        console.log("data:", data);
        console.log("emails:", emails);
        try {
            await this.mailerService
                .sendMail({
                    to: `${emails}`,
                    from: process.env.EMAIL,
                    subject: data.subject,
                    text: data.text
                });
        } catch (error) {
            throw error
        }
    }

    async generateToken(payload:token_payload) {
        try {
            return await this.jwtService.signAsync(payload)
        } catch (error) {
            throw error
        }
    }
    async createSession(user_id: any, fcm_token: string, user_type: string, token_gen_at: any) {
        try {
            return await this.model.SessionModel.create({
                user_id: new mongoose.Types.ObjectId(user_id),
                fcm_token: fcm_token,
                user_type: user_type,
                created_at: token_gen_at
            })
        } catch (error) {
            throw error
        }
    }
    async delete_session(user_id: any) {
        try {
            return await this.model.SessionModel.deleteMany({
                user_id: new mongoose.Types.ObjectId(user_id)
            })
        } catch (error) {
            throw error
        }
    }
    push_notification = async (pushData: any, fcm_tokens: any) => {
        try {
            // FCM server key for authentication

            const server_key = process.env.FCM_SERVER_KEY

            // Create a new instance of FCM using the server key
            const fcm = new FCM(server_key);
            console.log("token", fcm_tokens)
            const payload = {
                to: fcm_tokens,
                // data:data,
                notification: {
                    title: pushData.subject,
                    body: pushData.text,
                    sound: 'default',
                    badge: 0,
                    priority: 'high',
                    content_available: true,
                    foreground: true,
                    show_in_foreground: true,
                },
            };

            // Send the push notification using FCM
            const response = await fcm.send(payload);
            console.log('Notification sent successfully:', response);
        } catch (error) {
            console.error('Error sending notification:', error);
            // Handle the error appropriately
        }
    };
}