import { Controller, Body, Post, Get, Put, Patch, UseGuards, Request, Query, Param, Delete, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBasicAuth } from "@nestjs/swagger";
import { AgoraService } from "./agora.service";


@ApiTags('Agora')
@Controller('agora')
export class AgoraController {
    constructor(
        private agoraservice: AgoraService,
    ) { }

    @ApiOperation({ summary: 'agora create token' })
    @Post('/token')
    async create_token() {
        try {
            let data = await this.agoraservice.create_token();
            let response = {
                success: true,
                data: data
            }
            return response
        } catch (error) {
            throw error
        }
    }
}