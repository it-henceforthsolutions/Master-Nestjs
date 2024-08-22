
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk'
import { ConfigService } from '@nestjs/config';
import { SharpService } from 'nestjs-sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import * as genThumbnail from 'simple-thumbnail';
import * as moment from 'moment'


@Injectable()
export class UploadService {
  private s3: AWS.S3;
  private readonly bucketName: string;
  private base_url: string;

  constructor(private readonly configService: ConfigService,
    private readonly sharpService: SharpService) {
    this.base_url = this.configService.get<string>('BASE_URL')
    const aws_spaces_endpoint = this.configService.get<string>('ENDPOINT')


    const spaceEndpoint = new AWS.Endpoint(aws_spaces_endpoint);
    // genThumbnail.ffmpegPath = ffmpegStatic;
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('SECRET_ACCESS_KEY'),
      endpoint: spaceEndpoint,
    });

    this.bucketName = this.configService.get<string>('BUCKET_NAME');
  }

  // async uploadFile(image: any) {
  //   try {
  //     const { originalname, buffer, mimetype } = image;
  //     let response = await this.upload_images(originalname, buffer, mimetype)
  //     return response;
  //   }
  //    catch (error) {
  //     console.error('Error uploading file:', error);
  //     throw error;
  //   }
  // }



  async uploadFile(file: any) {
    try {
      const { originalname, buffer, mimetype } = file;
      let response;
      let split_mime_type = mimetype.split('/')

      if (mimetype.startsWith('image/')) {
        response = await this.upload_images(originalname, buffer, mimetype);
      } else if (mimetype === 'application/pdf') {
        response = await this.upload_file(originalname, buffer, mimetype, 'PDF');
      } else if (mimetype.startsWith('video/')) {
        response = await this.create_original_video(originalname, buffer, mimetype, file);
      } else if (mimetype.startsWith('audio/')) {
        response = await this.upload_audio(originalname, buffer, mimetype);
      }
      else {
        // Handling documents: .pdf, .doc, .ppt, .pptx
        const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (documentTypes.includes(mimetype)) {
          response = await this.upload_file(originalname, buffer, mimetype, 'DOCUMENT');
        } else {
          throw new Error('Unsupported file type.');
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async upload_images(name: string, data: object, mime_type: string) {
    try {
      let file_name = await this.generate_file_name(name)
      await this.create_original_file(file_name, data, mime_type)
      await this.create_medium_file(file_name, data, mime_type)
      await this.create_small_file(file_name, data, mime_type)
      let response = {
        base_url: this.base_url,
        type: 'IMAGE',
        folders: ['original', 'medium', 'small'],
        file_name: file_name
      }
      return response
    }
    catch (err) {
      throw err;
    }
  }


  async create_original_file(name: string, data: any, mime_type: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `image/original/${name}`,
        ACL: 'public-read',
        Body: data, // Use the edited image buffer as the body
        ContentType: mime_type,
      };
      let response = await this.upload_file_to_spaces(params)
      return response
    }
    catch (err) {
      throw err;

    }
  }

  async create_medium_file(name: string, data: any, mime_type: string) {
    try {
      const editedImage = await this.sharpService
        .edit(data) // Pass the image data to the edit function
        .resize({ width: 250, height: 250 }) // Set

      const params = {
        Bucket: this.bucketName,
        Key: `image/medium/${name}`,
        ACL: 'public-read',
        Body: editedImage, // Use the edited image buffer as the body
        ContentType: mime_type,
      };
      // create original file
      let response = await this.upload_file_to_spaces(params)
      return response
    }
    catch (err) {
      throw err;
    }
  }

  async create_small_file(name: string, data: any, mime_type: string) {
    try {
      const editedImage = await this.sharpService
        .edit(data)
        .resize({ width: 100, height: 100 })
      let params = {
        Bucket: this.bucketName,
        Key: `image/small/${name}`,
        ACL: 'public-read',
        Body: editedImage,
        ContentType: mime_type
      }
      // create original file
      let response = await this.upload_file_to_spaces(params)
      return response
    }
    catch (err) {
      throw err;
    }
  }

  async upload_file_to_spaces(params: any) {
    return new Promise((resolve, reject) => {
      try {
        this.s3.upload(params, (err: any, data: any) => {
          if (err) { console.error("uploading error", err) }
          else {
            console.error("uploading sucessfull-------", data)
            return resolve(data);
          }
        });
      } catch (err) {
        return reject(err);
      }
    });
  }




  async upload_file(name: string, data: Buffer, mime_type: string, type: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `documents/${name}`,
        ACL: 'public-read',
        Body: data,
        ContentType: mime_type,
      };
      await this.upload_file_to_spaces(params);
      const response = {
        base_url: this.base_url,
        type: "DOCUMENT",
        folders: ['documents'],
        file_name: name,
      };
      return response;
    } catch (err) {
      throw err;
    }
  }



  async create_original_video(name: string, data: any, mime_type: string, file: any) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `video/${name}`,
        ACL: 'public-read',
        Body: data,
        ContentType: mime_type,
      };
      let data_thumb = await this.fetch_file(file)
      //console.log("dataThumb......",data_thumb);

      await this.upload_file_to_spaces(params);

      const response = {
        base_url: this.base_url,
        type: "VIDEO",
        folders: ['video'],
        file_name: name,
        thumb_nail: data_thumb
      };
      return response;
    } catch (err) {
      throw err;
    }
  }


  async upload_audio(name: string, data: Buffer, mime_type: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `audio/${name}`,
        ACL: 'public-read',
        Body: data,
        ContentType: mime_type,
      };
      await this.upload_file_to_spaces(params);
      const response = {
        base_url: this.base_url,
        type: 'AUDIO',
        folders: ['audio'],
        file_name: name,
      };
      return response;
    } catch (err) {
      throw err;
    }
  }

  async fetch_file(file: any) {
    try {
      const { originalname, buffer, mimetype } = file;
      let file_url = `${this.base_url}/${this.bucketName}/video/${originalname}`;
      // let output_path = path.resolve(__dirname, `../../src/public/images/${originalname}_thumbnail.png`);
      let output_path = path.resolve(__dirname, `../../public/images/path.png`)
      //console.log("fileurl......",file_url);
      //console.log("fileur11......",output_path);

      let gen_thumb = await this.gen_thumbnail(file_url, output_path);
      console.log("gen_thumb--", gen_thumb)
      if (gen_thumb === true) {
        let fetch_file = path.resolve(__dirname, `../../public/images/path.png`);
        let mime_type = mime.lookup(fetch_file);
        let read_file = fs.readFileSync(fetch_file);
        let file_name = await this.generate_file_name('path.png')

        //console.log('filename...........',file_name);

        let params = {
          Bucket: this.bucketName,
          Key: `video/${file_name}`,
          ACL: 'public-read',
          Body: read_file,
          ContentType: mime_type,
        };

        await this.upload_file_to_spaces(params);

        let s3_file_name = file_name
        if (s3_file_name != undefined) {
          fs.unlinkSync(fetch_file)
        }

        return s3_file_name;
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  }


  async gen_thumbnail(file_url: string, output_path: string) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        //console.log("str1.......",file_url);
        //console.log("str.......",output_path);

        genThumbnail(file_url, output_path, '360x?')
          .then(() => {
            //console.log('Thumbnail generated!');
            return resolve(true);
          })
          .catch((err: any) => {
            console.error('Error generating thumbnail:', err);
            return resolve(false);
          });
      } catch (err) {
        console.error('Error generating thumbnail:', err);
        return resolve(false);
      }
    });
  }

  generate_file_name = async (file_name: string) => {
    try {

      //console.log("<--file_name-->", file_name)

      let current_millis = moment().format('x')
      let raw_file_name = file_name.split(/\s/).join('');
      let split_file = raw_file_name.split('.')

      // spiting by all special charcters
      let split_all = split_file[0].split(/[^a-zA-Z0-9]/g).join('_')

      let name = split_all.toLowerCase()
      let ext = split_file[1]

      //console.log("<--name-->", name)
      //console.log("<--ext-->", ext)

      let gen_file_name = `${name}_${current_millis}.${ext}`

      //console.log("<--gen_file_name-->", gen_file_name)

      return gen_file_name.toLowerCase()

    }
    catch (err) {
      throw err;
    }
  }

}
