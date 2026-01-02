const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWithRetry(city, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const url = `${OPEN_METEO_BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relative_humidity_2m,weather_code&forecast_days=2`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data, city }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(`Failed to fetch data for ${city.name} after ${maxRetries} attempts:`, error.message)
        return { success: false, error: error.message, city }
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}

export function processHourlyData(data) {
  if (!data.hourly) return null

  const currentHour = new Date().getUTCHours()
  const startIndex = currentHour

  return {
    current: {
      temperature: data.hourly.temperature_2m[startIndex],
      humidity: data.hourly.relative_humidity_2m[startIndex],
      weatherCode: data.hourly.weather_code[startIndex]
    },
    hourly: {
      time: data.hourly.time.slice(startIndex, startIndex + 24),
      temperature: data.hourly.temperature_2m.slice(startIndex, startIndex + 24),
      humidity: data.hourly.relative_humidity_2m.slice(startIndex, startIndex + 24),
      weatherCode: data.hourly.weather_code.slice(startIndex, startIndex + 24)
    }
  }
}
