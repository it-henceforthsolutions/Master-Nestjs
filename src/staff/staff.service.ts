import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStaffDto, PaginationStaffDto } from './dto/staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/users/schema/users.schema';
import { Model, Types } from 'mongoose';
import { CommonService } from 'src/common/common.service';
import * as moment from 'moment';
import { UsersType } from 'src/users/role/user.role';

@Injectable()
export class StaffService {
    constructor(
        @InjectModel(Users.name) private staff: Model<Users>,
        private common: CommonService
    ){}
    async create(body: CreateStaffDto) {
        try {
            let existMail = await this.staff.findOne({ email: body.email, }, 'email temp_mail')
            if (existMail) {
                throw new HttpException('This Email is Already Exist! Please Use another Email Address', HttpStatus.BAD_REQUEST);
            }
            let hash = await this.common.encriptPass(body.password)
            let data = {
                first_name: body.first_name,
                last_name: body.last_name,
                temp_mail: body.email,
                email: body.email,
                password: hash,
                role: body.role,
                user_type: UsersType.staff,
                created_at: moment().utc().valueOf()
            }
            let newStaff = await this.staff.create(data)
            newStaff = await this.staff.findById(newStaff._id,{
                first_name:1,last_name:1,email:1,temp_country_code:1,temp_mail:1,temp_phone:1,user_type:1,role:1
            })
            return newStaff
        } catch (error) {
            throw error
        }
    }

    async findAll(body: PaginationStaffDto) {
        try {
            let query: any
            query = {
                ...(body.search && {
                    $or: [
                        { title: { $regex: body.search, $options: 'i' } },
                        { description: { $regex: body.search, $options: 'i' } }
                    ]
                }),
                is_deleted: false,
                user_type: UsersType.staff
            }
            let data = await this.staff.find(query)
            return data
        } catch (error) {
            throw error
        }
    }

    async findOne(id: string) {
        try {
            let data= await this.staff.findOne(
                {_id: new Types.ObjectId(id),is_deleted: false,is_active:true,is_blocked:false},
                {first_name:1,last_name:1,email:1,temp_mail:1,phone:1,temp_phone:1,temp_country_code:1}
            )
            if(!data){
                throw new HttpException('Invalid Staff',HttpStatus.BAD_REQUEST)
            }
            return data
        } catch (error) {
            throw error
        }
    }

    async update(id: string, body: UpdateStaffDto) {
        try {
            return await this.staff.findOneAndUpdate(
                {_id: new Types.ObjectId(id),is_deleted:false},
                {updated_at: moment().utc().valueOf(),...body},
                {new: true}
            )
        } catch (error) {
            throw error
        }
    }

    async remove(id: string) {
        try {
            await this.staff.findOneAndUpdate({_id: new Types.ObjectId(id),is_deleted: false},
            {is_deleted: true},{new:true})
            throw new HttpException('Deleted!!',HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }
}
