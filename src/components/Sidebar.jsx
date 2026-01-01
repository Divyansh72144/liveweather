
import { getWeatherIconUrl, WEATHER_CATEGORIES } from '../utils/weather'
import { useEffect, useRef, useState } from 'react'
import { useDragGesture } from '../hooks/useDragGesture'
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import { useSheetInteractions } from '../hooks/useSheetInteractions'
import CityListItem from './CityListItem'

export default function Sidebar({ sortedCities, sortBy, sortOrder, onSort, onCityClick, searchQuery, onSearchChange, weatherFilter, onWeatherFilterChange, sheetPosition, setSheetPosition }) {
  const sidebarRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const citiesListRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent body scroll when sheet is expanded on mobile
  useEffect(() => {
    if (!isMobile) return

    if (sheetPosition === 'expanded') {
      document.body.classList.add('sheet-open')
    } else {
      document.body.classList.remove('sheet-open')
    }

    return () => {
      document.body.classList.remove('sheet-open')
    }
  }, [sheetPosition, isMobile])

  // Update position class when sheetPosition changes
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    sidebar.classList.remove('sheet-expanded', 'dragging')
    if (sheetPosition === 'expanded') {
      sidebar.classList.add('sheet-expanded')
    }
  }, [sheetPosition, isMobile])

  // Custom hooks for gesture handling
  useDragGesture(sidebarRef, isMobile, sheetPosition, setSheetPosition)
  useSwipeGesture(sidebarRef, citiesListRef, isMobile, sheetPosition, setSheetPosition)
  useSheetInteractions(sidebarRef, citiesListRef, isMobile, sheetPosition, setSheetPosition)

  const handleCityClick = (city) => {
    onCityClick(city)
    if (isMobile) {
      setSheetPosition('collapsed')
    }
  }

  const closeSheet = () => setSheetPosition('collapsed')

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && sheetPosition === 'expanded' && (
        <div className="mobile-backdrop" onClick={closeSheet} />
      )}

      <aside ref={sidebarRef} className="sidebar">
        {/* Mobile drag handle */}
        <div className="mobile-drag-handle"></div>

        {/* Close button when expanded */}
        {isMobile && sheetPosition === 'expanded' && (
          <button
            className="mobile-close-button"
            onClick={closeSheet}
            aria-label="Close"
          >
            ✕
          </button>
        )}

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
        {['name', 'country', 'temp', 'wind'].map((sortKey) => (
          <button
            key={sortKey}
            className={`sort-btn ${sortBy === sortKey ? 'active' : ''}`}
            onClick={() => onSort(sortKey)}
          >
            {sortKey.charAt(0).toUpperCase() + sortKey.slice(1)} {sortBy === sortKey && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        ))}
      </div>

      <div className="cities-list" ref={citiesListRef}>
        {sortedCities.map(city => (
          <CityListItem
            key={city.id}
            city={city}
            onClick={handleCityClick}
          />
        ))}
      </div>
    </aside>
    </>
  )
}
