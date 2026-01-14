import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@entities/product.entity';
import { Category } from '@entities/category.entity';
import { FindProductsDto, CreateProductInput } from '@features/product';
import { safeDeleteFile } from '@common/helpers';
import path from 'path';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async findAll(query: FindProductsDto) {
    const {
      search,
      categoryId,
      sortBy,
      order,
      page = '1',
      limit = '10',
    } = query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .take(take)
      .skip(skip)
      .orderBy(`product.${sortBy}`, order);

    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
      qb.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: CreateProductInput): Promise<Product> {
    const product = this.productRepo.create({
      name: data.name,
      description: data.description,
      price: data.price,
    });

    if (data.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: data.categoryId,
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${data.categoryId} not found`,
        );
      }
      product.category = category;
    }

    if (data.imageFileName) {
      product.image = `${process.env.STORAGE_URL}/${data.imageFileName}`;
    }

    return this.productRepo.save(product);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      categoryId?: string;
    }>,
  ) {
    const product = await this.findOne(id);
    Object.assign(product, data);
    if (data.categoryId) {
      const category = await this.categoryRepo.findOneBy({
        id: data.categoryId,
      });
      product.category = category;
    }
    return this.productRepo.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (!product) {
      throw new Error('Product not found');
    }
    const productNameParts = product.image?.split('/');
    const productName = productNameParts[productNameParts.length - 1];
    const imagePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'products',
      productName,
    );
    safeDeleteFile(imagePath);
    return this.productRepo.remove(product);
  }
}
