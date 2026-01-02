import { getCities } from '../src/data/cities.js'
import { fetchWithRetry, processHourlyData } from '../src/utils/fetchWithRetry.js'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.LIVEWEATHERKVDB_KV_REST_API_URL,
  token: process.env.LIVEWEATHERKVDB_KV_REST_API_TOKEN, 
})

export default async function handler(req, res) {
  const startTime = Date.now()

  // Security check for cron-job.org (header) or manual testing (URL param)
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const cities = await getCities()
  const BATCH_SIZE = 25
  let loaded = 0
  let totalFetchTime = 0
  let totalRedisTime = 0

  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batchStart = Date.now()

    const batch = cities.slice(i, i + BATCH_SIZE)

    // Measure fetch time
    const fetchStart = Date.now()
    const responses = await Promise.all(batch.map(city => fetchWithRetry(city)))
    const fetchTime = Date.now() - fetchStart
    totalFetchTime += fetchTime

    // Prepare all Redis writes for this batch
    const redisPromises = []
    for (const r of responses) {
      if (r && r.success && r.data?.hourly) {
        const processed = processHourlyData(r.data)
        redisPromises.push(
          redis.set(`city:${r.city.id}`, {
            data: processed,
            lastUpdated: Date.now()
          })
        )
        loaded++
      }
    }

    // Measure Redis time
    const redisStart = Date.now()
    await Promise.all(redisPromises)
    const redisTime = Date.now() - redisStart
    totalRedisTime += redisTime

    const batchTime = Date.now() - batchStart
    console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: Fetch=${fetchTime}ms, Redis=${redisTime}ms, Total=${batchTime}ms`)
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2)

  res.json({
    status: 'complete',
    loaded,
    total: cities.length,
    time: `${totalTime}s`,
    timing: {
      totalFetchSeconds: (totalFetchTime / 1000).toFixed(2),
      totalRedisSeconds: (totalRedisTime / 1000).toFixed(2),
      fetchPercent: Math.round((totalFetchTime / (Date.now() - startTime)) * 100),
      redisPercent: Math.round((totalRedisTime / (Date.now() - startTime)) * 100)
    }
  })
}
