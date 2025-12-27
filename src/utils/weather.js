const OPENMETEO_API = 'https://api.open-meteo.com/v1/forecast'

// Map Open-Meteo weather codes to OpenWeatherMap icon codes
const getWeatherIconCode = (code) => {
  if (code === 0) return '01d'
  if (code === 1) return '02d'
  if (code === 2) return '03d'
  if (code === 3) return '04d'
  if (code >= 45 && code <= 48) return '50d'
  if (code >= 51 && code <= 55) return '09d'
  if (code >= 56 && code <= 57) return '13d'
  if (code >= 61 && code <= 65) return '10d'
  if (code >= 66 && code <= 67) return '13d'
  if (code >= 71 && code <= 77) return '13d'
  if (code >= 80 && code <= 82) return '09d'
  if (code >= 85 && code <= 86) return '13d'
  if (code >= 95 && code <= 99) return '11d'
  return '01d'
}

export const getWeatherIconUrl = (code) => {
  const iconCode = getWeatherIconCode(code)
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear'
  if (code === 1) return 'Mainly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 56 && code <= 57) return 'Freezing Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 66 && code <= 67) return 'Freezing Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

// Get weather category for filtering
export const getWeatherCategory = (code) => {
  if (code === 0 || code === 1) return 'Clear'
  if (code === 2 || code === 3) return 'Cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return 'Rainy'
  if (code >= 61 && code <= 67) return 'Rainy'
  if (code >= 71 && code <= 77) return 'Snowy'
  if (code >= 85 && code <= 86) return 'Snowy'
  if (code >= 95 && code <= 99) return 'Stormy'
  return 'Clear'
}

// All weather categories for filter buttons
export const WEATHER_CATEGORIES = [
  { id: 'all', label: 'All Weather', code: null },
  { id: 'Clear', label: 'Clear', code: 1 },
  { id: 'Cloudy', label: 'Cloudy', code: 3 },
  { id: 'Rainy', label: 'Rainy', code: 61 },
  { id: 'Snowy', label: 'Snowy', code: 71 },
  { id: 'Stormy', label: 'Stormy', code: 95 },
  { id: 'Foggy', label: 'Foggy', code: 45 },
]

export { OPENMETEO_API }
