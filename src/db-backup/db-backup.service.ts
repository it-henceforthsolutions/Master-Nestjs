import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { SharpService } from 'nestjs-sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { exec } from 'child_process';
import { config } from 'dotenv';


config();
const { DB_HOST, DB_PORT, DB_NAME } = process.env;
const databaseConfig: string = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`

@Injectable()
export class DbBackupService {
    private s3: AWS.S3;
    private readonly bucketName: string;
    private readonly base_url: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly sharpService: SharpService,
    ) {
        this.base_url = this.configService.get<string>('BASE_URL');
        const doSpacesEndpoint = this.configService.get<string>('ENDPOINT')
        const spaceEndpoint = new AWS.Endpoint(doSpacesEndpoint);
        this.s3 = new AWS.S3({
            accessKeyId: this.configService.get<string>('ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('SECRET_ACCESS_KEY'),
            endpoint: spaceEndpoint,
        });
        this.bucketName = this.configService.get<string>('BUCKET_NAME');
    }

    async create_backup(backup_name: string, gzip: boolean) {
        try {
            let URI = databaseConfig
            
            let dump_path: any;
            if (process.env.ENVIORNMENT == "LOCAL") {
                dump_path = path.resolve(__dirname, `../../../db_backups/${backup_name}`)
                
            }
            else {
                dump_path = path.resolve(__dirname, `../../db_backups/${backup_name}`)
            }
            let command = `mongodump --uri="${URI}" ${gzip ? " --gzip" : ""} --archive="${dump_path}"`;
            let gen_backup_file = await this.exexute_backup_command(command)
            return gen_backup_file
        }
        catch (err) {
            throw err
        }
    }

    async exexute_backup_command(command: string) {
        return new Promise((resolve, reject) => {
            try {
                exec(command, (err) => {
                    if (err) { console.error("uploading error-..--..", err) }
                    else {
                        let message = "BACKUP_CREATED"
                        return resolve(message);
                    }
                });
            }
            catch (err) {
                throw err;
            }
        });
    }

    // if backup count is less than 10
    async backup_case_1() {
        try {
            let fetch_data: any = await this.gen_backup_name()
            
            let { name } = fetch_data
            let file_name = `${name}.gz`
            let gen_backup = await this.create_backup(file_name, true)
            
            if (gen_backup == 'BACKUP_CREATED') {
                let fetch_file = path.resolve(__dirname, `../../../db_backups/${file_name}`)
                // check file type
                let mime_type = await mime.lookup(fetch_file)
                // read file
                let read_file = fs.readFileSync(fetch_file);
                
                let params = {
                    Bucket: this.bucketName,
                    Key: `backup/${file_name}`,
                    Body: read_file,
                    ContentType: mime_type
                }
                let upload_file: any = await this.upload_file_to_spaces(params)

                
                let { Location, Key } = upload_file

                // 
                fs.unlinkSync(fetch_file)

                const paramsToGetObject = {
                    Bucket: this.bucketName,
                    Key: Key,
                    Expires: 3600, // URL expiration time in seconds (e.g., 1 hour)
                };
                const url = this.s3.getSignedUrl('getObject', paramsToGetObject);
                return url;

                // 
                // if (Location != undefined) {
                //     // remove file from local
                //     return Location
                // } else {
                //     throw new HttpException("BACKUP_UPLOAD_FAILED", HttpStatus.BAD_REQUEST)
                // }
            }
            else {
                throw new HttpException("BACKUP_UPLOAD_FAILED", HttpStatus.BAD_REQUEST)
            }
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }

    async gen_backup_name() {
        try {
            let unique_key = 1;
            let static_name = 'master_db_backup'
            let name = `${static_name}_${unique_key}`
            return {
                name: name,
                unique_key: unique_key
            }
        }
        catch (err) {
            console.log(err);

            throw err;
        }
    }
    async upload_file_to_spaces(params: any) {
        return new Promise((resolve, reject) => {
            try {
                this.s3.upload(params, (err: any, data) => {
                    if (err) { console.error("uploading error", err) }
                    else {
                        return resolve(data);
                    }
                });
            }
            catch (err) {
                throw reject(err);
            }
        });
    }
}
