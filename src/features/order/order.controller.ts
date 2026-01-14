import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard, RolesGuard } from '@common/guards';
import type { Request } from 'express';
import { User } from '@entities/user.entity';
import { OrderStatus, Role } from '@common/enums';
import { Roles, ShowSuccessToast } from '@common/decorators';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  @ShowSuccessToast('Заказ размещен')
  createOrder(@Req() req: Request, @Body() body: CreateOrderDto) {
    return this.orderService.createOrder(req.user as User, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  listOrders(@Req() req: Request) {
    return this.orderService.listOrders(req.user as User);
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  getOrder(@Param('id') id: string, @Req() req: Request) {
    return this.orderService.getOrder(id, req.user as User);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }) {
    return this.orderService.updateStatus(id, body.status);
  }
}
