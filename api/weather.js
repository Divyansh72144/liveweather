import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.LIVEWEATHERKVDB_KV_REST_API_URL,
  token: process.env.LIVEWEATHERKVDB_KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  const keys = await redis.keys('city:*')

  // fetching values parellelly
  const values = await redis.mget(...keys)

  const results = {}
  keys.forEach((key, index) => {
    const cached = values[index]
    if (cached && cached.data) {
      results[key.split(':')[1]] = cached.data
    }
  })

  res.json({ source: 'cache', data: results })
}
