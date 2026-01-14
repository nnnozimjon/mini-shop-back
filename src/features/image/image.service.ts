import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ImagesService {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'products');

  getImagePath(filename: string): string {
    if (!filename) {
      throw new NotFoundException('Имя файла не указано');
    }

    const filePath = join(this.uploadsDir, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Изображение не найдено');
    }

    return filePath;
  }
}
