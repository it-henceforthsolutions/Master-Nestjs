import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePageDto, PaginationDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CommonService } from 'src/common/common.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pages } from './schema/pages.schema';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { ModelService } from 'src/model/model.service';

@Injectable()
export class PagesService {
    constructor(
        private model: ModelService,
        private readonly commonService: CommonService
    ) { }

    async create(createPageDto: CreatePageDto) {
        try {
            let pagesResponse = await this.model.PagesModel.create({...createPageDto,created_at:moment().utc().valueOf()});
            return pagesResponse
        }
        catch (error) {
            if (error.code === 11000) {
                // Handle duplicate key error
                throw new BadRequestException('The slug with this key already exists.')
                // Return a proper error response
            } else {
                // Handle other MongoDB errors
                console.error('MongoDB error:', error);
                throw new BadRequestException('An error occurred while processing the request.')

            }
        }
    }

    async findAll(paginationQuery: PaginationDto) {
        try {
            let query: any
            query = {
                ...(paginationQuery.search && {
                    $or: [
                        { title: { $regex: paginationQuery.search, $options: 'i' } },
                        { description: { $regex: paginationQuery.search, $options: 'i' } }
                    ]
                }),
                is_deleted: false,
            }
            let options = await this.commonService.set_options(paginationQuery.pagination, paginationQuery.limit)
            let data = await this.model.PagesModel.find(query, {}, options);
            let count = await this.model.PagesModel.countDocuments(query)
            return { data, count }
        }
        catch (error) {
            throw error
        }
    }

    async findOne(slug: string) {
        try {
            return await this.model.PagesModel.findOne({ slug, is_deleted: false });
        }
        catch (error) {
            throw new NotFoundException('Page Record Not Found')
        }
    }

    async update(id: string, updatePageDto: UpdatePageDto) {
        try {
            return await this.model.PagesModel.findByIdAndUpdate(
                { _id: new Types.ObjectId(id) },
                { updated_at: moment().utc().valueOf(), ...updatePageDto },
                { new: true }
            );
        }
        catch (error) {
            throw error
        }
    }

    async remove(id: string) {
        try {
            await this.model.PagesModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id), is_deleted: false },
                { is_deleted: true },
                { new: true }
            )
            throw new HttpException('Deleted!!', HttpStatus.OK)
        }
        catch (error) {
            throw error
        }
    }
}