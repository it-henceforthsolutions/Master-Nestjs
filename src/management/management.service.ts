import { Injectable } from '@nestjs/common';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ManagementService {

    constructor(
        private model: DatabaseService
    ) { }

    async create(body: CreateManagementDto, admin_id: string) {
        try {
            let admin = await this.model.Staffs.findById({ _id: admin_id })
            if (admin) {
                let page = await this.model.Managements.findOne({ type: 'HOME' })
                if (page) {
                    return await this.model.Managements.findOneAndUpdate({ _id: page._id, type: 'HOME' }, body, { new: true })
                } else {
                    return await this.model.Managements.create(body)
                }
            }
        }
        catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            let data = await this.model.Managements.find();
            let count = await this.model.Managements.countDocuments({ type: 'HOME' })
            return { data: data, count: count }
        }
        catch (error) {
            throw error
        }
    }

    findOne(id: string) {
        try {
            return this.model.Managements.findOne({ _id: id });
        }
        catch (error) {
            throw error
        }
    }

    async findHome() {
        try {
            return this.model.Managements.findOne({ type: 'HOME' })
        }
        catch (error) {
            throw error
        }
    }
}
