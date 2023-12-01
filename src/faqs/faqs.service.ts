import { Injectable } from '@nestjs/common';
import { CreateFaqDto, PaginationDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { DatabaseService } from 'src/database/database.service';
import { UnauthorizeUser } from 'src/handler/error.exception';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class FaqsService {
    constructor(
        private model: DatabaseService,
        private readonly commonService: CommonService
    ) { }
    
    async create(uid: string, createFaqDto: CreateFaqDto,) {
        try {
            let admin = await this.model.Staffs.findOne({ _id: uid })

            if (admin && admin != null) {
                let newFaq = this.model.Faqs.create(createFaqDto);
                return newFaq
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error;
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
                ...(paginationSearch.type && { type: paginationSearch.type }),
                isDeleted: false,
            }
            let options = await this.commonService.set_options(paginationSearch.pagination, paginationSearch.limit)
            let data = await this.model.Faqs.find(query, {}, options);
            let count = await this.model.Faqs.countDocuments(query)
            return {
                data, count
            }
        }
        catch (error) {
            return error;
        }
    }

    async findOne(uid: string, id: string) {
        try {
            let admin = await this.model.Staffs.findOne({ _id: id })

            if (admin && admin != null) {
                // let projection = { isDeleted: false }
                let query = { _id: uid }
                return this.model.Faqs.findOne(query);
            } else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error;
        }
    }

    async update(uid: string, id: string, updateFaqDto: UpdateFaqDto) {
        try {
            let admin = await this.model.Staffs.findById({ _id: id })

            if (admin && admin != null) {
                let query = { _id: uid }
                let updatedFaq = await this.model.Faqs.findByIdAndUpdate(query, updateFaqDto, { new: true });

                return {
                    updatedFaq,
                    message: 'Faq updated successfully'
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error;
        }
    }

    async remove(uid: string, id: any) {
        try {
            let admin = await this.model.Staffs.findById({ _id: id })
            // return admin;
            if (admin && admin != null) {
                let query = { _id: uid }
                // return query;
                let data = await this.findOne(uid, id)
                // return data;
                if (data?.isDeleted == false) {
                    let deleted = true
                    let delFaq = await this.model.Faqs.findByIdAndUpdate(query, { isDeleted: deleted }, { new: true });
                    return {
                        delFaq,
                        message: 'Deleted Successfully!!'
                    }
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error;
        }
    }
}