import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@entities/product.entity';
import { Category } from '@entities/category.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@features/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), UserModule],
  providers: [ProductService, JwtService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}
