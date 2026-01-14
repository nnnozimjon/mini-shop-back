import { Controller, Get, Post, Delete, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '@common/guards';
import type { Request } from 'express';
import { User } from '@entities/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    return this.cartService.getCart(req.user as User);
  }

  @Post('add')
  addItem(@Req() req: Request, @Body() body: { productId: string, quantity?: number }) {
    return this.cartService.addItem(req.user as User, body.productId, body.quantity);
  }

  @Patch('update/:itemId')
  updateItem(@Req() req: Request, @Param('itemId') itemId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItemQuantity(req.user as User, itemId, body.quantity);
  }

  @Delete('remove/:itemId')
  removeItem(@Req() req: Request, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user as User, itemId);
  }
}
