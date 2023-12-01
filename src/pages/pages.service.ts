import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePageDto, PaginationDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { DatabaseService } from 'src/database/database.service';
import { UnauthorizeUser } from 'src/handler/error.exception';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PagesService {

    constructor(
        private model: DatabaseService,
        private readonly commonService: CommonService
    ) { }

    async create(uid: string, createPageDto: CreatePageDto) {
        try {
            let admin = await this.model.Staffs.findOne({ _id: uid })
            if (admin) {
                let pagesResponse = await this.model.Pages.create(createPageDto);
                return {
                    _id: pagesResponse._id,
                    ...createPageDto
                }
            } else {
                throw new UnauthorizeUser()
            }
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
            let data = await this.model.Pages.find(query, {}, options);
            let count = await this.model.Pages.countDocuments(query)
            return { data, count }
        }
        catch (error) {
            return error
        }
    }

    async findOne(slug: string) {
        try {
            return await this.model.Pages.findOne({ slug, is_deleted: false });
        }
        catch (error) {
            throw new NotFoundException('Page Record Not Found')
        }
    }

    async update(uid: string, id: string, updatePageDto: UpdatePageDto) {
        try {
            let admin = await this.model.Staffs.findOne({ _id: id })

            if (admin && admin != null) {
                let query = { _id: uid }
                await this.model.Pages.findByIdAndUpdate(query, updatePageDto, { new: true });
                return updatePageDto
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error
        }
    }

    async checkforDelOne(uid: string) {
        try {
            let query = { _id: uid }
            return await this.model.Pages.findOne(query);
        }
        catch (error) {
            throw error
        }
    }

    async remove(uid: string, id: string) {
        try {
            let admin = await this.model.Staffs.findOne({ _id: id })
            if (admin && admin != null) {
                let query = { _id: uid }
                const isdelPage = await this.checkforDelOne(uid)
                if (isdelPage.is_deleted == false) {
                    let is_deleted = true;
                    let deleted = await this.model.Pages.findByIdAndUpdate(query, { is_deleted }, { new: true });
                    return {
                        message: 'Page deleted Successfully',
                        deleted
                    }
                }
                else {
                    throw new NotFoundException('page not found');
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            return error
        }
    }
}