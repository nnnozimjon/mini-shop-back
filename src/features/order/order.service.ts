import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '@entities/cart.entity';
import { Order } from '@entities/order.entity';
import { OrderItem } from '@entities/order-item.entity';
import { User } from '@entities/user.entity';
import { OrderStatus } from '@common/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartItem } from '@entities/cart-item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepo: Repository<CartItem>,
  ) {}

  async createOrder(user: User, dto: CreateOrderDto) {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const totalPrice = cart.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    );

    const savedOrder = await this.orderRepo.save({
      user: { id: user.id },
      totalPrice,
      fullName: dto.fullName,
      phone: dto.phone,
      address: dto.address,
    });

    for (const ci of cart.items) {
      await this.itemRepo.save({
        order: { id: savedOrder.id },
        product: { id: ci.product.id },
        quantity: ci.quantity,
        priceAtPurchase: ci.product.price,
      });
    }

    await this.clearCart(user);

    return;
  }

  async listOrders(user: User) {
    return this.orderRepo.find({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .select([
        'order.id AS "orderId"',
        'order.totalPrice AS "totalPrice"',
        'order.status AS "status"',
        'order.createdAt AS "createdAt"',
        'order.fullName AS "fullName"',
        'order.phone AS "phone"',
        'user.id AS "userId"',
        'user.email AS "userEmail"',
      ])
      .addSelect('COUNT(item.id)', 'itemsCount')
      .addSelect(
        `
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', "item"."id",
          'productId', "product"."id",
          'productName', "product"."name",
          'productImage', "product"."image",
          'quantity', "item"."quantity",
          'price', "item"."priceAtPurchase"
        )
      )`,
        'items',
      )
      .groupBy('order.id')
      .addGroupBy('user.id')
      .orderBy('order.createdAt', 'DESC')
      .getRawMany();
  }

  async getOrder(id: string, user: User) {
    const order = await this.orderRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async clearCart(user: User): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['items'],
    });

    if (!cart || cart.items.length === 0) {
      return;
    }

    await this.cartItemRepo.delete({
      cart: { id: cart.id },
    });
  }
}
