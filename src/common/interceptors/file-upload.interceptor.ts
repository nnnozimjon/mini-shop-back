import {
  BadRequestException,
  Injectable,
  Type,
  mixin,
  NestInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileUploadOptions } from './file-upload.types';


export function FileUploadInterceptor(field: string, options: FileUploadOptions = {}): Type<NestInterceptor> {
  const {
    destination = './uploads',
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB = 5,
    prefix = 'file',
    ...multerOptions
  } = options;

  @Injectable()
  class MixinInterceptor extends FileInterceptor(field, {
    storage: diskStorage({
      destination,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        cb(null, `${prefix}-${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new BadRequestException(`Only allowed types: ${allowedMimeTypes.join(', ')}`), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    ...multerOptions,
  }) {}

  return mixin(MixinInterceptor);
}
