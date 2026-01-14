import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '@entities/cart.entity';
import { CartItem as CartItemEntity } from '@entities/cart-item.entity';
import { Product } from '@entities/product.entity';
import { User } from '@entities/user.entity';
import { CartItem } from './dto/cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItemEntity) private itemRepo: Repository<CartItemEntity>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  private async findOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ user, items: [] });
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  private mapToCartItem(item: CartItemEntity): CartItem {
    return {
      id: item.id,
      title: item.product.name,
      description: item.product.description,
      price: Number(item.product.price),
      image: item.product.image,
      quantity: item.quantity,
    };
  }

  async getCart(user: User): Promise<CartItem[]> {
    const cart = await this.findOrCreateCart(user);
    return cart.items.map(this.mapToCartItem);
  }

  async addItem(user: User, productId: string, quantity = 1): Promise<CartItem[]> {
    const cart = await this.findOrCreateCart(user);
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');

    let item = cart.items.find(i => i.product.id === product.id);
    if (item) {
      item.quantity += quantity;
      await this.itemRepo.save(item);
    } else {
      item = this.itemRepo.create({ cart, product, quantity });
      await this.itemRepo.save(item);
      cart.items.push(item);
    }

    return cart.items.map(this.mapToCartItem);
  }

  async removeItem(user: User, itemId: string): Promise<CartItem[]> {
    const cart = await this.findOrCreateCart(user);
    cart.items = cart.items.filter(i => i.id !== itemId);
    await this.cartRepo.save(cart);
    await this.itemRepo.delete(itemId);

    return cart.items.map(this.mapToCartItem);
  }

  async updateItemQuantity(user: User, itemId: string, quantity: number): Promise<CartItem[]> {
    console.log(user, itemId, quantity)
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['cart', 'product'] });
    if (!item) throw new NotFoundException('Cart item not found');

    item.quantity = quantity;
    await this.itemRepo.save(item);

    return this.getCart(user);
  }

  async clearCart(user: User): Promise<CartItem[]> {
    const cart = await this.findOrCreateCart(user);
    await this.itemRepo.delete(cart.items.map(i => i.id));
    cart.items = [];
    await this.cartRepo.save(cart);
    return [];
  }
}
