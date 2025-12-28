import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { CITIES } from '../../backend/cities.js'

import { createWeatherIcon } from '../utils/leafletConfig'
import { getWeatherIconUrl, getWeatherDescription } from '../utils/weather'

const WORLD_BOUNDS = [
  [-90, -180],
  [90, 180],
]

function MapController({ selectedCity, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCity) {
      // Check if mobile for different offset
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
      // Increase lat offset on mobile to position popup higher and avoid sidebar
      const latOffset = isMobile ? -0.1 : -0.05

      // Fly to city with small offset to position popup lower
      map.flyTo([selectedCity.lat - latOffset, selectedCity.lon], 10, {
        duration: 1.5
      })

      // Open popup after flyTo completes
      const timer = setTimeout(() => {
        const markerRef = markerRefs.current[selectedCity.id]
        if (markerRef && markerRef.openPopup) {
          markerRef.openPopup()
        }
      }, 1600)

      return () => clearTimeout(timer)
    }
  }, [selectedCity, map, markerRefs])

  return null
}

export default function WeatherMap({ weatherData, selectedCity, onCityClick }) {
  const minZoom = typeof window !== 'undefined' && window.innerHeight > 960 ? 3.2 : 2
  const markerRefs = useRef({})

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={minZoom}
      maxZoom={30}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
    >
      <MapController selectedCity={selectedCity} markerRefs={markerRefs} />

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
              ref={(marker) => {
                if (marker) {
                  markerRefs.current[city.id] = marker
                }
              }}
              eventHandlers={{
                click: () => onCityClick(city)
              }}
            >
              <Popup
                offset={typeof window !== 'undefined' && window.innerWidth <= 768 ? [0, -40] : [0, 0]}
              >
                <div className="popup-content">
                  <h3>{city.name}, {city.country}</h3>
                  <div className="popup-weather">
                    <img
                      src={getWeatherIconUrl(weather.weatherCode)}
                      alt="weather"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <div className="popup-details">
                      <span className="popup-temp">{weather.temperature}°C</span>
                      <span className="popup-wind">💨 {weather.windSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="popup-coords">
                    <span className="coords-text">{city.lat.toFixed(4)}°, {city.lon.toFixed(4)}°</span>
                    <button
                      className="copy-coords-btn"
                      onClick={() => navigator.clipboard.writeText(`${city.lat}, ${city.lon}`)}
                    >
                      Copy coordinates
                    </button>
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
