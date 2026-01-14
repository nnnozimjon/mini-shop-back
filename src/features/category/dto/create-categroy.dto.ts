import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'не должно быть пустым' })
  name: string;
}
