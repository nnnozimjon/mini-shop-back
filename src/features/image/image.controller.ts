import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ImagesService } from './image.service';

@Controller('image')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':filename')
  serveImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return res.sendFile(this.imagesService.getImagePath(filename));
  }
}
