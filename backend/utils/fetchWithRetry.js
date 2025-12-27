const OPENMETEO_API = 'https://api.open-meteo.com/v1/forecast'

export const fetchWithRetry = async (city, attempt = 1) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(
      `${OPENMETEO_API}?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,weather_code,wind_speed_10m&timezone=auto&forecast_hours=4`,
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!data?.hourly) throw new Error('No hourly weather data')

    return { city, data, success: true }
  } catch (err) {
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      return fetchWithRetry(city, attempt + 1)
    }
    return { city, error: err.message, success: false }
  }
}

export const processHourlyData = (data) => {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  let closestIndex = 0
  let minDiff = Infinity

  data.hourly.time.forEach((timeStr, index) => {
    const hourDate = new Date(timeStr)
    const diff = Math.abs(currentMinutes - (hourDate.getHours() * 60 + hourDate.getMinutes()))
    if (diff < minDiff) {
      minDiff = diff
      closestIndex = index
    }
  })

  return {
    temperature: Math.round(data.hourly.temperature_2m[closestIndex]),
    weatherCode: data.hourly.weather_code[closestIndex],
    windSpeed: Math.round(data.hourly.wind_speed_10m[closestIndex])
  }
}
