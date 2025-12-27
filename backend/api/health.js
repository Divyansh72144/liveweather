import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const keys = await kv.keys('city:*')
  const stats = {
    totalCities: keys.length
  }
  res.json({ status: 'healthy', cache: stats })
}
