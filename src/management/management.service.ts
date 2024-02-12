import { Injectable } from '@nestjs/common';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Managements } from './schema/management.schema';
import { Model } from 'mongoose';
import { ModelService } from 'src/model/model.service';

@Injectable()
export class ManagementService {

    constructor(
        private model: ModelService,
    ) { }

    async create(body: CreateManagementDto) {
        try {
                let page = await this.model.ManagementsModel.findOne({ type: 'HOME' })
                if (page) {
                    return await this.model.ManagementsModel.findOneAndUpdate({ _id: page._id, type: 'HOME' }, body, { new: true })
                } else {
                    return await this.model.ManagementsModel.create(body)
                }
            }
        catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            let data = await this.model.ManagementsModel.find();
            let count = await this.model.ManagementsModel.countDocuments({ type: 'HOME' })
            return { data: data, count: count }
        }
        catch (error) {
            throw error
        }
    }

    findOne(id: string) {
        try {
            return this.model.ManagementsModel.findOne({ _id: id });
        }
        catch (error) {
            throw error
        }
    }

    async findHome() {
        try {
            return this.model.ManagementsModel.findOne({ type: 'HOME' })
        }
        catch (error) {
            throw error
        }
    }
}
