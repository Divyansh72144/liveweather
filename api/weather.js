import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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
