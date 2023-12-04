import { Injectable } from '@nestjs/common';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Managements } from './schema/management.schema';
import { Model } from 'mongoose';

@Injectable()
export class ManagementService {

    constructor(
        @InjectModel(Managements.name) private management: Model<Managements>
    ) { }

    async create(body: CreateManagementDto) {
        try {
                let page = await this.management.findOne({ type: 'HOME' })
                if (page) {
                    return await this.management.findOneAndUpdate({ _id: page._id, type: 'HOME' }, body, { new: true })
                } else {
                    return await this.management.create(body)
                }
            }
        catch (error) {
            throw error
        }
    }

    async findAll() {
        try {
            let data = await this.management.find();
            let count = await this.management.countDocuments({ type: 'HOME' })
            return { data: data, count: count }
        }
        catch (error) {
            throw error
        }
    }

    findOne(id: string) {
        try {
            return this.management.findOne({ _id: id });
        }
        catch (error) {
            throw error
        }
    }

    async findHome() {
        try {
            return this.management.findOne({ type: 'HOME' })
        }
        catch (error) {
            throw error
        }
    }
}
