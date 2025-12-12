import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { CloudinaryProvider } from './file.provider';
@Module({
  providers: [FileService, CloudinaryProvider],
})
export class FileModule {}
