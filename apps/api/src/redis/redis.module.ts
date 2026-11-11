import { Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: Redis,
      useFactory: () => {
        const logger = new Logger('Redis');
        const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
        });
        redis.on('error', (error: Error & { code?: string }) => logger.warn(error.message || error.code || 'connection error'));
        return redis;
      },
    },
  ],
  exports: [Redis],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly redis: Redis) {}

  async onApplicationShutdown() {
    this.redis.disconnect();
  }
}
