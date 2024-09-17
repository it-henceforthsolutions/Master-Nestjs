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
            recent_user,
            user_count,
            notification_count,
            staff_count,
        }
    }
 
}
