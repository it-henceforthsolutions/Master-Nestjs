import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Types } from 'mongoose';
import { ApiBasicAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import * as dto from "./dto/index";
import { ChatAggregation, MessageListing } from "./chat.aggregation";
import { ChatServices } from './chat.services';
import { AuthGuard } from 'src/auth/auth.guards';

@ApiTags('Chat')
@Controller('user/chat')
export class ChatController {

    constructor(
        private ChatAggregation: ChatAggregation,
        private MessageListing: MessageListing,
        private chatService: ChatServices,
    ) { }


    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User all Users Api' })
    @Get('/users')
    async users(@Req() req: dto.user_data, @Query() dto: dto.search_user) {
        try {
            console.log("dto-------------------", dto);
            let data = await this.ChatAggregation.all_users(req, dto);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }

    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User Chat Users Api' })
    @Get('/list')
    async chatUsers(@Req() req: dto.user_data, @Query() dto: dto.search_user) {
        try {
            console.log("dto-------------------", dto);
            let data = await this.ChatAggregation.chat_list(req, dto);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }


    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User messages listing Api' })
    @ApiParam({ name: 'id', type: String, description: "Enter here connection_id" })
    @Get('/message/:id')
    async message_listing(@Param('id') id: string, @Req() req: dto.user_data) {
        try {
            let data = await this.MessageListing.message_listing(id, req);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }

    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User group_members list Api' })
    @ApiParam({ name: 'id', type: String, description: "Enter here connection id" })
    @Get('/group_members/:id')
    async group_members(@Param('id') id: string) {
        try {
            let data = await this.ChatAggregation.members(id);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }


    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User Mute Notification Api' })
    @Patch('/mute/notification')
    async mute_notification(@Body() dto: dto.mute_notification, @Req() req: dto.user_data) {
        try {
            let data = await this.chatService.mute_notification(dto, req);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }

    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User clear all messages Api' })
    @ApiParam({ name: 'id', type: String, description: "Enter here connection_id" })
    @Delete('/message/:id')
    async clear_messages(@Param('id') id: string, @Req() req: dto.user_data) {
        try {
            let data = await this.chatService.clear_message(id, req);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }

    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User Delete messages Api' })
    @Delete('/messages')
    async remove_messages(@Body() dto: dto.delete_message, @Req() req: dto.user_data) {
        try {
            let data = await this.chatService.delete_message(req, dto);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }


    @UseGuards(AuthGuard)
    @ApiBasicAuth('access_token')
    @ApiOperation({ summary: 'User Delete chat Api' })
    @ApiParam({ name: 'id', type: String, description: "Enter here connection_id" })
    @Delete('/chat/:id')
    async remove_chat(@Param('id') id: string, @Req() req: dto.user_data) {
        try {
            let data = await this.chatService.remove_connection(id, req);
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }

    // @UseGuards(AuthGuard)
    // @ApiOperation({ summary: 'User Video chat Api' })
    // @ApiBasicAuth('access_token')
    // @Delete('/video/chat')
    // async video_chat(@Body() dto:dto.video_chat,@Req() req: dto.user_data) {
    //     try {
    //         let data = await this.chatService.video_chat(req,dto);
    //         let response = {
    //             success: true,
    //             data: data
    //         }
    //         return response
    //     } catch (error) {
    //         throw error
    //     }
    // }
}