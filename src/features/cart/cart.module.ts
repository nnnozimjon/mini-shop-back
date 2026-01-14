import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart-item.entity';
import { Product } from '@entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UserModule } from '@features/user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product]), UserModule],
  providers: [CartService, JwtService],
  controllers: [CartController],
})
export class CartModule {}
