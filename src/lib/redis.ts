import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const redis = globalForRedis.redis ?? createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;

  redis.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  if (process.env.NODE_ENV !== 'test') {
    redis.connect().catch(console.error);
  }
}

export default redis;