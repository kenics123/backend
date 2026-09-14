import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function isAllowedImageFile(file: Express.Multer.File): boolean {
  const mime = String(file.mimetype || '')
    .trim()
    .toLowerCase();
  const ext = extname(file.originalname || '')
    .trim()
    .toLowerCase();

  return ALLOWED_MIME.has(mime) && ALLOWED_EXT.has(ext);
}

export function assertAllowedImageFiles(files: Express.Multer.File[]): void {
  if (!files?.length) {
    return;
  }

  for (const file of files) {
    if (!isAllowedImageFile(file)) {
      throw new BadRequestException(
        `Invalid file type for "${file.originalname || 'upload'}". Only JPEG, PNG, WebP, and GIF images are allowed.`,
      );
    }
  }
}

export const imageFileFilter = (
  _req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!isAllowedImageFile(file)) {
    callback(
      new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed.',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};
