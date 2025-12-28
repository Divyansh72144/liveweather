
import { getWeatherIconUrl, getWeatherDescription, WEATHER_CATEGORIES } from '../utils/weather'
import { useEffect, useRef, useState } from 'react'

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

  // Update position class when sheetPosition changes
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    sidebar.classList.remove('sheet-expanded', 'dragging')
    if (sheetPosition === 'expanded') {
      sidebar.classList.add('sheet-expanded')
    }
  }, [sheetPosition, isMobile])

  // Handle drag to expand/collapse
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    const dragHandle = sidebar.querySelector('.mobile-drag-handle')
    if (!dragHandle) return

    let startY = 0
    let currentY = 0
    let isDragging = false
    const COLLAPSED_HEIGHT = 320

    const handleStart = (clientY) => {
      isDragging = true
      startY = clientY
      currentY = clientY
      sidebar.classList.add('dragging')
    }

    const handleMove = (clientY) => {
      if (!isDragging) return

      currentY = clientY
      const deltaY = clientY - startY
      const maxDrag = window.innerHeight - COLLAPSED_HEIGHT

      // Calculate visual position
      let translateY
      if (sheetPosition === 'collapsed') {
        // Starting from collapsed (at bottom), dragging up (negative delta)
        translateY = Math.max(-maxDrag, Math.min(0, -deltaY))
        sidebar.style.transform = `translateY(calc(100% - ${COLLAPSED_HEIGHT}px + ${translateY}px))`
      } else {
        // Starting from expanded (at top), dragging down (positive delta)
        translateY = Math.max(0, Math.min(maxDrag, deltaY))
        sidebar.style.transform = `translateY(${translateY}px)`
      }
    }

    const handleEnd = () => {
      if (!isDragging) return
      isDragging = false
      sidebar.classList.remove('dragging')
      sidebar.style.transform = ''

      // Determine action based on drag distance and direction
      const deltaTotal = currentY - startY
      const threshold = 30 // minimum drag distance (lower for better UX)

      if (sheetPosition === 'collapsed') {
        // Drag up from collapsed to expand
        if (deltaTotal < -threshold) {
          setSheetPosition('expanded')
        }
      } else {
        // Drag down from expanded to collapse
        if (deltaTotal > threshold) {
          setSheetPosition('collapsed')
        }
      }
    }

    const onTouchStart = (e) => {
      handleStart(e.touches[0].clientY)
    }

    const onTouchMove = (e) => {
      if (!isDragging) return
      handleMove(e.touches[0].clientY)
    }

    const onTouchEnd = () => {
      handleEnd()
    }

    const onMouseDown = (e) => {
      handleStart(e.clientY)
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      handleMove(e.clientY)
    }

    const onMouseUp = () => {
      handleEnd()
    }

    dragHandle.addEventListener('touchstart', onTouchStart, { passive: true })
    dragHandle.addEventListener('touchmove', onTouchMove, { passive: true })
    dragHandle.addEventListener('touchend', onTouchEnd)
    dragHandle.addEventListener('mousedown', onMouseDown)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      dragHandle.removeEventListener('touchstart', onTouchStart)
      dragHandle.removeEventListener('touchmove', onTouchMove)
      dragHandle.removeEventListener('touchend', onTouchEnd)
      dragHandle.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Swipe down on sheet to close (when expanded)
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    let touchStartY = 0
    let isSwiping = false

    const onTouchStart = (e) => {
      // Only track if sheet is expanded and touch is near top
      if (sheetPosition === 'expanded') {
        const touch = e.touches[0]
        touchStartY = touch.clientY
        isSwiping = true
      }
    }

    const onTouchMove = (e) => {
      if (!isSwiping || sheetPosition !== 'expanded') return

      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartY

      // Only if swiping down from top area
      if (deltaY > 50 && touch.clientY < 150) {
        isSwiping = false
        setSheetPosition('collapsed')
      }
    }

    const onTouchEnd = () => {
      isSwiping = false
    }

    sidebar.addEventListener('touchstart', onTouchStart, { passive: true })
    sidebar.addEventListener('touchmove', onTouchMove, { passive: true })
    sidebar.addEventListener('touchend', onTouchEnd)

    return () => {
      sidebar.removeEventListener('touchstart', onTouchStart)
      sidebar.removeEventListener('touchmove', onTouchMove)
      sidebar.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Swipe up to expand (more sensitive) - works anywhere in sidebar
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar || !isMobile) return

    let touchStartY = 0
    let isSwipeUp = false

    const onTouchStart = (e) => {
      if (sheetPosition === 'collapsed') {
        const touch = e.touches[0]
        touchStartY = touch.clientY
        isSwipeUp = true
      }
    }

    const onTouchMove = (e) => {
      if (!isSwipeUp || sheetPosition !== 'collapsed') return

      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartY

      // Swipe up (negative deltaY) - more sensitive, lower threshold
      if (deltaY < -20) {
        isSwipeUp = false
        setSheetPosition('expanded')
      }
    }

    const onTouchEnd = () => {
      isSwipeUp = false
    }

    sidebar.addEventListener('touchstart', onTouchStart, { passive: true })
    sidebar.addEventListener('touchmove', onTouchMove, { passive: true })
    sidebar.addEventListener('touchend', onTouchEnd)

    return () => {
      sidebar.removeEventListener('touchstart', onTouchStart)
      sidebar.removeEventListener('touchmove', onTouchMove)
      sidebar.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Expand on click (when collapsed) - cities list and search area
  useEffect(() => {
    if (!isMobile || sheetPosition === 'expanded') return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const citiesList = sidebar.querySelector('.cities-list')
    const searchContainer = sidebar.querySelector('.search-container')
    const searchInput = sidebar.querySelector('.search-input')

    const expandSheet = (e) => {
      // Don't expand if clicking on interactive elements (except search input background)
      if (e.target.closest('button') || e.target.closest('.city-list-item')) {
        return
      }
      if (sheetPosition === 'collapsed') {
        setSheetPosition('expanded')
      }
    }

    const expandOnFocus = () => {
      if (sheetPosition === 'collapsed') {
        setSheetPosition('expanded')
      }
    }

    // Add click handlers to expandable areas
    if (citiesList) {
      citiesList.addEventListener('click', expandSheet)
    }
    if (searchContainer) {
      searchContainer.addEventListener('click', expandSheet)
    }

    // Expand when search input is focused
    if (searchInput) {
      searchInput.addEventListener('focus', expandOnFocus)
    }

    return () => {
      if (citiesList) {
        citiesList.removeEventListener('click', expandSheet)
      }
      if (searchContainer) {
        searchContainer.removeEventListener('click', expandSheet)
      }
      if (searchInput) {
        searchInput.removeEventListener('focus', expandOnFocus)
      }
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  // Expand on scroll (when collapsed)
  useEffect(() => {
    const list = citiesListRef.current
    if (!list || !isMobile) return

    const onScroll = () => {
      // If user tries to scroll while collapsed, expand
      if (sheetPosition === 'collapsed') {
        setSheetPosition('expanded')
      }
    }

    list.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      list.removeEventListener('scroll', onScroll)
    }
  }, [isMobile, sheetPosition, setSheetPosition])

  const handleCityClick = (city) => {
    onCityClick(city)
    if (isMobile) {
      setSheetPosition('collapsed')
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && sheetPosition === 'expanded' && (
        <div
          className="mobile-backdrop"
          onClick={() => setSheetPosition('collapsed')}
        />
      )}

      <aside ref={sidebarRef} className="sidebar">
        {/* Mobile drag handle */}
        <div className="mobile-drag-handle"></div>

        {/* Close button when expanded */}
        {isMobile && sheetPosition === 'expanded' && (
          <button
            className="mobile-close-button"
            onClick={() => setSheetPosition('collapsed')}
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
            onClick={() => handleCityClick(city)}
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
    </>
  )
}
