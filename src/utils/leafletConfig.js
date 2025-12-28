import L from 'leaflet'
import { getWeatherIconUrl, getWeatherDescription } from './weather'

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom weather icon using OpenWeatherMap images
export const createWeatherIcon = (weatherCode, temp, cityName, countryName) => {
  const tempColor = temp >= 30 ? '#ef4444' : temp >= 20 ? '#f59e0b' : temp >= 10 ? '#22c55e' : '#3b82f6'
  const iconUrl = getWeatherIconUrl(weatherCode)
  const description = getWeatherDescription(weatherCode)

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          width: 56px;
          height: 56px;
          background: white;
          border-radius: 50%;
          border: 3px solid ${tempColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        ">
          <img src="${iconUrl}" style="width: 42px; height: 42px;" alt="weather" />
        </div>
        <div style="
          margin-top: 2px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          background: ${tempColor};
          padding: 3px 8px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">${temp}°C</div>
        <div style="
          margin-top: 2px;
          font-size: 9px;
          font-weight: 500;
          color: #374151;
          background: rgba(255,255,255,0.95);
          padding: 2px 6px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          white-space: nowrap;
          text-align: center;
        ">${description}</div>
        <div style="
          margin-top: 2px;
          font-size: 10px;
          font-weight: 600;
          color: #1f2937;
          background: rgba(255,255,255,0.95);
          padding: 3px 6px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          white-space: nowrap;
          text-align: center;
          max-width: 100px;
        ">${cityName}, ${countryName}</div>
      </div>
    `,
    iconSize: [70, 145],
    iconAnchor: [35, 145],
    popupAnchor: [0, -100]
  })
}
