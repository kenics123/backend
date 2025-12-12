import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './file.response';

@Injectable()
export class FileService {
  async uploadToCloudinary(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'my_uploads' }, (error, result) => {
          if (error) reject(error as CloudinaryResponse);
          else resolve(result as CloudinaryResponse);
        })
        .end(file.buffer);
    });
  }

  async uploadMultipleToCloudinary(files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.uploadToCloudinary(file)));
  }
}
