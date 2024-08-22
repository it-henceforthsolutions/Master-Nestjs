import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UploadService } from './upload.service'
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiHeader, ApiConsumes } from '@nestjs/swagger';
import { imageUploadDto } from './dto/upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: imageUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log("request.....",file)
    const response = await this.uploadService.uploadFile(file);
    return response;
  }
}







