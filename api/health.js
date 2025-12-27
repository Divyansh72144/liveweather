import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  const keys = await redis.keys('city:*')
  const stats = {
    totalCities: keys.length
  }
  res.json({ status: 'healthy', cache: stats })
}
