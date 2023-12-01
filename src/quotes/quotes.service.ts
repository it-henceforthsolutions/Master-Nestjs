import { BadRequestException, GoneException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuoteDto, PaginationDto } from './dto/create-quote.dto';
import { DatabaseService } from 'src/database/database.service';
import { CommonService } from 'src/common/common.service';
import { UnauthorizeUser } from 'src/handler/error.exception';
import { NotificaionsV2Types } from 'src/notifications/schema/notification-v2.schema';
import * as  moment from 'moment';
import { ItemType, type } from 'src/notifications/schema/notification.schema';

@Injectable()
export class QuotesService {

    constructor(
        private model: DatabaseService,
        private readonly commonService: CommonService
    ) { }

    async create(createQuoteDto: CreateQuoteDto,user_id?: string) {
        try {
            let quote = await this.model.Quotes.create({...createQuoteDto, user_id: user_id})
            let admin = await this.model.Staffs.findOne({email:'admin@gmail.com'})
            let data = {
                sent_by: quote?.user_id,
                sender_email: quote?.email,
                admin_id: admin?._id,
                type: type.push,
                item_type: ItemType.contactUs,
                description: quote?.message,
                subject: 'Contact Us',
                quote_id: quote?._id,
                created_at: moment().utc().valueOf(),
                updated_at: moment().utc().valueOf(),
            }
            let newData = {
                sent_to: admin._id,
                type: NotificaionsV2Types.contactUs,
                description: quote.message,
                subject: quote.message,
                body: quote,
                created_at: moment().utc().valueOf(),
                updated_at: moment().utc().valueOf(),
            }            
            await this.model.NotificaitonV2.create(newData)
            await this.model.notifications.create(data)
            return quote
        }
        catch (error) {
            console.log(error);
            throw new error
        }
    }

    async findAll(id: string, searchQuery: PaginationDto) {
        try {
            let admin = await this.model.Staffs.findById(id)
            if (admin) {
                let startDate: any;
                let endDate: any;
                if (searchQuery.start_date && searchQuery.end_date) {
                    let start_date = moment(searchQuery.start_date);
                    startDate = start_date.startOf('day').valueOf(); // Use startOf('day') and valueOf() to get the start of the day in milliseconds
                    let end_date = moment(searchQuery.end_date);
                    endDate = end_date.endOf('day').valueOf(); // Use startOf('day') and valueOf() to get the start of the day in milliseconds
                }
                let query = {
                    ...(searchQuery.search && { $or: [
                        { first_name: { $regex: searchQuery.search, $options: 'i' } },
                        { last_name: { $regex: searchQuery.search, $options: 'i' } },
                        { email: { $regex: searchQuery.search, $options: 'i' } },
                    ] }),
                    ...((searchQuery.start_date && searchQuery.end_date) && {
                        created_at: {
                            $gte: Number(startDate),
                            $lte: Number(endDate)
                        }
                    }),
                    is_deleted: false
                }
                let project :any
                if(searchQuery.start_date && searchQuery.end_date){
                    project = {
                        first_name: 1,last_name : 1, _id: 1, is_active: 1,email: 1,country_code:1,phone_no:1 
                    }
                }
                let options = await this.commonService.set_options(searchQuery.pagination, searchQuery.limit)
                let data = await this.model.Quotes.find(query, project , options);
                let count = await this.model.Quotes.countDocuments(query)
                return {
                    data: data,
                    count: count
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            throw new error
        }
    }

    async findOne(uid: string, id: string) {
        try {
            let admin = await this.model.Staffs.findById(uid)
            if (admin) {
                let query = { _id: id }
                let response = await this.model.Quotes.findById(query);
                if (response?.is_deleted == false) {
                    return response;
                }
                else {
                    throw new BadRequestException("Quotes does not exist !!")
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            throw error
        }
    }

    async update(id: string, uid: string) {
        try {
            let admin = await this.model.Staffs.findById(uid)
            if (admin) {
                let toupdate = await this.findforDel(id)
                let resolved: any = {}
                if (toupdate.is_resolved == false) {
                    let is_resolved = true
                    resolved = await this.model.Quotes.findByIdAndUpdate({ _id: id }, { is_resolved: is_resolved }, { new: true });
                }
                else {
                    let is_resolved = false
                    resolved = await this.model.Quotes.findByIdAndUpdate({ _id: id }, { is_resolved: is_resolved }, { new: true });
                }

                let data = {
                    sent_by: admin?._id,
                    // sender_email: quote?.email,
                    sent_to: resolved?.user_id,
                    type: type.push,
                    item_type: ItemType.contactUs,
                    description: resolved?.message,
                    subject: 'Resolved',
                    quote_id: id,
                    created_at: moment().utc().valueOf(),
                    updated_at: moment().utc().valueOf(),
                }
                let newData = {
                    sent_to: resolved?.user_id,
                    type: NotificaionsV2Types.contactUs,
                    description: resolved.message,
                    subject: 'Resolved',
                    body: resolved,
                    created_at: moment().utc().valueOf(),
                    updated_at: moment().utc().valueOf(),
                }            
                await this.model.NotificaitonV2.create(newData)
                await this.model.notifications.create(data)
                return resolved
            }
            else {
                throw new UnauthorizeUser()
            }
        }
        catch (error) {
            console.log(error);
            throw error
        }
    }

    async findforDel(id: string) {
        try {
            return await this.model.Quotes.findById({ _id: id });
        }
        catch (error) {
            throw error
        }
    }

    async remove(id: string, uid: string) {
        try {
            let query = { _id: uid }
            let admin = await this.model.Staffs.findOne(query)
            if (admin) {
                let todelete = await this.findforDel(id)
                if (todelete.is_deleted == false) {

                    let isDeleted = true
                    await this.model.Quotes.findByIdAndUpdate({ _id: id }, { is_deleted: isDeleted }, { new: true })
                    return {
                        message: 'Deleted Sucessfully'
                    }
                }
                else {
                    return {
                        message: 'Already Deleted'
                    }
                }
            }
            else {
                throw new UnauthorizeUser()
            }
        } catch (error) {
            throw new error
        }
    }
}
