import { getWeatherIconUrl, getWeatherDescription } from '../utils/weather'

/**
 * CityListItem Component
 * Displays a single city in the sidebar list with weather information
 * @param {Object} city - City object with weather data
 * @param {Function} onClick - Click handler for the city item
 */
export default function CityListItem({ city, onClick }) {
  return (
    <div
      className="city-list-item"
      onClick={() => onClick(city)}
    >
      <span className="city-icon">
        <img
          src={getWeatherIconUrl(city.weather.weatherCode)}
          alt="weather"
          style={{ width: '32px', height: '32px' }}
        />
      </span>
      <div className="city-info">
        <span className="city-name">{city.name}</span>
        <span className="city-country">{city.country}</span>
        <span className="city-desc">{getWeatherDescription(city.weather.weatherCode)}</span>
      </div>
      <div className="city-metrics">
        <span className="city-temp">{city.weather.temperature}°C</span>
        <span className="city-wind">{city.weather.windSpeed} km/h</span>
      </div>
    </div>
  )
}
