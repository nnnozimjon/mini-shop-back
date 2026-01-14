import { Module } from '@nestjs/common';
import { GuestCartService } from './guest-cart.service';
import { GuestCartController } from './guest-cart.controller';
import { RedisModule } from '@common/redis';
import { ProductModule } from '@features/product/product.module';
import { CategoryModule } from '@features/category/category.module';

@Module({
  imports: [
    ProductModule,
    RedisModule,
    CategoryModule
  ],
  providers: [GuestCartService],
  controllers: [GuestCartController],
  exports: [GuestCartService],
})
export class GuestCartModule {}
