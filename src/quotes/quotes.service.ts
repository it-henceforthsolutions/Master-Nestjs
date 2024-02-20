import { BadRequestException, GoneException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuoteDto, PaginationDto } from './dto/create-quote.dto';
import { CommonService } from 'src/common/common.service';
import * as  moment from 'moment';
import { InjectModel } from '@nestjs/mongoose';
import { Quotes } from './schema/quotes.schema';
import { Model, Types } from 'mongoose';
import { ModelService } from 'src/model/model.service';

@Injectable()
export class QuotesService {

    constructor(
        private model: ModelService,
        
        private readonly commonService: CommonService
    ) { }

    async create(createQuoteDto: CreateQuoteDto) {
        try {
            let quote = await this.model.QuotesModel.create(createQuoteDto)
            return quote
        }
        catch (error) {
            console.log(error);
            throw new error
        }
    }

    async findAll(searchQuery: PaginationDto) {
        try {
            let startDate: any;
            let endDate: any;
            if (searchQuery.start_date && searchQuery.end_date) {
                let start_date = moment(searchQuery.start_date);
                startDate = start_date.startOf('day').valueOf(); // Use startOf('day') and valueOf() to get the start of the day in milliseconds
                let end_date = moment(searchQuery.end_date);
                endDate = end_date.endOf('day').valueOf(); // Use startOf('day') and valueOf() to get the start of the day in milliseconds
            }
            let query = {
                ...(searchQuery.search && {
                    $or: [
                        { first_name: { $regex: searchQuery.search, $options: 'i' } },
                        { last_name: { $regex: searchQuery.search, $options: 'i' } },
                        { email: { $regex: searchQuery.search, $options: 'i' } },
                    ]
                }),
                ...((searchQuery.start_date && searchQuery.end_date) && {
                    created_at: {
                        $gte: Number(startDate),
                        $lte: Number(endDate)
                    }
                }),
                is_deleted: false
            }
            let project: any
            if (searchQuery.start_date && searchQuery.end_date) {
                project = {
                    first_name: 1, last_name: 1, _id: 1, is_active: 1, email: 1, country_code: 1, phone_no: 1
                }
            }
            let options = await this.commonService.set_options(searchQuery.pagination, searchQuery.limit)
            let data = await this.model.QuotesModel.find(query, project, options);
            let count = await this.model.QuotesModel.countDocuments(query)
            return {
                data: data,
                count: count
            }
        }
        catch (error) {
            throw new error
        }
    }

    async findOne(id: string) {
        try {
            let data = await this.model.QuotesModel.findOne({ _id: new Types.ObjectId(id), is_deleted: false });
            if(!data){
                throw new HttpException('Deleted Quote',HttpStatus.BAD_REQUEST)
            }
            return data
        }
        catch (error) {
            throw error
        }
    }

    async update(id: string) {
        try {
            let quote = await this.findOne(id)
            if (quote.is_resolved == true) {
                await this.model.QuotesModel.findByIdAndUpdate({ _id: id }, { is_resolved: false }, { new: true });
                throw new HttpException('Pending!!', HttpStatus.OK)
            }
            await this.model.QuotesModel.findByIdAndUpdate({ _id: id }, { is_resolved: true }, { new: true });
            throw new HttpException('Resolved!!', HttpStatus.OK)
        }
        catch (error) {
            console.log(error);
            throw error
        }
    }

    async remove(id: string) {
        try {
            await this.model.QuotesModel.findOneAndUpdate(
                { is_deleted: false, _id: new Types.ObjectId(id) },
                { is_deleted: true },
                { new: true }
            )
            throw new HttpException('Deleted!!', HttpStatus.OK)
        } catch (error) {
            throw error
        }
    }
}
