import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '@common/redis';
import { ProductService } from '@features/product/product.service';
import type { CartItem } from '@features/cart/dto/cart-item.dto';

@Injectable()
export class GuestCartService {
  constructor(
    private readonly redisService: RedisService,
    private readonly productService: ProductService,
  ) {}

  private getKey(sessionId: string) {
    return `guest_cart:${sessionId}`;
  }

  private async getRawCart(sessionId: string): Promise<Record<string, CartItem>> {
    const key = this.getKey(sessionId);
    const data = await this.redisService.get(key);
    return data ? JSON.parse(data) : {};
  }

  private async saveRawCart(sessionId: string, cart: Record<string, CartItem>) {
    const key = this.getKey(sessionId);
    await this.redisService.set(key, JSON.stringify(cart));
  }

  async addItem(sessionId: string, productId: string, quantity = 1): Promise<CartItem[]> {
    const cart = await this.getRawCart(sessionId);

    const product = await this.productService.findOne(productId);

    if (!product) throw new NotFoundException('Product not found');

    if (cart[productId]) {
      cart[productId].quantity += quantity;
    } else {
      cart[productId] = {
        id: product.id,
        title: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity,
      };
    }

    await this.saveRawCart(sessionId, cart);
    return Object.values(cart);
  }

  async getCart(sessionId: string): Promise<CartItem[]> {
    const cart = await this.getRawCart(sessionId);
    return Object.values(cart);
  }

  async removeItem(sessionId: string, productId: string): Promise<CartItem[]> {
    const cart = await this.getRawCart(sessionId);
    if (cart[productId]) delete cart[productId];
    await this.saveRawCart(sessionId, cart);
    return Object.values(cart);
  }

  async updateItemQuantity(sessionId: string, productId: string, quantity: number): Promise<CartItem[]> {
    const cart = await this.getRawCart(sessionId);
    if (!cart[productId]) throw new NotFoundException('Cart item not found');

    cart[productId].quantity = quantity;
    await this.saveRawCart(sessionId, cart);
    return Object.values(cart);
  }

  async clearCart(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.redisService.del(key);
  }
}
