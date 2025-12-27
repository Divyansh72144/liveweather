
import { getWeatherIconUrl, getWeatherDescription, WEATHER_CATEGORIES } from '../utils/weather'

export default function Sidebar({ sortedCities, sortBy, sortOrder, onSort, onCityClick, searchQuery, onSearchChange, weatherFilter, onWeatherFilterChange }) {
  return (
    <aside className="sidebar">
      <h2>
        {searchQuery
          ? `Cities (${sortedCities.length} found)`
          : `Cities (${sortedCities.length})`
        }
      </h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search cities or countries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            ✕
          </button>
        )}
      </div>

      {/* Weather Filter */}
      <div className="weather-filter">
        <div className="weather-filter-buttons">
          {WEATHER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`weather-filter-btn ${weatherFilter === category.id ? 'active' : ''}`}
              onClick={() => onWeatherFilterChange(category.id)}
              title={category.label}
            >
              {category.code ? (
                <img
                  src={getWeatherIconUrl(category.code)}
                  alt={category.label}
                  className="weather-filter-icon-img"
                />
              ) : (
                <span className="weather-filter-icon-text">🌍</span>
              )}
              <span className="weather-filter-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="sort-buttons">
        <button
          className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => onSort('name')}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-btn ${sortBy === 'country' ? 'active' : ''}`}
          onClick={() => onSort('country')}
        >
          Country {sortBy === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-btn ${sortBy === 'temp' ? 'active' : ''}`}
          onClick={() => onSort('temp')}
        >
          Temp {sortBy === 'temp' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`sort-btn ${sortBy === 'wind' ? 'active' : ''}`}
          onClick={() => onSort('wind')}
        >
          Wind {sortBy === 'wind' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {loadingMore && (
        <div className="loading-more">
          <div className="loading-spinner-small"></div>
          <span>Loading more cities...</span>
        </div>
      )}

      <div className="cities-list">
        {sortedCities.map(city => (
          <div
            key={city.id}
            className="city-list-item"
            onClick={() => onCityClick(city)}
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
        ))}
      </div>
    </aside>
  )
}
