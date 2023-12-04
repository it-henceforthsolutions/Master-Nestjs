import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsConfig {
    constructor(private configService: ConfigService) {
        AWS.config.update({
            accessKeyId: this.configService.get<string>('ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('SECRET_ACCESS_KEY'),
            region: this.configService.get<string>('AWS_REGION')
        });
    }

    getS3Instance(): AWS.S3 {
        return new AWS.S3();
    }
}

