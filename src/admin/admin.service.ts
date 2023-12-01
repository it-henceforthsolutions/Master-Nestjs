import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { UsersType } from 'src/users/role/user.role';

@Injectable()
export class AdminService {
    constructor(
        private common: CommonService,
        private userService: UsersService
    ) { }

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

    async dashboard(){
        return this.userService.getUsersCount()
    }
    
}
