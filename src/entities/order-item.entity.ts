import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'SET NULL',
  })
  product: Product;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number;

  @Column()
  quantity: number;
}
