import { Module } from '@nestjs/common';
import { ImagesController } from './image.controller';
import { ImagesService } from './image.service';

@Module({
  imports: [],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImageModule {}
