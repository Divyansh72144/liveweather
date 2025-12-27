
import { getWeatherIconUrl, getWeatherDescription, WEATHER_CATEGORIES } from '../utils/weather'
import { useEffect, useRef, useState } from 'react'

export default function Sidebar({ sortedCities, sortBy, sortOrder, onSort, onCityClick, searchQuery, onSearchChange, weatherFilter, onWeatherFilterChange, sheetPosition, setSheetPosition }) {
  const sidebarRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const citiesListRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update position class when sheetPosition changes
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    // Remove all position classes
    sidebar.classList.remove('sheet-expanded', 'dragging')

    // Add current position class
    if (sheetPosition === 'expanded') {
      sidebar.classList.add('sheet-expanded')
    }
    // collapsed is default (no class)
  }, [sheetPosition, isMobile])

  // Expand when scrolling in cities list
  useEffect(() => {
    const citiesList = citiesListRef.current
    if (!citiesList || !isMobile) return

    let isScrolling = false
    let scrollTimeout = null

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true
        // Expand when user scrolls
        setSheetPosition('expanded')
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrolling = false
      }, 150)
    }

    citiesList.addEventListener('scroll', handleScroll)
    return () => {
      citiesList.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isMobile])

  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    const dragHandle = sidebar.querySelector('.mobile-drag-handle')
    if (!dragHandle) return

    let isDragging = false
    let startY = 0
    let currentTranslateY = 0

    const getPositionHeight = (position) => {
      switch(position) {
        case 'expanded': return 0
        case 'collapsed': return 280
        default: return 280
      }
    }

    const snapToPosition = (position) => {
      setSheetPosition(position)
      sidebar.classList.remove('dragging')
    }

    const handleDragStart = (clientY) => {
      isDragging = true
      startY = clientY

      // Get current translate Y value
      const style = window.getComputedStyle(sidebar)
      const matrix = new WebKitCSSMatrix(style.transform)
      currentTranslateY = matrix.m42

      sidebar.classList.add('dragging')
    }

    const handleDragMove = (clientY) => {
      if (!isDragging) return

      const deltaY = clientY - startY
      const newTranslateY = currentTranslateY + deltaY

      // Constrain dragging
      const minTranslate = 0 // fully expanded (can't go above)
      const maxTranslate = window.innerHeight - 280 // fully collapsed (can't go below)

      const constrainedTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslateY))
      sidebar.style.transform = `translateY(${constrainedTranslateY}px)`
    }

    const handleDragEnd = (clientY, velocity) => {
      if (!isDragging) return
      isDragging = false

      const style = window.getComputedStyle(sidebar)
      const matrix = new WebKitCSSMatrix(style.transform)
      const currentY = Math.abs(matrix.m42)

      // Detect positions
      const collapsedY = getPositionHeight('collapsed')
      const expandedY = getPositionHeight('expanded')

      // Calculate velocity for flick detection
      const velocityThreshold = 0.3

      // If flicking up fast
      if (velocity < -velocityThreshold) {
        snapToPosition('expanded')
        return
      }

      // If flicking down fast
      if (velocity > velocityThreshold) {
        snapToPosition('collapsed')
        return
      }

      // Find nearest position
      const distCollapsed = Math.abs(currentY - collapsedY)
      const distExpanded = Math.abs(currentY - expandedY)

      if (distCollapsed < distExpanded) {
        snapToPosition('collapsed')
      } else {
        snapToPosition('expanded')
      }
    }

    // Touch events
    let touchStartY = 0
    let touchStartTime = 0

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      handleDragStart(touchStartY)
    }

    const handleTouchMove = (e) => {
      handleDragMove(e.touches[0].clientY)
    }

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndTime = Date.now()
      const deltaTime = touchEndTime - touchStartTime
      const velocity = (touchEndY - touchStartY) / deltaTime

      handleDragEnd(touchEndY, velocity)
    }

    // Mouse events
    let mouseStartY = 0
    let mouseStartTime = 0

    const handleMouseDown = (e) => {
      mouseStartY = e.clientY
      mouseStartTime = Date.now()
      handleDragStart(mouseStartY)
    }

    const handleMouseMove = (e) => {
      handleDragMove(e.clientY)
    }

    const handleMouseUp = (e) => {
      const mouseEndTime = Date.now()
      const deltaTime = mouseEndTime - mouseStartTime
      const velocity = (e.clientY - mouseStartY) / deltaTime

      handleDragEnd(e.clientY, velocity)
    }

    dragHandle.addEventListener('touchstart', handleTouchStart, { passive: true })
    dragHandle.addEventListener('touchmove', handleTouchMove, { passive: true })
    dragHandle.addEventListener('touchend', handleTouchEnd)
    dragHandle.addEventListener('mousedown', handleMouseDown)

    return () => {
      dragHandle.removeEventListener('touchstart', handleTouchStart)
      dragHandle.removeEventListener('touchmove', handleTouchMove)
      dragHandle.removeEventListener('touchend', handleTouchEnd)
      dragHandle.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isMobile, sheetPosition])

  return (
    <aside
      ref={sidebarRef}
      className="sidebar"
    >
      {/* Mobile drag handle indicator */}
      <div className="mobile-drag-handle"></div>

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

      <div className="cities-list" ref={citiesListRef}>
        {sortedCities.map(city => (
          <div
            key={city.id}
            className="city-list-item"
            onClick={() => {
              onCityClick(city)
              if (isMobile && setSheetPosition) {
                setSheetPosition('collapsed')
              }
            }}
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
