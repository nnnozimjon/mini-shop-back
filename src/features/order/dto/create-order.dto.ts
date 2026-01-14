import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString({ message: 'не должно быть пустым' })
    fullName: string;

    @IsNotEmpty()
    @IsString({ message: 'не должно быть пустым' })
    phone: string;

    @IsNotEmpty()
    @IsString({ message: 'не должно быть пустым' })
    address: string;
}