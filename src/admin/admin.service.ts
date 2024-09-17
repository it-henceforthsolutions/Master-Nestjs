import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { UsersType } from 'src/users/role/user.role';
import { SignInDto } from './dto/create-admin.dto';
import { ModelService } from 'src/model/model.service';
// import { ConfigService } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { token_payload } from 'src/auth/interface/interface';
import * as moment from 'moment'
import { exportData, paginationsortsearch, sortBy } from './dto/admin.dto';
import * as csvtojson from 'csvtojson';
import { Types } from 'mongoose';
import { DeactivateDto } from 'src/users/dto/user.dto';

@Injectable()
export class AdminService {
    private user_scope
    private admin_scope
    private staff_scope

    constructor(
        private common: CommonService,
        private userService: UsersService,
        private model: ModelService,
        private ConfigService: ConfigService
    ) {
        this.user_scope = this.ConfigService.get('USER_SCOPE')
        this.admin_scope = this.ConfigService.get('ADMIN_SCOPE')
        this.staff_scope = this.ConfigService.get('STAFF_SCOPE')


    }


    async createAdmin() {
        try {
            let pass = 'admin@1234'
            let hash = await this.common.encriptPass(pass);
            let data = {
                first_name: 'super',
                last_name: 'admin',
                email: 'admin@gmail.com',
                password: hash,
                user_type: UsersType.admin
            }
            let query = { email: data.email };
            let admin = await this.userService.findOne(query);

            if (admin) {
                console.log({ message: "--------->>>> admin already created" });
                return
            }
            await this.userService.createAdmin(data)
            console.log({ message: "<<<<<--------->>>> admin created" });
            return
        } catch (error) {
            throw error
        }
    }
    async signIn(body: SignInDto) {
        try {
            let user = await this.model.UserModel.findOne({ email: body.email })
            let token_gen_at= moment().utc().valueOf()
            let payload: any = { id: user?._id, email: user?.email, scope: this.user_scope, token_gen_at }
            if (!user) {
                throw new HttpException('Invalid Email', HttpStatus.UNAUTHORIZED);
            }

            // if (user.is_active === false) {
            //     throw new HttpException('Deactivate Account ', HttpStatus.UNAUTHORIZED);
            // }
            if (user.user_type == UsersType.admin) {
                payload = { id: user?._id, email: user?.email, scope: this.admin_scope, token_gen_at }
            }
            if (user.user_type == UsersType.staff) {
                payload = { id: user?._id, email: user?.email, scope: this.staff_scope, token_gen_at }
            }
            const isMatch = await this.common.bcriptPass(body.password, user?.password)
            if (!isMatch) {
                throw new HttpException('Wrong Password', HttpStatus.UNAUTHORIZED);
            }
            let access_token = await this.common.generateToken(payload)
            let session = await this.common.createSession(user._id, body.fcm_token, user.user_type, token_gen_at)
            user = await this.model.UserModel.findOne({ _id: user?._id }, {
                first_name: 1, last_name: 1,   country_code: 1,  email: 1
            }).lean(true)
            return { access_token, ...user }
        } catch (error) {
            throw error
        }
    }

    async dashboard(req: any) {
        let admin_id = req.user_data._id
        let user_count = await this.userService.getUsersCount();
        let notification_count = await this.model.NotificationModel.countDocuments({ user_id: admin_id });
        let staff_count = await this.model.UserModel.countDocuments({ user_type: UsersType.staff });
        let recent_user = await this.model.UserModel.find(
            { user_type: UsersType.user, is_deleted:false },
            { first_name:1, last_name:1, email:1, temp_mail:1, country_code:1, phone:1, temp_phone:1, temp_country_code:1, profile_pic:1 },
            { sort: {_id:-1}, limit:5, lean: true }
        )
        return {
            user_count,
            notification_count,
            staff_count,
            recent_user,
        }
    }

    async profile(id: string) {
        try {
            let data = await this.model.UserModel.findOne(
                { _id: new Types.ObjectId(id), is_deleted: false, is_active: true, is_blocked: false },
                { first_name: 1, last_name: 1, country_code: 1, email: 1, is_email_verify: 1, is_phone_verify: 1, profile_pic: 1, phone: 1, login_type: 1, is_active:1, is_blocked:1, is_deleted:1 }
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

    async getAll(query_data:paginationsortsearch) {
        try {
            let { pagination, limit, sort_by, search} = query_data;
            let options = await this.common.set_options(pagination, limit)
            if (sort_by) {
                if (sort_by == sortBy.Newest) {
                   options.sort = { _id: -1 }
                } else if (sort_by == sortBy.Oldest) {
                    options.sort = { _id: 1 }
                } else if (sort_by == sortBy.Name){
                    options.sort = { first_name: -1 }
                }
            }
            let query:any =  { is_deleted: false, user_type: 'user' }
            if (search) {
                let new_search: any = search.split(' ');
                query.$or = [
                  { first_name: { $regex: search, $options: 'i' } },
                  { last_name: { $regex: search, $options: 'i' } },
                  { email: { $regex: search, $options: 'i' } },
                  {
                    $and: [
                      {
                        first_name: { $regex: new_search[0].toString(), $options: 'i' },
                      },
                      {
                        last_name: {
                          $regex: new_search[1] ? new_search[1].toString() : '',
                          $options: 'i',
                        },
                      },
                    ],
                  },
                ];
             }
            let allUsers = await this.model.UserModel.find(
                query,
                'first_name last_name email temp_mail country_code phone temp_phone temp_country_code profile_pic is_blocked is_active',
                options
            )
            let count = await this.model.UserModel.countDocuments(query)
            return {
                users: allUsers,
                count: count
            }
        } catch (error) {
            throw error
        }
    }

    async importProduct (file:any){
        try {
            let {mimetype}=file;
            let rejected = [];
            let accepted =[];
            let split_mime_type = mimetype.split('/')
            console.log("user.......",split_mime_type[1]);
            
            if(split_mime_type[1] =='csv'){   
                const jsonArray = await csvtojson().fromString(file.buffer.toString());
                console.log("-=--data.........",jsonArray);
                for(let object in jsonArray){
                    let currentObj = jsonArray[object]
                   let{ first_name, last_name, profile_pic, email, country_code, phone, is_blocked, created_at } = currentObj 
                    if(!first_name || !email ){
                       rejected.push({ email });
                    }
                    else {
                        let check_exist = await this.model.UserModel.findOne({ email })
                        if (check_exist) {
                            rejected.push({ email })
                        } else {
                            accepted.push({ email  });
                            let data_to_save: any = {
                                first_name,
                                last_name,
                                profile_pic,
                                email,
                                country_code,
                                phone,
                                is_blocked,
                                created_at:parseInt(created_at),
                            }       
                         await this.model.UserModel.create(data_to_save)  
                        }
                    }
                }
                return {
                  message1:"rejected",
                  rejected:rejected,
                  rejected_count:rejected.length,
                  message2:"accepted",
                  accepted:accepted,
                  accepted_count:accepted.length
                }
            }
            else{
               throw new HttpException("provide csv file",HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
         throw error
        }
    }

    async exportUser (body:exportData){   
        try {
          let { start_date, end_date }=body;
          let query = {
                created_at: {
                  $gte: start_date,
                  $lt: end_date
                },
                user_type: UsersType.user
            };
          let projection = { first_name:1, last_name:1, profile_pic:1, email:1, country_code:1, phone:1, is_blocked:1, created_at:1 }
          let option ={ lean: true }
          let data = await this.model.UserModel.find( query, projection, option ) 
          console.log("userexportdata........",data);
          let response ={
            count:data.length,
            data:data
          }
          return response;
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

    async getById(id: string) {
        try {
            return await this.model.UserModel.findById({ _id: new Types.ObjectId(id) },
                'first_name last_name profile_pic email temp_mail country_code phone temp_phone temp_country_code is_blocked is_active last_seen chat_active',
                { lean: true })
        } catch (error) {
            throw error
        }
    }

  
 
}
