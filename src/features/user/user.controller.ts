import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from '@features/user';
import { Role } from '@common/enums';
import { Roles } from '@common/decorators';
import { RolesGuard, JwtAuthGuard } from '@common/guards';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
