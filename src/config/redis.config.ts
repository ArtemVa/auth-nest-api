import { createKeyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';
import { CacheableMemory, Keyv } from 'cacheable';
import type { RedisClientOptions } from 'redis';

export async function redisConfig(configService: ConfigService): Promise<RedisClientOptions> {
  return {
    stores: [
      new Keyv(
        {
          store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
        }),
      createKeyv(`redis://${configService.getOrThrow('REDIS_HOST')}:${configService.getOrThrow('REDIS_PORT')}`),
    ],
    ttl: configService.getOrThrow<number>('CACHE_TTL')
  };
}