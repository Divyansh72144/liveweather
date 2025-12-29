import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useEffect, useRef } from 'react'

import { createWeatherIcon } from '../utils/leafletConfig'
import { getWeatherIconUrl, getWeatherDescription } from '../utils/weather'

const WORLD_BOUNDS = [
  [-90, -180],
  [90, 180],
]

// Timezone mapping for countries and regions
const TIMEZONE_MAP = {
  // North America
  'United States': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix'],
  'Canada': ['America/Toronto', 'America/Montreal', 'America/Vancouver', 'America/Edmonton', 'America/Halifax'],
  'Mexico': ['America/Mexico_City'],
  'Cuba': 'America/Havana',
  'Haiti': 'America/Port-au-Prince',
  'Jamaica': 'America/Jamaica',
  'Dominican Republic': 'America/Santo_Domingo',
  'Bahamas': 'America/Nassau',
  'Barbados': 'America/Barbados',
  'Trinidad and Tobago': 'America/Port_of_Spain',
  'Puerto Rico': 'America/Puerto_Rico',
  'U.S. Virgin Islands': 'America/St_Thomas',
  'Guatemala': 'America/Guatemala',
  'El Salvador': 'America/El_Salvador',
  'Honduras': 'America/Tegucigalpa',
  'Nicaragua': 'America/Managua',
  'Panama': 'America/Panama',
  'Costa Rica': 'America/Costa_Rica',
  'Belize': 'America/Belize',

  // Caribbean
  'Aruba': 'America/Aruba',
  'Curaçao': 'America/Curacao',
  'Bonaire': 'America/Curacao',
  'Sint Maarten': 'America/Curacao',
  'Caribbean Netherlands': 'America/Curacao',
  'Anguilla': 'America/Anguilla',
  'Antigua and Barbuda': 'America/Antigua',
  'Dominica': 'America/Dominica',
  'Grenada': 'America/Grenada',
  'Saint Kitts and Nevis': 'America/St_Kitts',
  'Saint Lucia': 'America/St_Lucia',
  'Saint Vincent and the Grenadines': 'America/St_Vincent',
  'Saint Barthélemy': 'America/Guadeloupe',
  'Saint Martin': 'America/Marigot',
  'Saint Pierre and Miquelon': 'America/Miquelon',
  'Martinique': 'America/Martinique',
  'Guadeloupe': 'America/Guadeloupe',
  'Montserrat': 'America/Montserrat',
  'Saint Helena': 'Atlantic/St_Helena',
  'Saba': 'America/Curacao',
  'Sint Eustatius': 'America/Curacao',
  'Turks and Caicos Islands': 'America/Grand_Turk',
  'Cayman Islands': 'America/Cayman',
  'British Virgin Islands': 'America/Tortola',
  'Greenland': 'America/Godthab',
  'Saint Kitts and Nevis': 'America/St_Kitts',
  'American Samoa': 'Pacific/Pago_Pago',
  'Samoa': 'Pacific/Apia',

  // South America
  'Brazil': ['America/Sao_Paulo', 'America/Bahia', 'America/Fortaleza', 'America/Recife', 'America/Manaus'],
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Chile': ['America/Santiago', 'America/Punta_Arenas'],
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  'Venezuela': 'America/Caracas',
  'Ecuador': 'America/Guayaquil',
  'Bolivia': 'America/La_Paz',
  'Paraguay': 'America/Asuncion',
  'Uruguay': 'America/Montevideo',
  'Guyana': 'America/Guyana',
  'Suriname': 'America/Paramaribo',
  'French Guiana': 'America/Cayenne',
  'Falkland Islands': 'Atlantic/Stanley',

  // Europe
  'United Kingdom': 'Europe/London',
  'Ireland': 'Europe/Dublin',
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Italy': 'Europe/Rome',
  'Spain': ['Europe/Madrid', 'Africa/Ceuta'],
  'Poland': 'Europe/Warsaw',
  'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels',
  'Czech Republic': 'Europe/Prague',
  'Greece': 'Europe/Athens',
  'Portugal': ['Europe/Lisbon', 'Atlantic/Azores', 'Atlantic/Madeira'],
  'Sweden': 'Europe/Stockholm',
  'Hungary': 'Europe/Budapest',
  'Switzerland': 'Europe/Zurich',
  'Austria': 'Europe/Vienna',
  'Bulgaria': 'Europe/Sofia',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'Norway': 'Europe/Oslo',
  'Iceland': 'Atlantic/Reykjavik',
  'Romania': 'Europe/Bucharest',
  'Croatia': 'Europe/Zagreb',
  'Ukraine': 'Europe/Kyiv',
  'Belarus': 'Europe/Minsk',
  'Lithuania': 'Europe/Vilnius',
  'Latvia': 'Europe/Riga',
  'Estonia': 'Europe/Tallinn',
  'Serbia': 'Europe/Belgrade',
  'Slovenia': 'Europe/Ljubljana',
  'Slovakia': 'Europe/Bratislava',
  'Luxembourg': 'Europe/Luxembourg',
  'Malta': 'Europe/Malta',
  'Moldova': 'Europe/Chisinau',
  'Montenegro': 'Europe/Podgorica',
  'Cyprus': 'Asia/Nicosia',
  'Albania': 'Europe/Tirane',
  'North Macedonia': 'Europe/Skopje',
  'Bosnia and Herzegovina': 'Europe/Sarajevo',
  'Kosovo': 'Europe/Belgrade',
  'Andorra': 'Europe/Andorra',
  'San Marino': 'Europe/San_Marino',
  'Monaco': 'Europe/Monaco',
  'Liechtenstein': 'Europe/Vaduz',
  'Vatican City': 'Europe/Vatican',
  'Gibraltar': 'Europe/Gibraltar',
  'Faroe Islands': 'Atlantic/Faroe',
  'Svalbard and Jan Mayen': 'Arctic/Longyearbyen',
  'Åland Islands': 'Europe/Mariehamn',
  'Isle of Man': 'Europe/Isle_of_Man',
  'Guernsey': 'Europe/Guernsey',
  'Jersey': 'Europe/Jersey',
  'Republic of Ireland': 'Europe/Dublin',

  // Asia
  'China': 'Asia/Shanghai',
  'Japan': 'Asia/Tokyo',
  'South Korea': 'Asia/Seoul',
  'India': 'Asia/Kolkata',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Indonesia': ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'],
  'Philippines': 'Asia/Manila',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Singapore': 'Asia/Singapore',
  'Taiwan': 'Asia/Taipei',
  'Hong Kong': 'Asia/Hong_Kong',
  'Macau': 'Asia/Macau',
  'Bangladesh': 'Asia/Dhaka',
  'Pakistan': 'Asia/Karachi',
  'Sri Lanka': 'Asia/Colombo',
  'Myanmar': 'Asia/Yangon',
  'Cambodia': 'Asia/Phnom_Penh',
  'Laos': 'Asia/Vientiane',
  'Nepal': 'Asia/Kathmandu',
  'Bhutan': 'Asia/Thimphu',
  'Maldives': 'Indian/Maldives',
  'Kazakhstan': ['Asia/Almaty', 'Asia/Aqtobe'],
  'Uzbekistan': 'Asia/Tashkent',
  'Turkmenistan': 'Asia/Ashgabat',
  'Tajikistan': 'Asia/Dushanbe',
  'Kyrgyzstan': 'Asia/Bishkek',
  'Afghanistan': 'Asia/Kabul',
  'Iraq': 'Asia/Baghdad',
  'Iran': 'Asia/Tehran',
  'Saudi Arabia': 'Asia/Riyadh',
  'United Arab Emirates': 'Asia/Dubai',
  'Qatar': 'Asia/Qatar',
  'Kuwait': 'Asia/Kuwait',
  'Bahrain': 'Asia/Bahrain',
  'Oman': 'Asia/Muscat',
  'Yemen': 'Asia/Aden',
  'Israel': 'Asia/Jerusalem',
  'Jordan': 'Asia/Amman',
  'Lebanon': 'Asia/Beirut',
  'Syria': 'Asia/Damascus',
  'Turkey': 'Europe/Istanbul',
  'Russia': ['Europe/Moscow', 'Europe/Kaliningrad', 'Asia/Vladivostok', 'Asia/Yekaterinburg', 'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Kamchatka'],
  'Azerbaijan': 'Asia/Baku',
  'Armenia': 'Asia/Yerevan',
  'Georgia': 'Asia/Tbilisi',
  'Brunei': 'Asia/Brunei',
  'East Timor': 'Asia/Dili',
  'Palestine': 'Asia/Gaza',

  // Oceania
  'Australia': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide', 'Australia/Darwin', 'Australia/Hobart'],
  'New Zealand': 'Pacific/Auckland',
  'New Zealand': ['Pacific/Auckland', 'Pacific/Chatham'],
  'Fiji': 'Pacific/Fiji',
  'Papua New Guinea': 'Pacific/Port_Moresby',
  'Solomon Islands': 'Pacific/Guadalcanal',
  'Vanuatu': 'Pacific/Efate',
  'New Caledonia': 'Pacific/Noumea',
  'French Polynesia': 'Pacific/Tahiti',
  'Kiribati': ['Pacific/Tarawa', 'Pacific/Enderbury', 'Pacific/Kiritimati'],
  'Marshall Islands': 'Pacific/Majuro',
  'Micronesia': ['Pacific/Palikir', 'Pacific/Kosrae', 'Pacific/Pohnpei'],
  'Nauru': 'Pacific/Nauru',
  'Palau': 'Pacific/Palau',
  'Samoa': 'Pacific/Apia',
  'Tonga': 'Pacific/Tongatapu',
  'Tuvalu': 'Pacific/Funafuti',
  'Cook Islands': 'Pacific/Rarotonga',
  'Niue': 'Pacific/Niue',
  'American Samoa': 'Pacific/Pago_Pago',
  'Pitcairn Islands': 'Pacific/Pitcairn',
  'Tokelau': 'Pacific/Fakaofo',
  'Wallis and Futuna': 'Pacific/Wallis',
  'Northern Mariana Islands': 'Pacific/Saipan',
  'Guam': 'Pacific/Guam',
  'Christmas Island': 'Indian/Christmas',
  'Cocos Islands': 'Indian/Cocos',
  'Norfolk Island': 'Pacific/Norfolk',

  // Africa
  'Egypt': 'Africa/Cairo',
  'South Africa': 'Africa/Johannesburg',
  'Nigeria': 'Africa/Lagos',
  'Kenya': 'Africa/Nairobi',
  'Morocco': 'Africa/Casablanca',
  'Ghana': 'Africa/Accra',
  'Ethiopia': 'Africa/Addis_Ababa',
  'Tanzania': 'Africa/Dar_es_Salaam',
  'Algeria': 'Africa/Algiers',
  'Tunisia': 'Africa/Tunis',
  'Libya': 'Africa/Tripoli',
  'Sudan': 'Africa/Khartoum',
  'South Sudan': 'Africa/Juba',
  'Mauritius': 'Indian/Mauritius',
  'Seychelles': 'Indian/Mahe',
  'Réunion': 'Indian/Reunion',
  'Mayotte': 'Indian/Mayotte',
  'Comoros': 'Indian/Comoro',
  'Madagascar': 'Indian/Antananarivo',
  'Angola': 'Africa/Luanda',
  'Benin': 'Africa/Porto-Novo',
  'Botswana': 'Africa/Gaborone',
  'Burkina Faso': 'Africa/Ouagadougou',
  'Burundi': 'Africa/Bujumbura',
  'Cabo Verde': 'Atlantic/Cape_Verde',
  'Cameroon': 'Africa/Douala',
  'Central African Republic': 'Africa/Bangui',
  'Chad': 'Africa/Ndjamena',
  'Congo': 'Africa/Brazzaville',
  'DR Congo': ['Africa/Kinshasa', 'Africa/Lubumbashi'],
  'Republic of the Congo': 'Africa/Brazzaville',
  'Côte d\'Ivoire': 'Africa/Abidjan',
  'Djibouti': 'Africa/Djibouti',
  'Equatorial Guinea': 'Africa/Malabo',
  'Eritrea': 'Africa/Asmera',
  'Eswatini': 'Africa/Mbabane',
  'Gabon': 'Africa/Libreville',
  'Gambia': 'Africa/Banjul',
  'Guinea': 'Africa/Conakry',
  'Guinea-Bissau': 'Africa/Bissau',
  'Lesotho': 'Africa/Maseru',
  'Liberia': 'Africa/Monrovia',
  'Malawi': 'Africa/Blantyre',
  'Mali': 'Africa/Bamako',
  'Mauritania': 'Africa/Nouakchott',
  'Mozambique': 'Africa/Maputo',
  'Namibia': 'Africa/Windhoek',
  'Niger': 'Africa/Niamey',
  'Rwanda': 'Africa/Kigali',
  'Sao Tome and Principe': 'Africa/Sao_Tome',
  'Senegal': 'Africa/Dakar',
  'Sierra Leone': 'Africa/Freetown',
  'Somalia': 'Africa/Mogadishu',
  'Togo': 'Africa/Lome',
  'Uganda': 'Africa/Kampala',
  'Zambia': 'Africa/Lusaka',
  'Zimbabwe': 'Africa/Harare',
  'Western Sahara': 'Africa/El_Aaiun',
  'British Indian Ocean Territory': 'Indian/Chagos',
  'Saint Helena': 'Atlantic/St_Helena',
  'Ascension Island': 'Atlantic/Ascension',
  'Tristan da Cunha': 'Atlantic/Tristan',

  // Other territories
  'Antarctica': 'Antarctica/McMurdo',
  'Bouvet Island': 'Antarctica/Troll',
  'Heard Island and McDonald Islands': 'Antarctica/Macquarie',
  'South Georgia and the South Sandwich Islands': 'Atlantic/South_Georgia',
}

// Get timezone for a city based on country
function getTimezoneForCity(city) {
  const timezoneInfo = TIMEZONE_MAP[city.country]

  if (Array.isArray(timezoneInfo)) {
    // For countries with multiple timezones, use longitude to determine closest
    // This is a simplified approach - ideally you'd use a proper geolocation lookup
    return timezoneInfo[0] // Default to first timezone
  }

  return timezoneInfo || 'UTC'
}

// Calculate local time for a city using proper timezone
function getCityLocalTime(city) {
  const timezone = getTimezoneForCity(city)

  try {
    return new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    })
  } catch (error) {
    // Fallback if timezone is invalid
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
}

function MapController({ selectedCity, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCity) {
      // Stop any ongoing animation
      map.stop()

      // Check if mobile for different offset
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
      const latOffset = isMobile ? -0.1 : -0.05

      // Fly to city with small offset
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

export default function WeatherMap({ filteredCities, selectedCity, onCityClick }) {
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
        {filteredCities.map((city) => {
          const weather = city.weather
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
                    Local time: {getCityLocalTime(city)}
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
