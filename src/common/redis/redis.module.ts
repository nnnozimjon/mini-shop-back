import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new Redis({
          host: config.get('REDIS_HOST', '127.0.0.1'),
          port: config.get<number>('REDIS_PORT', 6379),

          retryStrategy(times) {
            if (times > 5) return null;
            return Math.min(times * 500, 3000);
          },
        });

        client.on('connect', () => {
          console.log('Redis connected');
        });

        client.on('error', (err) => {
          console.error('Redis error:', err.message);
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
