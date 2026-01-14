import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { GuestCartService } from './guest-cart.service';

@Controller('guest-cart')
export class GuestCartController {
  constructor(private guestCartService: GuestCartService) {}

  @Post('add')
  addItem(
    @Body() body: { sessionId: string; productId: string; quantity?: number },
  ) {
    return this.guestCartService.addItem(
      body.sessionId,
      body.productId,
      body.quantity,
    );
  }

  @Get(':sessionId')
  getCart(@Param('sessionId') sessionId: string) {
    return this.guestCartService.getCart(sessionId);
  }

  @Patch('update/:sessionId')
  updateItem(
    @Param('sessionId') sessionId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.guestCartService.updateItemQuantity(
      sessionId,
      body.productId,
      body.quantity,
    );
  }

  @Delete('remove/:sessionId/:productId')
  removeItem(
    @Param('sessionId') sessionId: string,
    @Param('productId') productId: string,
  ) {
    return this.guestCartService.removeItem(sessionId, productId);
  }

  @Delete('clear/:sessionId')
  clearCart(@Param('sessionId') sessionId: string) {
    return this.guestCartService.clearCart(sessionId);
  }
}
