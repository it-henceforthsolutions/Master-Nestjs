import { Injectable } from "@nestjs/common";
import mongoose, { Types } from "mongoose";
import * as dto from './dto/index';
import { CommonServices } from "src/common/common.services";
import { ModelService } from "src/model/model.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ChatAggregation {
    constructor(
        private models: ModelService,
        private userservices: UsersService,
        private common: CommonServices,
        private model: ModelService,

    ) { }

    facetData = async (page: any, limit: any) => {
        return {
            $facet: {
                metadata: [{ $count: "count" }],
                data: [
                    { $skip: parseInt(page) },
                    { $limit: parseInt(limit) },
                ],
            },
        };
    }

    blocked_user_ids = async (user_id: string) => {
        try {
            let blocked_user_ids = [];
            if (user_id != null) {
                let query = { block_by: new Types.ObjectId(user_id) }
                let projection = { block_to: 1 }
                let options = { lean: true }
                let blocked_users = await this.model.blocks.find(query, projection, options).exec();
                if (blocked_users.length) {
                    for (let i = 0; i < blocked_users.length; i++) {
                        let blocked_user_id = JSON.stringify(blocked_users[i].block_to)
                        if (JSON.stringify(user_id) != blocked_user_id) {
                            blocked_user_ids.push(blocked_users[i].block_to)
                        }
                    }
                }
            }
            console.log("blocked_user_ids...", blocked_user_ids)
            return blocked_user_ids
        }
        catch (err) {
            throw err;
        }
    }

    chat_list = async (req: dto.user_data, dto: dto.search_user) => {
        try {
            let { _id: user_id } = req.user_data;
            let { pagination, limit, search } = dto;
            let options = await this.common.setOptions(pagination, limit);
            let blocked_user = await this.blocked_user_ids(user_id);
            let options2 = { lean: true }
            let query = [
                await this.match_user(user_id),
                await this.set_user(user_id),
                await this.lookup_user(blocked_user),
                await this.unwind_user(),
                await this.redact_user(search),
                // await this.blocked_user(user_id),
                await this.lookup_unread_chat(user_id),
                await this.count_unread_chat(),
                await this.lookup_last_message(user_id),
                await this.unwind_last_message(),
                await this.group_chat_list(),
                await this.sort_chat_list(),
                await this.facetData(options.skip, options.limit),
            ]

            let fetch_connection = await this.models.connections.aggregate(query, options2).exec();
            let response = {
                count: fetch_connection[0]?.metadata[0]?.count,
                data: fetch_connection[0]?.data,
            }
            return response;
        }
        catch (err) {
            throw err;
        }
    }


    match_user = async (user_id: string) => {
        try {
            return {
                $match: {
                    $or: [
                        { sent_by: new Types.ObjectId(user_id) },
                        { sent_to: new Types.ObjectId(user_id) },
                        { members: { $elemMatch: { _id: new Types.ObjectId(user_id) } } }
                    ],
                    $nor: [
                        { deleted_for: { $in: [new Types.ObjectId(user_id)] } }
                    ]

                }
            }
        }
        catch (err) {
            throw err
        }
    }

    set_user = async (user_id: string) => {
        try {
            return {
                $addFields: {
                    othe_user_id: {
                        $cond: {
                            if: {
                                $eq: ["$sent_by", new Types.ObjectId(user_id)]
                            },
                            then: "$sent_to",
                            else: "$sent_by",
                        }
                    }
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    lookup_user = async (blocked_user_ids: Array<string>) => {
        try {
            return {
                $lookup: {
                    from: "users",
                    let: { user_id: "$othe_user_id", blocked_user_ids: { $ifNull: [blocked_user_ids, []] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $not: { $in: ["$_id", "$$blocked_user_ids"] } },
                                        { $eq: ["$_id", "$$user_id"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                profile_pic: 1,
                                user_name: 1,
                                full_name: 1,
                                last_seen: 1,
                                is_online: 1
                            }
                        },
                    ],
                    as: "users"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    blocked_user = async (user_id: string) => {
        try {
            return {
                $lookup: {
                    from: "blocks",
                    let: { block_to: "$othe_user_id", block_by: new Types.ObjectId(user_id) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$block_to", "$$block_to"] },
                                        { $ne: ["$block_by", "$$block_by"] }
                                    ]
                                }
                            }
                        },
                    ],
                    as: "blocked"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    unwind_user = async () => {
        try {
            return {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    lookup_unread_chat = async (user_id: string) => {
        try {
            return {
                $lookup: {
                    from: "messages",
                    let: { connection_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$sent_by", new Types.ObjectId(user_id)] },
                                        { $eq: ["$connection_id", "$$connection_id"] },
                                        { not: { $in: [new Types.ObjectId(user_id), "$read_by"] } }
                                    ]
                                }
                            }
                        },

                    ],
                    as: "unread_chat"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    count_unread_chat = async () => {
        try {
            return {
                $addFields: {
                    unread_count: { $size: "$unread_chat" }
                }
            }
        } catch (err) {
            throw err
        }
    }

    lookup_last_message = async (user_id: string) => {
        try {
            return {
                $lookup: {
                    from: "messages",
                    let: { connection_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$connection_id", "$$connection_id"] },
                                        { $not: { $in: [new Types.ObjectId(user_id), { $ifNull: ["$deleted_for", []] }] } }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { _id: 1, message: 1 }
                        },
                        { $sort: { _id: -1 } as { _id: -1 } },
                        { $limit: 1 }
                    ],
                    as: "last_messages"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    unwind_last_message = async () => {
        try {
            return {
                $unwind: {
                    path: "$last_messages",
                    preserveNullAndEmptyArrays: true
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    group_chat_list = async () => {
        try {
            return {
                $group: {
                    _id: "$_id",
                    other_user_id: { $first: "$other_user_id" },
                    updated_at: { $first: "$updated_at" },
                    users: { $first: "$users" },
                    group_name: { $first: "$name" },
                    group_image: { $first: "$image_url" },
                    group_code: { $first: "$group_code" },
                    unread_count: { $first: "$unread_count" },
                    chat_type: { $first: "$chat_type" },
                    group_type: { $first: "$group_type" },
                    group_members: { $first: "$members" },
                    last_message: { $first: { $ifNull: ["$last_messages", null] } },
                    is_blocked: {
                        $first: {
                            $cond: {
                                if: { $eq: [{ $size: { $ifNull: ["$blocked", []] } }, 0] },
                                then: false,
                                else: true
                            }
                        }
                    },
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    sort_chat_list = async () => {
        try {
            return {
                $sort: { updated_at: -1 } as { updated_at: -1 }
            }
        } catch (err) {
            throw err
        }
    }

    members = async (connection_id: string) => {
        try {
            let query = [
                await this.match_member(connection_id),
                await this.lookup_member_user(connection_id),
                await this.group_members()
            ]
            let fetch_members = await this.models.connections.aggregate(query).exec();
            return fetch_members[0]
        }
        catch (err) {
            throw err
        }
    }


    match_member = async (connection_id: string) => {
        try {
            return {
                $match: {
                    _id: new Types.ObjectId(connection_id)
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    lookup_member_user = async (connection_id: string) => {
        try {
            return {
                $lookup: {
                    from: "users",
                    let: { members: "$members" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", { $ifNull: ["$$members._id", []] }],
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                profile_pic: 1,
                                user_name: 1,
                                full_name: 1,
                                last_seen: 1
                            }
                        },
                        {
                            $lookup: {
                                from: "messages",
                                let: { user_id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$connection_id", new Types.ObjectId(connection_id)] },
                                                    { $eq: ["$sent_by", "$$user_id"] },
                                                ]
                                            }
                                        }
                                    },

                                ],
                                as: "total_message"
                            }
                        },
                        {
                            $addFields: {
                                total_message: {
                                    $cond: {
                                        if: { $eq: [{ $size: "$total_message" }, 0] },
                                        then: 0,
                                        else: { $size: "$total_message" },
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                role: {
                                    $let: {
                                        vars: { member: { $arrayElemAt: ["$$members", { $indexOfArray: ["$$members._id", "$_id"] }] } },
                                        in: "$$member.role"
                                    }
                                }
                            }
                        },
                        {
                            $addFields: {
                                joined_at: {
                                    $let: {
                                        vars: { member: { $arrayElemAt: ["$$members", { $indexOfArray: ["$$members._id", "$_id"] }] } },
                                        in: "$$member.joined_at"
                                    }
                                }
                            }
                        }

                    ],
                    as: "users"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    group_members = async () => {
        try {
            return {
                $group: {
                    _id: "$_id",
                    chat_type: { $first: "$chat_type" },
                    group_name: { $first: "$name" },
                    group_image: { $first: "$image_url" },
                    group_code: { $first: "$group_code" },
                    group_members: { $first: "$users" },
                    total_members: { $first: { $size: "$members" } },
                    last_message: { $first: "$last_message" },
                    created_at: { $first: "$created_at" },
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    all_users = async (req: dto.user_data, dto: dto.search_user) => {
        try {
            let { _id: user_id } = req.user_data;
            let { pagination, limit, search } = dto;
            let options = await this.common.setOptions(pagination, limit);
            let query: any = { is_deleted: false, is_blocked: false }
            if (search) {
                query = { is_deleted: false, is_blocked: false, full_name: { $regex: search, $options: "i" } }
            }
            let projection = { full_name: 1, user_name: 1, profile_pic: 1, last_seen: 1, is_online: 1 }
            let fetch_user = await this.model.users.find(query, projection, options).exec();
            let user_count = await this.model.users.countDocuments(query).exec();
            let response = {
                count: user_count,
                fetch_user: fetch_user
            }
            return response
        } catch (e) {
            throw e
        }
    }

    redact_user = async (search: string) => {
        try {
            return {
                $redact: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $or: [
                                        { $eq: [search, undefined] },
                                        {
                                            $regexMatch: {
                                                input: "$users.full_name",
                                                regex: search,
                                                options: "i"
                                            }
                                        },
                                        {
                                            $regexMatch: {
                                                input: "$users.user_name",
                                                regex: search,
                                                options: "i"
                                            }
                                        }

                                    ]
                                }
                            ]
                        },
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            }
        } catch (e) {
            throw e
        }
    }

}


@Injectable()
export class MessageListing {
    constructor(
        private models: ModelService
    ) { }


    message_listing = async (connection_id: string, req: dto.user_data) => {
        try {
            let { _id: user_id } = req.user_data;
            let options = { lean: true }
            let query = [
                await this.match_connection(connection_id),
                await this.lookup_message(new Types.ObjectId(user_id)),
                await this.unwind_message(),
                await this.sent_by(),
                await this.unwind_sent_by(),
                await this.sent_to(),
                await this.unwind_sent_to(),
                await this.group_message(),
                await this.sort_message()
            ]

            let fetch_connection = await this.models.connections.aggregate(query, options).exec();
            console.log("connection_id---", connection_id);
            console.log("fetch_connection---", fetch_connection);

            return fetch_connection;
        }
        catch (err) {
            throw err;
        }
    }

    match_connection = async (connection_id: string) => {
        try {
            return {
                $match: {
                    _id: new Types.ObjectId(connection_id)
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    lookup_message = async (user_id: Types.ObjectId) => {
        try {
            return {
                $lookup: {
                    from: "messages",
                    let: { connection_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$connection_id", "$$connection_id"] },
                                        // { not: { $in: [new Types.ObjectId(user_id), "$deleted_for"] } },
                                        {
                                            $not: {
                                                $in: [new Types.ObjectId(user_id), { $ifNull: ["$deleted_for", []] }],
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                    ],
                    as: "messages"
                }
            }
        }
        catch (err) {
            throw err
        }
    }

    unwind_message = async () => {
        try {
            return {
                $unwind: {
                    path: "$messages",
                    preserveNullAndEmptyArrays: false
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    sent_by = async () => {
        try {
            return {
                $lookup: {
                    from: "users",
                    let: { user_id: "$messages.sent_by" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$user_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                full_name: 1,
                                // lastname: 1,
                                profile_pic: 1,
                                is_online: 1
                            }
                        }
                    ],
                    as: "sent_by_user"
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    unwind_sent_by = async () => {
        try {
            return {
                $unwind: {
                    path: "$sent_by_user",
                    preserveNullAndEmptyArrays: true
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    sent_to = async () => {
        try {
            return {
                $lookup: {
                    from: "users",
                    let: { user_id: "$messages.sent_to" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$user_id"]
                                }
                            }
                        },
                        {
                            $project: {
                                full_name: 1,
                                // lastname: 1,
                                profile_pic: 1,
                                is_online: 1

                            }
                        }
                    ],
                    as: "sent_to_user"
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    unwind_sent_to = async () => {
        try {
            return {
                $unwind: {
                    path: "$sent_to_user",
                    preserveNullAndEmptyArrays: true
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    group_message = async () => {
        try {
            return {
                $group: {
                    _id: "$messages._id",
                    is_private: { $first: "$is_private" },
                    last_message: { $first: "$last_message" },
                    group_code: { $first: "$group_code" },
                    message_id: { $first: "$messages._id" },
                    sent_by_user: { $first: "$sent_by_user" },
                    sent_to_user: { $first: "$sent_to_user" },
                    type: { $first: "$messages.type" },
                    message_type: { $first: "$messages.message_type" },
                    message: { $first: "$messages.message" },
                    media_url: { $first: "$messages.media_url" },
                    read_by: { $first: "$messages.read_by" },
                    lat: { $first: "$messages.lat" },
                    long: { $first: "$messages.long" },
                    created_at: { $first: "$messages.created_at" },
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    sort_message = async () => {
        try {
            return {
                $sort: { created_at: -1 } as { created_at: -1 }
            }
        }
        catch (err) {
            throw err;
        }
    }
}