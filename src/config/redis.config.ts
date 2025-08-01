import { ConfigService } from '@nestjs/config';
import type { RedisClientOptions } from 'redis';

export async function redisConfig(configService: ConfigService): Promise<RedisClientOptions> {
  return {
    socket: {
      host: configService.getOrThrow('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
    }
  };
}