import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  const keys = await redis.keys('city:*')
  const stats = {
    totalCities: keys.length
  }
  res.json({ status: 'healthy', cache: stats })
}
