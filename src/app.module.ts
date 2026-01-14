import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@features/user/user.module';
import { AuthModule } from '@features/auth/auth.module';
import { CartModule } from '@features/cart/cart.module';
import { CategoryModule } from '@features/category/category.module';
import { OrderModule } from '@features/order/order.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@common/redis';
import { AppService } from 'app.service';
import { AppController } from 'app.controller';
import { User } from '@entities/user.entity';
import { Product } from '@entities/product.entity';
import { Order } from '@entities/order.entity';
import { OrderItem } from '@entities/order-item.entity';
import { Category } from '@entities/category.entity';
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart-item.entity';
import { ProductModule } from '@features/product/product.module';
import { ImageModule } from '@features/image/image.module';
import { GuestCartModule } from '@features/guest-cart/guest-cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Product, Order, OrderItem, Category, Cart, CartItem],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    RedisModule,
    CartModule,
    CategoryModule,
    OrderModule,
    ProductModule,
    ImageModule,
    GuestCartModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
