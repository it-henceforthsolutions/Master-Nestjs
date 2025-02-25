import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFaqDto, PaginationDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CommonService } from 'src/common/common.service';
import { InjectModel } from '@nestjs/mongoose';
import { Faqs } from './schema/faqs.schema';
import { Model, Types } from 'mongoose';
import * as moment from 'moment';
import { ModelService } from 'src/model/model.service';

@Injectable()
export class FaqsService {
    constructor(
        private model: ModelService,
        private readonly commonService: CommonService
    ) { }

    async create(createFaqDto: CreateFaqDto,) {
        try {
            let newFaq = this.model.FaqsModel.create(createFaqDto);
            return newFaq
        }
        catch (error) {
            throw error;
        }
    }

    async findAll(paginationSearch: PaginationDto) {
        try {

            let query = {
                ...(paginationSearch.search && {
                    $or: [
                        { questions: { $regex: paginationSearch.search, $options: 'i' } },
                        { answer: { $regex: paginationSearch.search, $options: 'i' } },
                    ]
                }),
                // ...(paginationSearch.type && { type: paginationSearch.type }),
                is_deleted: false,
            }
            let options = await this.commonService.set_options(paginationSearch.pagination, paginationSearch.limit)
            let data = await this.model.FaqsModel.find(query, {}, options);
            let count = await this.model.FaqsModel.countDocuments(query)
            return {
                data, count
            }
        }
        catch (error) {
            throw error;
        }
    }

    async findOne(id: string) {
        try {
            let query = { _id: new Types.ObjectId(id) }
            return this.model.FaqsModel.findOne(query);
        }
        catch (error) {
            throw error;
        }
    }

    async update(id: string, updateFaqDto: UpdateFaqDto) {
        try {
            let updated= await this.model.FaqsModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id),is_deleted:false },
                { updated_at: moment().utc().valueOf(),...updateFaqDto},
                { new: true }
            );
            if(!updated){
            throw new HttpException('Deleted FAQs!!', HttpStatus.BAD_REQUEST)
            }
            return updated
        }
        catch (error) {
            throw error;
        }
    }

    async remove(id: string) {
        try {
            await this.model.FaqsModel.findOneAndUpdate(
                { _id: new Types.ObjectId(id), is_deleted: false },
                { is_deleted: true, updated_at: moment().utc().valueOf() },
                { new: true }
            )
            throw new HttpException('Deleted!!', HttpStatus.OK)
        }
        catch (error) {
            throw error;
        }
    }
}