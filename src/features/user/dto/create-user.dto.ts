import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'должно быть действительным email' })
  email: string;

  @IsNotEmpty()
  @IsString({ message: 'не должно быть пустым' })
  @MinLength(8, { message: 'должно содержать не менее 8 символов' })
  password: string;

  @IsNotEmpty()
  @IsString({ message: 'не должно быть пустым' })
  name: string;
}
