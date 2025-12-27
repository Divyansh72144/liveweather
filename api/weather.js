import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const keys = await redis.keys('city:*')
  const results = {}

  for (const key of keys) {
    const cached = await redis.get(key)
    results[key.split(':')[1]] = cached.data
  }

  res.json({ source: 'cache', data: results })
}
