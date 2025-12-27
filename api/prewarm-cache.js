import { getCities } from '../backend/cities.js'
import { fetchWithRetry, processHourlyData } from '../backend/utils/fetchWithRetry.js'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export default async function handler(req, res) {
  // Security check for cron-job.org (header) or manual testing (URL param)
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
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
        await redis.set(`city:${r.city.id}`, {
          data: processed,
          lastUpdated: Date.now()
        })
        loaded++
      }
    }
  }

  res.json({ status: 'complete', loaded, total: cities.length })
}
