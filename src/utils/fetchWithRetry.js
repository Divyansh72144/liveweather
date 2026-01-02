const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWithRetry(city, maxRetries = 3) {
  if (!city || !city.lat || !city.lon) {
    console.error('Invalid city object:', city)
    return { success: false, error: 'Invalid city data', city }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const url = `${OPEN_METEO_BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relative_humidity_2m,weather_code,windspeed_10m&forecast_days=2`

      const response = await fetch(url, {
        timeout: 10000 // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data, city }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for ${city?.name || 'unknown'}:`, error.message)

      if (attempt === maxRetries - 1) {
        console.error(`Failed to fetch data for ${city?.name} after ${maxRetries} attempts`)
        return { success: false, error: error.message, city }
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }

  // Fallback return (should never reach here)
  return { success: false, error: 'Max retries exceeded', city }
}

export function processHourlyData(data) {
  if (!data.hourly || !data.hourly.time || !data.hourly.time.length) {
    return null
  }

  // Find the current hour index from the time array
  const now = new Date()
  const currentHourString = now.toISOString().slice(0, 13) // Format: "2024-01-15T14"

  let startIndex = 0
  for (let i = 0; i < data.hourly.time.length; i++) {
    if (data.hourly.time[i].startsWith(currentHourString)) {
      startIndex = i
      break
    }
  }

  // Get values with fallback to index 0 if not found
  const temperature = data.hourly.temperature_2m?.[startIndex] ?? data.hourly.temperature_2m?.[0]
  const windSpeed = data.hourly.windspeed_10m?.[startIndex] ?? data.hourly.windspeed_10m?.[0]
  const humidity = data.hourly.relative_humidity_2m?.[startIndex] ?? data.hourly.relative_humidity_2m?.[0]
  const weatherCode = data.hourly.weather_code?.[startIndex] ?? data.hourly.weather_code?.[0]

  // Return flat structure that frontend expects
  return {
    temperature,
    windSpeed,
    humidity,
    weatherCode,
    hourly: {
      time: data.hourly.time.slice(startIndex, startIndex + 24),
      temperature: data.hourly.temperature_2m?.slice(startIndex, startIndex + 24),
      humidity: data.hourly.relative_humidity_2m?.slice(startIndex, startIndex + 24),
      weatherCode: data.hourly.weather_code?.slice(startIndex, startIndex + 24),
      windSpeed: data.hourly.windspeed_10m?.slice(startIndex, startIndex + 24)
    }
  }
}
