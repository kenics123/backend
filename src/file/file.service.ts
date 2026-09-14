import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './file.response';
import { assertAllowedImageFiles } from 'src/common/image-upload';

@Injectable()
export class FileService {
  async uploadToCloudinary(file: Express.Multer.File) {
    assertAllowedImageFiles([file]);
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'my_uploads', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error as CloudinaryResponse);
            else resolve(result as CloudinaryResponse);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadMultipleToCloudinary(files: Express.Multer.File[]) {
    assertAllowedImageFiles(files || []);
    return Promise.all(files.map((file) => this.uploadToCloudinary(file)));
  }
}
