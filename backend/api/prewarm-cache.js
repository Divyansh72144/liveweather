import { getCities } from '../../cities.js'
import { fetchWithRetry, processHourlyData } from '../../utils/fetchWithRetry.js'
import { kv } from '@vercel/kv' // optional persistent cache

export default async function handler(req, res) {
  // optional security
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const cities = await getCities()
  const BATCH_SIZE = 25
  let loaded = 0

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE)
    const responses = await Promise.all(batch.map(fetchWithRetry))
    for (const r of responses) {
      if (r.success && r.data?.hourly) {
        const processed = processHourlyData(r.data)
        await kv.set(`city:${r.city.id}`, JSON.stringify({ data: processed, lastUpdated: Date.now() }))
        loaded++
      }
    }
  }

  res.json({ status: 'complete', loaded, total: cities.length })
}
