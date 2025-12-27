import { useState, useEffect, useMemo } from 'react'
import './App.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { CITIES } from './data/cities.js'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import WeatherMap from './components/WeatherMap'
import { getWeatherCategory } from './utils/weather'

const BACKEND_API = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000'

function App() {
  const [sheetPosition, setSheetPosition] = useState('collapsed') // collapsed, half, expanded
  const [weatherData, setWeatherData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [weatherFilter, setWeatherFilter] = useState('all')

  useEffect(() => {
    const fetchAllWeather = async () => {
      try {
        const response = await fetch(`${BACKEND_API}/weather`)
        const result = await response.json()

        console.log(`Data source: ${result.source}, cities: ${Object.keys(result.data).length}`)
        setWeatherData(result.data)
        setLoading(false)
        console.log(`✅ Loaded: ${Object.keys(result.data).length} cities from backend cache`)
      } catch (err) {
        console.error('Error fetching weather:', err)
        setLoading(false)
      }
    }

    // Single fetch on mount - backend handles caching and refresh
    fetchAllWeather()
  }, [])

  // Sort and filter cities based on selected criteria and search query
  const sortedCities = useMemo(() => {
    const citiesWithWeather = CITIES.map((city) => ({
      ...city,
      weather: weatherData[city.id] || null
    })).filter(city => city.weather)

    // Apply search filter
    let filteredCities = searchQuery
      ? citiesWithWeather.filter(city =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : citiesWithWeather

    // Apply weather filter
    if (weatherFilter !== 'all') {
      filteredCities = filteredCities.filter(city =>
        getWeatherCategory(city.weather.weatherCode) === weatherFilter
      )
    }

    return [...filteredCities].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortBy === 'country') {
        return sortOrder === 'asc'
          ? a.country.localeCompare(b.country)
          : b.country.localeCompare(a.country)
      }
      if (sortBy === 'temp') {
        return sortOrder === 'asc'
          ? a.weather.temperature - b.weather.temperature
          : b.weather.temperature - a.weather.temperature
      }
      if (sortBy === 'wind') {
        const windA = a.weather.windSpeed || 0
        const windB = b.weather.windSpeed || 0
        return sortOrder === 'asc' ? windA - windB : windB - windA
      }
      return 0
    })
  }, [weatherData, sortBy, sortOrder, searchQuery, weatherFilter])

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(criteria)
      setSortOrder('desc')
    }
  }

  const handleCityClick = (city) => {
    setSelectedCity(city)
  }

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />

      <Sidebar
        sortedCities={sortedCities}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onCityClick={handleCityClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        weatherFilter={weatherFilter}
        onWeatherFilterChange={setWeatherFilter}
        sheetPosition={sheetPosition}
        setSheetPosition={setSheetPosition}
      />

      <WeatherMap
        weatherData={weatherData}
        selectedCity={selectedCity}
        onCityClick={handleCityClick}
      />
    </div>
  )
}

export default App
