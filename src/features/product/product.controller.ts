import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import { Roles, ShowSuccessToast } from '@common/decorators';
import { Role } from '@common/enums';
import { FindProductsDto, CreateProductDto } from '@features/product';
import { FileUploadInterceptor } from '@common/interceptors';
import { RequiredFilePipe } from '@common/filters';
import { safeDeleteFile } from '@common/helpers';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getAll(@Query() query: FindProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileUploadInterceptor('image', {
      destination: './uploads/products',
      prefix: 'product',
      maxSizeMB: 5,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    }),
  )
  @ShowSuccessToast('Продукт создан успешно')
  async create(
    @Body() body: CreateProductDto,
    @UploadedFile(new RequiredFilePipe()) file: Express.Multer.File,
  ) {
    try {
      const product = await this.productService.create({
        ...body,
        imageFileName: file?.filename,
      });
      return
    } catch (error) {
      safeDeleteFile(file?.path);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ShowSuccessToast('Продукт успешно удален')
  delete(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
