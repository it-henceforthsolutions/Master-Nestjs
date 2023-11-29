import { Injectable } from "@nestjs/common";
import randomstring from "randomstring";
import nodemailer from "nodemailer";
 import smtpTransport from "nodemailer-smtp-transport";
import { config } from 'dotenv';
import path from "path";
import fs from 'fs';
import Stripe from 'stripe';
import { InjectStripe } from 'nestjs-stripe';
import { ConfigService } from "@nestjs/config";
import FCM from "fcm-push";
import { Models } from "mongoose";
import { Types } from "mongoose";
import * as dto from "./dto";
import moment from "moment";
import axios from "axios";
// var https = require('follow-redirects').https;
import * as Errors from "../handler/error.services";
import { ModelService } from "src/model/model.service";
const AWS = require('aws-sdk');
config();
const nodemailer_email = process.env.NODEMAILER_MAIL;
const nodemailer_password = process.env.NODEMAILER_PASSWORD;
const defaultLimit = process.env.DEFAULTLIMIT;

@Injectable()
export class CommonServices {
    private server_key: string;
    // constructor( private readonly stripe: Stripe,){}
    public constructor(
        @InjectStripe() private readonly stripe: Stripe,
        private readonly configService: ConfigService,
        private model: ModelService,
    ) { this.server_key = this.configService.get<string>('NOTIFICATION_KEY'); }

    private transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: nodemailer_email,
            pass: nodemailer_password
        }
    }));

    // otp_aws = async () => {
    //     try {
    //         const sns = this.awsService.getSnsInstance();
    //         let phn = "+917710177797"
    //         const params = {
    //             Message: `Your iMatch OTP is ${1234}`,
    //             PhoneNumber: phn,
    //         };
    //         sns.publish(params, (err, data) => {
    //             if (err) {
    //                 console.error('Error sending OTP:', err);
    //             } else {
    //                 console.log('OTP sent successfully:', data);
    //             }
    //         })
    //     } catch (e) {
    //         throw e
    //     }
    // }


    generateOtp = async () => {
        try {
            let options = {
                length: 4,
                charset: '123456789'
            }
            let otp = randomstring.generate(options)
            return otp
        } catch (err) {
            throw err
        }
    }

    generateChannelName = async () => {
        try {
            let options = {
                length: 9,
                charset: "alphanumeric"
            }
            let channel = randomstring.generate(options)
            return channel
        } catch (err) {
            throw err
        }
    }

    // generateTicketCode = async (post_id: string) => {
    //     try {
    //         let options = {
    //             length: 8,
    //             charset: '123456789'
    //         }
    //         let code;
    //         let existingTicket;
    //         do {
    //             code = randomstring.generate(options);
    //             let query = { code: code, post_id: new Types.ObjectId(post_id) }
    //             existingTicket = await this.model.tickets.findOne({ query });
    //         } while (existingTicket);
    //         return code
    //     } catch (err) {
    //         throw err
    //     }
    // }

    generateUniqueCode = async () => {
        try {
            let query = { chat_type: "GROUP" }
            let group_count = await this.model.connections.countDocuments(query).exec();
            let options = {
                length: 7,
                charset: "alphanumeric"
            }
            let unique_code = randomstring.generate(options);
            let count = group_count;
            let group_code = `group_${unique_code}_${count}`;
            return group_code;
        } catch (err) {
            throw err
        }
    }

    // generateUniqueslug = async () => {
    //     try {
    //         let query = {}
    //         let slug_count = await this.model.contents.countDocuments(query).exec();
    //         let options = {
    //             length: 7,
    //             charset: "alphanumeric"
    //         }
    //         let unique_code = randomstring.generate(options);
    //         let count = slug_count;
    //         let group_code = `slug_${unique_code}_${count}`;
    //         return group_code;
    //     } catch (err) {
    //         throw err
    //     }
    // }

    sendEmail = async (to: string, subject: any, body: any) => {
        try {
            let mailOptions = {
                from: nodemailer_email,
                to: to,
                subject: subject,
                html: body
            }

            this.transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) { console.log("error----", error) }
                else { console.log('Email Sent: ' + info.response) }
            })
        } catch (err) {
            console.log("err", err);
            throw err
        }
    }

    broadcast_mail = async (email: string, subject: string, message: string) => {
        try {

            // let title = `Hi ${email}`;
            // let button_url = `${admin_endpoint}contact-us/1`;
            // let button = `View on iMatch`;

            let file_path = path.join(__dirname, '../../imatch_email_template/broadcast.html');
            let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
            html = html.replace('%TITLE%', subject)
            html = html.replace('%MESSAGE%', message)
            // html = html.replace('%BUTTON_URL%', button_url)
            // html = html.replace('%BUTTON%', button)
            await this.sendEmail(email, subject, html)

        }
        catch (err) {
            throw err;
        }
    }

    send_email = async (data: any) => {
        try {
            const { email, subject, text } = data
            //console.log("inside email",data);                

            let mailoption = {
                from: email,
                to: email,
                subject: subject,
                text: text
            }
            // //console.log("inside =-==-=-=-==email",mailoption);

            this.transporter.sendMail(mailoption, function (error, info) {
                if (error) {
                    console.log("-=-=-errrrrr----------", error);
                } else {
                    console.log("Email is sent ", info);
                }
            })
        } catch (err) {
            throw err
        }
    }

    send_email_verification = async (data: any) => {
        try {
            let { email, email_otp } = data;
            let subject = "Welcome to IMatch";
            let file_path = path.join(__dirname, "../../imatch_email_template/email_verification.html");
            let html = await fs.readFileSync(file_path, { encoding: 'utf-8' });
            html = html.replace("%OTP%", email_otp);
            await this.sendEmail(email, subject, html);
        } catch (err) {
            throw err
        }
    }

    send_welcome_email = async (data: any) => {
        try {
            let { email, full_name } = data;
            let subject = "Welcome to IMatch";
            let file_path = path.join(__dirname, "../../imatch_email_template/index.html");
            let html = await fs.readFileSync(file_path, { encoding: 'utf-8' });
            html = html.replace("%full_name%", full_name);
            await this.sendEmail(email, subject, html);
        } catch (err) {
            throw err
        }
    }

    resendOtpMail = async (data: any) => {
        try {
            let { email, email_otp } = data
            let subject = 'Resend OTP';
            let file_path = path.join(__dirname, '../../imatch_email_template/reset_password.html');
            let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
            // html = html.replace('%USER_NAME%', name)
            html = html.replace('%OTP%', email_otp)
            await this.sendEmail(email, subject, html)
        }
        catch (err) {
            throw err;
        }
    }

    forgot_password_mail = async (data: any) => {
        try {
            let { email, email_otp } = data
            // console.log("email",email);
            // console.log("email_otp",email_otp);
            // console.log("full_name",full_name);

            let subject = 'Forget Password OTP';
            let file_path = path.join(__dirname, '../../imatch_email_template/reset_password.html');
            console.log("file_path", file_path);
            let html = await fs.readFileSync(file_path, { encoding: 'utf-8' })
            // html = html.replace('%USER_NAME%', full_name)
            html = html.replace('%OTP%', email_otp)
            // console.log("otp: ", email_otp)
            await this.sendEmail(email, subject, html)
        }
        catch (err) {
            throw err;
        }
    }

    setOptions = async (pagination: any, limit: any) => {
        try {
            console.log('limit.......', typeof (pagination), 'pagination.......', typeof (limit))
            console.log("defaultlimit------", typeof (defaultLimit));

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
                    limit: parseInt(limit),
                    skip: 0,
                }
            }
            else if (typeof pagination != undefined && limit == undefined) {
                options = {
                    lean: true,
                    sort: { _id: -1 },
                    skip: parseInt(pagination) * parseInt(defaultLimit),
                    limit: parseInt(defaultLimit)
                }
            }

            else if (typeof pagination != undefined && typeof limit != undefined) {
                console.log("pagination", pagination);
                console.log("limit", limit);

                options = {
                    lean: true,
                    sort: { _id: -1 },
                    limit: parseInt(limit),
                    skip: parseInt(pagination) * limit
                }
            }

            return options

        }
        catch (err) {
            throw err;
        }
    }

    skip_data = async (payload_data: any) => {
        try {
            let { pagination, limit }: any = payload_data
            let set_pagination: number = 0, set_limit: number = 0;
            if (pagination != undefined) { set_pagination = parseInt(pagination) }
            if (limit != undefined) { set_limit = parseInt(limit) }
            return {
                $skip: set_pagination * set_limit
            }
        }
        catch (err) {
            throw err;
        }
    }

    limit_data = async (payload_data: any) => {
        try {
            let { limit }: any = payload_data
            let set_limit: number = 10;
            if (limit != undefined) { set_limit = parseInt(limit) }
            return {
                $limit: set_limit
            }
        }
        catch (err) {
            throw err;
        }
    }

    createCustomer = async (name: string, email: string) => {
        try {
            let data = { name: name, email: email, description: "Create Customer", }
            let create = await this.stripe.customers.create(data);
            return create;
        }
        catch (err) {
            throw err
        }
    }


    // send_push = async (data: any, notification_data: any) => {
    //     try {
    //         if (data.length) {
    //             for (let value of data) {
    //                 let { fcm_token } = value
    //                 console.log("fcm_token", fcm_token);
    //                 if (fcm_token != undefined) {
    //                     await this.send_notification(notification_data, fcm_token)
    //                 }
    //             }
    //         }
    //     }
    //     catch (err) {
    //         throw err
    //     }
    // }

    send_push = async (data: any, notification_data: any) => {
        try {
            if (data.length) {
                let tokens = []
                for (let i = 0; i < data.length; i++) {
                    tokens.push(data[i].fcm_token)
                }
                await this.send_notification(notification_data, tokens)
            }
        }
        catch (err) {
            throw err
        }
    }
    send_notification = async (data: any, fcm_tokens: any) => {
        try {
            console.log("server_key----", this.server_key);

            const fcm = new FCM(this.server_key)

            let message = {
                registration_ids: fcm_tokens,
                data: data,
                notification: {

                    type: data.type,
                    title: data.title,
                    body: data.message,
                    notif_type: data.notif_type,
                    sound: 'default',
                    badge: 0,
                    priority: "high",
                    content_available: true,
                    foreground: true,
                    show_in_foreground: true
                }
            }
            fcm.send(message, function (err: any, result: any) {
                if (err) { console.log("notification error", err) }
                else { console.log("notification success", result) }
            });
        }
        catch (err) {
            throw err
        }
    }

    fetch_tokens = async (user_id: string) => {
        try {
            let query = { user_id: new Types.ObjectId(user_id) }
            let projection = { __v: 0 }
            let options = { lean: true }
            let tokens = await this.model.sessions.find(query, projection, options);
            console.log("tokens----", tokens);

            return tokens;
        }
        catch (err) {
            throw err
        }
    }


    // send_otp = async () => {
    //     try {
    //         const baseUrl = 'https://y3p8wg.api.infobip.com';
    //         const authorization = 'App 31c42b318a3c5eff70b5e44d56cd15c8-9e1b21be-0eb1-4266-bddb-5a37563985b5';

    //         const postData = {
    //             "messages": [
    //                 {
    //                     "destinations": [
    //                         {
    //                             "to": "+918171923180"
    //                         }
    //                     ],
    //                     "from": "InfoSMS",
    //                     "text": "This is a sample message from Shivam Kathait"
    //                 }
    //             ]
    //         };
    //         const headers = {
    //             'Authorization': authorization,
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json'
    //         }
    //         const response = await axios.post(`${baseUrl}/sms/2/text/advanced`, postData, { headers });

    //         console.log("response", response.data);
    //         console.log("response", response.data.messages[0].status);
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // }

   

}



