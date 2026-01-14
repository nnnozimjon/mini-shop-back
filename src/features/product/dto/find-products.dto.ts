import { IsArray, IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";
import { Transform } from 'class-transformer'

export enum ProductSortBy {
  CREATED_AT = "createdAt",
  PRICE = "price",
  NAME = "name",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class FindProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value.map(String) : String(value))
  @IsString({ each: true })
  categoryId?: string[];

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsNumberString()
  page?: string = "1";

  @IsOptional()
  @IsNumberString()
  limit?: string = "10";
}
