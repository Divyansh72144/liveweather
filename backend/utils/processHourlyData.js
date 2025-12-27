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