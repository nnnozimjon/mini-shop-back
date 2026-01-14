import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService, CreateUserDto } from '@features/user';
import { LoginDto } from '@features/auth';
import { Role } from '@common/enums';
import { RedisService } from '@common/redis';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(
    dto: CreateUserDto,
    role: Role = Role.USER,
  ): Promise<Omit<CreateUserDto, 'password'>> {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким адресом электронной почты уже существует.');
    }

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.userService.createUser(
      { ...dto, password: hashedPassword },
      role,
    );

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await this.verifyPassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.role,
    );

    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    };
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    await this.validateRefreshToken(userId, refreshToken);

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const accessToken = this.generateAccessToken(user.id, user.role);

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Ошибка проверки пароля:', error);
      return false;
    }
  }

  private async generateTokens(
    userId: string,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: string, role: Role): string {
    const payload = { sub: userId, role };
    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const key = `refresh_token:${userId}`;
    await this.redis.set(key, refreshToken, this.REFRESH_TOKEN_TTL);
  }

  private async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const storedToken = await this.redis.get(`refresh_token:${userId}`);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token не найден');
    }

    if (storedToken !== refreshToken) {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }
}
