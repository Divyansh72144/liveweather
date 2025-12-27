import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { CITIES } from '../../backend/cities.js'

import { createWeatherIcon } from '../utils/leafletConfig'
import { getWeatherIconUrl, getWeatherDescription } from '../utils/weather'
const WORLD_BOUNDS = [
  [-85, -180],
  [85, 180],
]
export default function WeatherMap({ weatherData, selectedCity, onCityClick }) {
  return (
   <MapContainer
  center={selectedCity ? [selectedCity.lat, selectedCity.lon] : [20, 0]}
  zoom={selectedCity ? 6 : 2}
  minZoom={2}
  maxZoom={18}
  maxBounds={WORLD_BOUNDS}
  maxBoundsViscosity={1.0}
  worldCopyJump={false}
  style={{ width: '100%', height: '100%' }}
>

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap={true}
      />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={80}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        iconCreateFunction={(cluster) => {
          const count = cluster.getChildCount()
          let size = 50
          if (count > 50) size = 70
          else if (count > 20) size = 60

          const markers = cluster.getAllChildMarkers()
          let totalTemp = 0
          let tempCount = 0
          markers.forEach(marker => {
            if (marker.options.temp) {
              totalTemp += marker.options.temp
              tempCount++
            }
          })
          const avgTemp = tempCount > 0 ? Math.round(totalTemp / tempCount) : 20

          return L.divIcon({
            className: 'custom-cluster-icon',
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${avgTemp >= 30 ? '#ef4444' : avgTemp >= 20 ? '#f59e0b' : avgTemp >= 10 ? '#22c55e' : '#3b82f6'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${size * 0.35}px;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              ">${count}</div>
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
          })
        }}
      >
        {CITIES.map((city) => {
          const weather = weatherData[city.id]
          if (!weather) return null

          return (
            <Marker
              key={city.id}
              position={[city.lat, city.lon]}
              icon={createWeatherIcon(
                weather.weatherCode,
                weather.temperature,
                city.name,
                city.country
              )}
              temp={weather.temperature}
              eventHandlers={{
                click: () => onCityClick(city)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{city.name}, {city.country}</h3>
                  <div className="popup-weather">
                    <img
                      src={getWeatherIconUrl(weather.weatherCode)}
                      alt="weather"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <div className="popup-details">
                      <span className="popup-desc">{getWeatherDescription(weather.weatherCode)}</span>
                      <span className="popup-temp">{weather.temperature}°C</span>
                      <span className="popup-wind">💨 {weather.windSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="popup-time">
                    Local time: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
