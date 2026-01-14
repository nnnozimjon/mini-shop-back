import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@entities/order.entity';
import { OrderItem } from '@entities/order-item.entity';
import { Cart } from '@entities/cart.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@features/user/user.module';
import { CartItem } from '@entities/cart-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem]), UserModule],
  providers: [OrderService, JwtService],
  controllers: [OrderController],
})
export class OrderModule {}
