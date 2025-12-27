import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const keys = await kv.keys('city:*')
  const results = {}

  for (const key of keys) {
    const cached = JSON.parse(await kv.get(key))
    results[key.split(':')[1]] = cached.data
  }

  res.json({ source: 'cache', data: results })
}
