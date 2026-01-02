const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWithRetry(city, maxRetries = 1) {
  if (!city || !city.lat || !city.lon) {
    console.error('Invalid city object:', city)
    return { success: false, error: 'Invalid city data', city }
  }

  try {
    const url = `${OPEN_METEO_BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relative_humidity_2m,weather_code,windspeed_10m&forecast_days=2`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data, city }
  } catch (error) {
    return { success: false, error: error.message, city }
  }
}

export function processHourlyData(data) {
  if (!data.hourly || !data.hourly.time || !data.hourly.time.length) {
    return null
  }

  // Simple O(1) index calculation (like the original working version)
  const currentHour = new Date().getUTCHours()
  const startIndex = Math.min(currentHour, data.hourly.time.length - 1)

  // Return flat structure that frontend expects
  return {
    temperature: data.hourly.temperature_2m?.[startIndex],
    windSpeed: data.hourly.windspeed_10m?.[startIndex],
    humidity: data.hourly.relative_humidity_2m?.[startIndex],
    weatherCode: data.hourly.weather_code?.[startIndex],
    hourly: {
      time: data.hourly.time.slice(startIndex, startIndex + 24),
      temperature: data.hourly.temperature_2m?.slice(startIndex, startIndex + 24),
      humidity: data.hourly.relative_humidity_2m?.slice(startIndex, startIndex + 24),
      weatherCode: data.hourly.weather_code?.slice(startIndex, startIndex + 24),
      windSpeed: data.hourly.windspeed_10m?.slice(startIndex, startIndex + 24)
    }
  }
}
