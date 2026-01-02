/**
 * Get current weather from hourly forecast data
 * This ensures we always show the correct current hour, even if cache is stale
 *
 * @param {Object} weather - Weather data object
 * @returns {Object} - Current weather for this moment
 */
export function getCurrentWeatherFromHourly(weather) {
  if (!weather || !weather.hourly || !weather.hourly.time) {
    return weather
  }

  // Find the current hour index from the time array
  const now = new Date()
  const currentHourString = now.toISOString().slice(0, 13) // Format: "2025-01-02T14"

  let startIndex = 0
  for (let i = 0; i < weather.hourly.time.length; i++) {
    if (weather.hourly.time[i].startsWith(currentHourString)) {
      startIndex = i
      break
    }
  }

  // Return current values from hourly array
  return {
    temperature: weather.hourly.temperature?.[startIndex] ?? weather.temperature,
    windSpeed: weather.hourly.windSpeed?.[startIndex] ?? weather.windSpeed,
    humidity: weather.hourly.humidity?.[startIndex] ?? weather.humidity,
    weatherCode: weather.hourly.weatherCode?.[startIndex] ?? weather.weatherCode,
    // Keep hourly for charts/future use
    hourly: weather.hourly,
    // Store last updated time
    lastUpdated: weather.lastUpdated
  }
}
